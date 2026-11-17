import { RotateCcw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { plural } from "../utils/plural.js";

const MIN_STROKE_LENGTH = 250;
const MIN_STROKES = 1;
const READY_TO_CHECK_LENGTH = 120;

const traceRules = {
  ba: { dotSide: "below", dotCount: 1, body: "bowl" },
  ta: { dotSide: "above", dotCount: 2, body: "bowl" }
};

function getStrokeStats(points) {
  const safePoints = points.filter(Boolean);
  if (!safePoints.length) {
    return {
      points: [],
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      length: 0
    };
  }

  let minX = safePoints[0].x;
  let maxX = safePoints[0].x;
  let minY = safePoints[0].y;
  let maxY = safePoints[0].y;
  let length = 0;

  for (let index = 0; index < safePoints.length; index += 1) {
    const point = safePoints[index];
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);

    if (index > 0) {
      const previous = safePoints[index - 1];
      length += Math.hypot(point.x - previous.x, point.y - previous.y);
    }
  }

  return {
    points: safePoints,
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    length
  };
}

function estimateDotCount(stroke) {
  if (stroke.width > 28 || stroke.length > 36) return 2;
  return 1;
}

function evaluateBowlLetter(letterId, strokes, totalLength) {
  const rule = traceRules[letterId];
  const stats = strokes.map(getStrokeStats).filter((stroke) => stroke.points.length);
  const bodyCandidates = stats
    .filter((stroke) => stroke.length >= 160 && stroke.width >= 100 && stroke.width > stroke.height * 1.15 && stroke.height >= 20 && stroke.height <= 135)
    .sort((a, b) => b.length - a.length);
  const body = bodyCandidates[0];

  if (!body) {
    return {
      passed: false,
      score: Math.min(55, Math.round((totalLength / MIN_STROKE_LENGTH) * 48)),
      message: "Сначала напиши широкую основную линию буквы, как в образце."
    };
  }

  const edgeGap = Math.max(12, body.height * 0.2);
  const hasBowl = body.maxY - body.points[0].y >= edgeGap
    && body.maxY - body.points.at(-1).y >= edgeGap;
  if (!hasBowl || totalLength < MIN_STROKE_LENGTH) {
    return { passed: false, score: 55, message: "Проведи широкую изогнутую линию: середина ниже обоих краёв. Затем добавь точки." };
  }

  const dotZoneGap = Math.max(18, body.height * 0.28);
  const dotCandidates = stats.filter((stroke) => {
    const compact = stroke.length <= 90 && stroke.width <= 78 && stroke.height <= 78;
    const nearBodyX = stroke.centerX >= body.minX - 80 && stroke.centerX <= body.maxX + 80;
    const correctSide = rule.dotSide === "below"
      ? stroke.centerY > body.maxY + dotZoneGap
      : stroke.centerY < body.minY - dotZoneGap;
    return compact && nearBodyX && correctSide;
  });
  const dotCount = dotCandidates.reduce((count, stroke) => count + estimateDotCount(stroke), 0);

  const extraStrokes = stats.filter((stroke) => {
    if (stroke === body || dotCandidates.includes(stroke)) return false;
    const tiny = stroke.length < 32 && stroke.width < 28 && stroke.height < 28;
    return !tiny;
  });
  const verticalExtra = extraStrokes.some((stroke) => stroke.length > 75 && stroke.height > stroke.width * 1.75);
  const tooManyLongStrokes = extraStrokes.some((stroke) => stroke.length > 90);

  let score = 45;
  score += Math.min(25, Math.round((body.length / MIN_STROKE_LENGTH) * 25));
  score += Math.min(25, Math.round((dotCount / rule.dotCount) * 25));
  if (!extraStrokes.length) score += 5;
  if (verticalExtra || tooManyLongStrokes) score -= 35;

  if (verticalExtra || tooManyLongStrokes) {
    return {
      passed: false,
      score: Math.max(35, Math.min(78, score)),
      message: "Вижу лишнюю линию рядом с буквой. Очисти и напиши только нужную букву."
    };
  }

  if (dotCount < rule.dotCount) {
    return {
      passed: false,
      score: Math.max(48, Math.min(82, score)),
      message: rule.dotSide === "below"
        ? "Почти готово. Добавь точку снизу, как у буквы Ба."
        : "Почти готово. Добавь две точки сверху, как у буквы Та."
    };
  }

  if (dotCount > rule.dotCount) {
    return {
      passed: false,
      score: Math.min(82, score),
      message: "Точек слишком много. Повтори букву по образцу."
    };
  }

  return {
    passed: true,
    score: 100,
    message: "Основная форма и точки похожи на образец. Сверь почерк с учителем."
  };
}

function evaluateTrace(letter, strokes, totalLength) {
  if (traceRules[letter.id]) return evaluateBowlLetter(letter.id, strokes, totalLength);

  const passed = totalLength >= MIN_STROKE_LENGTH;
  return {
    passed,
    score: Math.min(100, Math.round((totalLength / MIN_STROKE_LENGTH) * 100)),
    message: passed ? "Молодец! Отлично написал!" : "Напиши букву подольше — веди карандаш медленно."
  };
}

export default function TraceLetterGame({ letter, onComplete }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef([]);
  const strokeLengthRef = useRef(0);
  const currentStrokeLengthRef = useRef(0);
  const lastPointRef = useRef(null);
  const strokeCountRef = useRef(0);
  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const [canFinish, setCanFinish] = useState(false);
  const [progress, setProgress] = useState(0);

  const requiredStrokes = traceRules[letter.id]?.dotCount ? traceRules[letter.id].dotCount + 1 : MIN_STROKES;

  function updateTraceState(nextStrokes = strokesRef.current) {
    const result = evaluateTrace(letter, nextStrokes, strokeLengthRef.current);
    const readyToCheck = strokeLengthRef.current >= READY_TO_CHECK_LENGTH || nextStrokes.length >= requiredStrokes;
    setProgress(result.score);
    setCanFinish(readyToCheck);
    return result;
  }

  function getPoint(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDrawing(event) {
    event.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);
    context.strokeStyle = "#006F3D";
    context.lineWidth = 14;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.fillStyle = context.strokeStyle;
    context.beginPath();
    context.arc(point.x, point.y, 7, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(point.x, point.y);
    lastPointRef.current = point;
    activeStrokeRef.current = [point];
    currentStrokeLengthRef.current = 0;
    setDrawing(true);
    setMessage("");
  }

  function draw(event) {
    event.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    activeStrokeRef.current.push(point);

    if (lastPointRef.current) {
      const dx = point.x - lastPointRef.current.x;
      const dy = point.y - lastPointRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      strokeLengthRef.current += dist;
      currentStrokeLengthRef.current += dist;

      updateTraceState([...strokesRef.current, activeStrokeRef.current]);
    }
    lastPointRef.current = point;
  }

  function endDrawing(event) {
    if (!drawing) return;
    event.preventDefault();
    if (currentStrokeLengthRef.current > 20) {
      strokeCountRef.current += 1;
    }
    if (activeStrokeRef.current.length) {
      strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
      activeStrokeRef.current = [];
      updateTraceState();
    }
    lastPointRef.current = null;
    setDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    activeStrokeRef.current = [];
    strokeLengthRef.current = 0;
    currentStrokeLengthRef.current = 0;
    strokeCountRef.current = 0;
    lastPointRef.current = null;
    setMessage("");
    setCanFinish(false);
    setProgress(0);
  }

  function finishTrace() {
    if (!canFinish) {
      setMessage(
        strokeLengthRef.current < MIN_STROKE_LENGTH
          ? "Напиши букву подольше — веди карандаш медленно"
          : `Напиши ещё ${requiredStrokes - strokeCountRef.current} ${plural(requiredStrokes - strokeCountRef.current, "штрих", "штриха", "штрихов")}`
      );
      return;
    }
    const result = updateTraceState();
    if (!result.passed) {
      setMessage(result.message);
      return;
    }
    setMessage(result.message);
    onComplete();
  }

  return (
    <div className="game-content trace-game">
      <h3>Напиши букву «{letter.nameRu}»</h3>

      <div className="trace-progress-row">
        <div className="trace-progress-bar" aria-label={`Прогресс: ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="trace-progress-label">{progress}%</span>
      </div>

      <div className="trace-pad">
        <span>{letter.letter}</span>
        <canvas
          ref={canvasRef}
          width="620"
          height="320"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={endDrawing}
          onPointerLeave={endDrawing}
          style={{ touchAction: "none" }}
        />
      </div>

      <div className="game-actions">
        <button className="button button--soft" type="button" onClick={clearCanvas}>
          <Trash2 size={17} aria-hidden="true" />
          Очистить
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={finishTrace}
          disabled={!canFinish}
          style={{ opacity: canFinish ? 1 : 0.55 }}
        >
          Я написал
        </button>
        <button className="button button--ghost" type="button" onClick={clearCanvas}>
          <RotateCcw size={17} aria-hidden="true" />
          Повторить
        </button>
      </div>
      {message ? <p className="game-message">{message}</p> : null}
    </div>
  );
}
