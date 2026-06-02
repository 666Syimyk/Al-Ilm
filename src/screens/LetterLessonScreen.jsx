import { ArrowRight, Check, Gift, Lock, Mic, Play, Sparkles, Star, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import { FloatingParticles, GameButton, GameLessonLayout, GameTransition, RewardPopup, TopBar, XPBar } from "../components/GameLessonUI.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { arabicLetters, getLetterById, getNextLetterId } from "../data/arabicLetters.js";
import { canOpenLessonNode, getLessonNodeByType, getLessonNodesForLetter, getLetterRewardNodeId } from "../data/lessonPath.js";
import { speakText, stopAllAudio } from "../utils/audioPlayback.js";
import { completeLessonNode, getLessonPathState, getProgress, getSelectedCharacter, setProgress } from "../utils/storage.js";

const LETTER_PROGRESS_KEY = "letterLessonProgress:v1";
const PASS_SCORE = 80;
const TRACE_READY_PROGRESS = 60;

const voiceAliases = {
  alif: ["алиф", "алеф", "alif"],
  ba: ["ба", "ba"],
  ta: ["та", "ta"],
  tha: ["са", "тха", "tha"],
  jim: ["джим", "jim"],
  ha_guttural: ["ха", "ha"],
  kha: ["хо", "ха", "кха", "kha"],
  dal: ["даль", "дал", "dal"],
  dhal: ["заль", "зал", "dhal"],
  ra: ["ра", "ra"],
  zay: ["зай", "zay"],
  sin: ["син", "sin"],
  shin: ["шин", "shin"],
  sad: ["сад", "sad"],
  dad: ["дад", "dad"],
  ta_emphatic: ["та", "ta"],
  za_emphatic: ["за", "za"],
  ayn: ["айн", "ain"],
  ghayn: ["гайн", "ghain"],
  fa: ["фа", "fa"],
  qaf: ["каф", "коф", "qaf"],
  kaf: ["кяф", "каф", "kaf"],
  lam: ["лям", "лам", "lam"],
  mim: ["мим", "mim"],
  nun: ["нун", "nun"],
  ha_soft: ["ха", "ha"],
  waw: ["вав", "уау", "waw"],
  ya: ["йа", "я", "ya"]
};

const lessonAudioPrompts = {
  alif: "أَ",
  ba: "بَ",
  ta: "تَ",
  tha: "ثَ",
  jim: "جَ",
  ha_guttural: "حَ",
  kha: "خَ",
  dal: "دَ",
  dhal: "ذَ",
  ra: "رَ",
  zay: "زَ",
  sin: "سَ",
  shin: "شَ",
  sad: "صَ",
  dad: "ضَ",
  ta_emphatic: "طَ",
  za_emphatic: "ظَ",
  ayn: "عَ",
  ghayn: "غَ",
  fa: "فَ",
  qaf: "قَ",
  kaf: "كَ",
  lam: "لَ",
  mim: "مَ",
  nun: "نَ",
  ha_soft: "هَ",
  waw: "وَ",
  ya: "يَ"
};

const legacyTaskTemplates = [
  { id: "look", number: 1, title: "Посмотри букву", description: "Узнай, как выглядит буква" },
  { id: "sound", number: 2, title: "Прослушай звук", description: "Послушай и повтори" },
  { id: "voice", number: 3, title: "Произнеси вслух", description: "Скажи букву и проверь себя" },
  { id: "find", number: 4, title: "Найди букву", description: "Найди букву среди других" },
  { id: "trace", number: 5, title: "Обведи букву", description: "Проведи пальцем или мышкой" },
  { id: "quiz", number: 6, title: "Проверка", description: "Ответь минимум на 80%" },
  { id: "reward", number: 7, title: "Награда", description: "Получить звёзды и открыть дальше" }
];

const taskTemplates = [
  { id: "look", number: 1, title: "Слушай букву", description: "Прослушай произношение 3 раза" },
  { id: "sound", number: 2, title: "Поймай букву", description: "Лови только нужную букву" },
  { id: "voice", number: 3, title: "Нарисуй букву", description: "Проведи золотую линию" },
  { id: "find", number: 4, title: "Собери букву", description: "Поставь части на места" },
  { id: "trace", number: 5, title: "Произнеси букву", description: "Проверь произношение" },
  { id: "quiz", number: 6, title: "Найди букву в слове", description: "Отметь все нужные буквы" },
  { id: "reward", number: 7, title: "Мини-экзамен", description: "Заверши серию и открой сундук" }
];

function readProgressMap() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LETTER_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeProgressMap(map) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LETTER_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // Keep the lesson usable when storage is blocked.
  }
}

function getLessonAudioText(letter) {
  const text = lessonAudioPrompts[letter.id] || letter.letter || letter.soundText;
  return text || "";
}

function speakLessonLetter(letter, options = {}) {
  return speakText(getLessonAudioText(letter), {
    lang: "ar-SA",
    rate: options.rate || 0.68,
    pitch: 1.03,
    onEnd: options.onEnd
  });
}

function normalizeSpeech(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getExpectedVoiceAnswers(letter) {
  return Array.from(new Set([
    normalizeSpeech(letter.soundText),
    normalizeSpeech(letter.nameRu),
    ...(voiceAliases[letter.id] || []).map(normalizeSpeech)
  ].filter(Boolean)));
}

function getLetterNode(letterNodes) {
  return letterNodes.find((node) => node.type === "letter");
}

function getSoundNode(letterNodes) {
  return letterNodes.find((node) => node.type === "sound")
    || letterNodes.find((node) => node.gameType === "listen");
}

function getFindNode(letterNodes) {
  return letterNodes.find((node) => node.gameType === "find-letter");
}

function getTraceNode(letterNodes) {
  return letterNodes.find((node) => node.type === "writing" || node.gameType === "trace");
}

function getRewardNode(letterNodes) {
  return letterNodes.find((node) => node.type === "reward");
}

function inferCompletedTasks(letterNodes, lessonState) {
  const completedNodes = lessonState.completedLessonNodes || [];
  const completedTasks = new Set();
  const letterNode = getLetterNode(letterNodes);
  const soundNode = getSoundNode(letterNodes);
  const findNode = getFindNode(letterNodes);
  const traceNode = getTraceNode(letterNodes);
  const rewardNode = getRewardNode(letterNodes);

  if (letterNode && completedNodes.includes(letterNode.id)) completedTasks.add("look");
  if (soundNode && completedNodes.includes(soundNode.id)) completedTasks.add("sound");
  if (findNode && completedNodes.includes(findNode.id)) completedTasks.add("find");
  if (traceNode && completedNodes.includes(traceNode.id)) completedTasks.add("trace");

  const practiceNodes = letterNodes.filter((node) => !["letter", "sound", "reward"].includes(node.type));
  if (practiceNodes.length > 0 && practiceNodes.every((node) => completedNodes.includes(node.id))) {
    completedTasks.add("quiz");
  }

  if (rewardNode && completedNodes.includes(rewardNode.id)) {
    taskTemplates.forEach((task) => completedTasks.add(task.id));
  }

  return Array.from(completedTasks);
}

function getInitialProgress(letter, letterNodes) {
  const saved = readProgressMap()[letter.id] || {};
  const inferred = inferCompletedTasks(letterNodes, getLessonPathState());
  const completedTasks = Array.from(new Set([...(saved.completedTasks || []), ...inferred]));
  const currentTaskId = resolveCurrentTaskId(completedTasks, saved.currentTaskId);

  return {
    completedTasks,
    currentTaskId,
    score: saved.score || 0,
    quizScore: saved.quizScore ?? null,
    traceProgress: saved.traceProgress || 0
  };
}

function saveLetterProgress(letterId, progress) {
  const map = readProgressMap();
  writeProgressMap({
    ...map,
    [letterId]: {
      ...progress,
      updatedAt: new Date().toISOString()
    }
  });
}

function isLetterCompletedLocally(letterId) {
  const saved = readProgressMap()[letterId];
  const completedLetters = getProgress().completedLetters || [];
  return completedLetters.includes(letterId) || saved?.completedTasks?.includes("reward");
}

function canOpenSequentialLetter(letterId) {
  const letterIndex = arabicLetters.findIndex((item) => item.id === letterId);
  if (letterIndex <= 0) return true;
  if (isLetterCompletedLocally(letterId)) return true;
  const previousLetter = arabicLetters[letterIndex - 1];
  return Boolean(previousLetter && isLetterCompletedLocally(previousLetter.id));
}

function resolveCurrentTaskId(completedTasks, preferredTaskId) {
  if (preferredTaskId && !completedTasks.includes(preferredTaskId)) return preferredTaskId;
  return taskTemplates.find((task) => !completedTasks.includes(task.id))?.id || "reward";
}

function getTaskStatus(taskId, completedTasks) {
  if (completedTasks.includes(taskId)) return "completed";
  const firstOpen = taskTemplates.find((task) => !completedTasks.includes(task.id));
  return firstOpen?.id === taskId ? "available" : "locked";
}

function getChoiceLetters(letter) {
  const index = arabicLetters.findIndex((item) => item.id === letter.id);
  const ordered = [
    letter,
    ...arabicLetters.slice(index + 1),
    ...arabicLetters.slice(0, index)
  ];
  return ordered.slice(0, 4);
}

function buildQuiz(letter) {
  const choices = getChoiceLetters(letter);
  const names = choices.map((item) => item.nameRu);
  const sounds = Array.from(new Set([letter.soundText, ...names])).slice(0, 4);

  return [
    {
      id: "shape",
      title: `Какая из этих букв ${letter.nameRu}?`,
      options: choices.map((item) => item.letter),
      answer: letter.letter
    },
    {
      id: "sound",
      title: "Как звучит эта буква?",
      options: sounds,
      answer: letter.soundText
    },
    {
      id: "find",
      title: "Найди букву среди других.",
      options: [...choices].reverse().map((item) => item.letter),
      answer: letter.letter
    },
    {
      id: "listen",
      title: "Прослушай звук и выбери букву.",
      options: choices.map((item) => item.letter),
      answer: letter.letter,
      listen: true
    },
    {
      id: "name",
      title: `Выбери название буквы ${letter.letter}`,
      options: names,
      answer: letter.nameRu
    }
  ];
}

function LetterHintBlock({ letter }) {
  const hints = [
    letter.soundHint ? { label: "Звук", value: letter.soundHint } : null,
    letter.articulationHint ? { label: "Как произнести", value: letter.articulationHint } : null,
    letter.differenceHint ? { label: "Не перепутай", value: letter.differenceHint } : null
  ].filter(Boolean);

  if (!hints.length) return null;

  return (
    <div className="letter-hint-block" aria-label="Подсказки произношения">
      {hints.map((hint) => (
        <span key={hint.label}>
          <strong>{hint.label}</strong>
          {hint.value}
        </span>
      ))}
    </div>
  );
}

function completeLegacyNode(node) {
  if (!node) return false;
  const state = getLessonPathState();
  if (state.completedLessonNodes.includes(node.id)) return true;
  if (!canOpenLessonNode(node.id, state)) return false;
  const result = completeLessonNode(node.id);
  return !result.blocked;
}

function completeLegacyPracticeBeforeReward(letterNodes) {
  for (const node of letterNodes) {
    if (node.type === "reward") break;
    completeLegacyNode(node);
  }
}

function getNextLetterPath(letterId) {
  const nextLetterId = getNextLetterId(letterId);
  return nextLetterId && nextLetterId !== letterId ? `/letter/${nextLetterId}` : "/lessons";
}

function awardLetterReward(letterId, shouldFallbackPoints) {
  const saved = readProgressMap()[letterId];
  if (saved?.rewardClaimed) return {};

  const progress = getProgress();
  const nextPoints = progress.points + (shouldFallbackPoints ? 20 : 0);
  const nextCoins = progress.coins + (shouldFallbackPoints ? 5 : 0);
  const completedLetters = progress.completedLetters.includes(letterId)
    ? progress.completedLetters
    : [...progress.completedLetters, letterId];

  setProgress({
    ...progress,
    completedLetters,
    points: nextPoints,
    coins: nextCoins,
    stars: (progress.stars || 0) + 3,
    level: Math.max(1, Math.floor(nextPoints / 150) + 1),
    currentLesson: getNextLetterId(letterId)
  });

  return { rewardClaimed: true, awardedStars: 3 };
}

function GameStage({ letter, title, subtitle, hearts, combo, xp, timeLeft, children, reward, transition }) {
  return (
    <GameLessonLayout>
      <FloatingParticles count={18} />
      <TopBar title={title} subtitle={subtitle || `Буква ${letter.nameRu}`} combo={combo} timeLeft={timeLeft} />
      <XPBar value={xp} max={100} />
      <div className="game-stage">{children}</div>
      <RewardPopup show={Boolean(reward)} title={reward?.title} xp={reward?.xp || 0} coins={reward?.coins || 0} />
      <GameTransition label={transition} />
    </GameLessonLayout>
  );
}

function ListenLetterStage({ letter, character, onComplete }) {
  const [repeatCount, setRepeatCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const fallbackTimerRef = useRef(null);

  useEffect(() => () => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
  }, []);

  function play() {
    if (repeatCount >= 3 || isPlaying) return;
    setIsPlaying(true);

    const finish = () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setIsPlaying(false);
      setRepeatCount((current) => {
        const next = Math.min(3, current + 1);
        if (next >= 3 && !done) {
          setDone(true);
          window.setTimeout(() => onComplete("look", { score: 15 }), 500);
        }
        return next;
      });
    };

    speakLessonLetter(letter, { onEnd: finish });
    fallbackTimerRef.current = window.setTimeout(finish, 1600);
  }

  return (
    <GameStage letter={letter} title="Слушай букву" combo={repeatCount} xp={repeatCount * 5} reward={done ? { title: "Слух настроен", xp: 15 } : null}>
      <div className={`listen-game ${isPlaying ? "is-playing" : ""}`}>
        <CharacterHelper character={character} message={`Слушай мягко и повторяй: ${letter.soundText}.`} mood="teaching" compact />
        <div className="magic-letter-card">
          <span className="sound-wave sound-wave--left" />
          <strong>{letter.letter}</strong>
          <span className="sound-wave sound-wave--right" />
        </div>
        <div className="game-counter">Повторы {repeatCount} / 3</div>
        <GameButton icon={Volume2} onClick={play} disabled={repeatCount >= 3 || isPlaying}>
          {repeatCount >= 3 ? "Прослушано" : "Слушать"}
        </GameButton>
      </div>
    </GameStage>
  );
}

function CatchLetterStage({ letter, onComplete }) {
  const [items, setItems] = useState([]);
  const [basketX, setBasketX] = useState(50);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [caught, setCaught] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [popup, setPopup] = useState("");
  const doneRef = useRef(false);
  const basketXRef = useRef(50);

  useEffect(() => {
    const spawnTimer = window.setInterval(() => {
      setItems((current) => {
        const isTarget = Math.random() > 0.48;
        const pool = arabicLetters.filter((item) => item.id !== letter.id);
        const source = isTarget ? letter : pool[Math.floor(Math.random() * pool.length)];
        return [
          ...current.slice(-14),
          {
            key: `${Date.now()}-${Math.random()}`,
            id: source.id,
            glyph: source.letter,
            x: 8 + Math.random() * 84,
            y: -8,
            speed: 1.6 + Math.random() * 1.3
          }
        ];
      });
    }, 720);

    const fallTimer = window.setInterval(() => {
      setItems((current) => {
        const nextItems = [];
        for (const item of current) {
          const next = { ...item, y: item.y + item.speed };
          const hitsBasket = next.y > 76 && Math.abs(next.x - basketXRef.current) < 12;
          if (hitsBasket) {
            if (next.id === letter.id) {
              setCaught((value) => value + 1);
              setCombo((value) => value + 1);
              setXp((value) => Math.min(100, value + 10));
              setPopup("+10 XP");
            } else {
              setCombo(0);
              setHearts((value) => Math.max(0, value - 1));
              setPopup("-1 сердце");
            }
          } else if (next.y < 96) {
            nextItems.push(next);
          }
        }
        return nextItems;
      });
    }, 48);

    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => {
      window.clearInterval(spawnTimer);
      window.clearInterval(fallTimer);
      window.clearInterval(timer);
    };
  }, [letter]);

  useEffect(() => {
    if ((caught >= 8 || timeLeft === 0) && !doneRef.current) {
      doneRef.current = true;
      window.setTimeout(() => onComplete("sound", { score: Math.max(25, xp) }), 450);
    }
  }, [caught, timeLeft, xp, onComplete]);

  function moveBasket(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const nextX = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    basketXRef.current = nextX;
    setBasketX(nextX);
  }

  return (
    <GameStage letter={letter} title="Поймай букву" hearts={hearts} combo={combo} xp={xp} timeLeft={timeLeft} transition={popup}>
      <div className="catch-sky" onPointerMove={moveBasket} onPointerDown={moveBasket}>
        <div className="target-scroll">Лови только <strong>{letter.letter}</strong></div>
        {items.map((item) => (
          <span className={`falling-letter ${item.id === letter.id ? "is-target" : ""}`} key={item.key} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            {item.glyph}
          </span>
        ))}
        <div className="letter-basket" style={{ left: `${basketX}%` }} />
      </div>
    </GameStage>
  );
}

function DrawLetterStage({ letter, onComplete }) {
  const [points, setPoints] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const doneRef = useRef(false);

  function addPoint(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
    setPoints((current) => {
      const next = [...current, { x, y }];
      setProgress(Math.min(100, Math.round((next.length / 42) * 100)));
      return next;
    });
  }

  function draw(event) {
    if (!isDrawing) return;
    event.preventDefault();
    addPoint(event);
  }

  useEffect(() => {
    if (progress >= 80 && !doneRef.current) {
      doneRef.current = true;
      window.setTimeout(() => onComplete("voice", { traceProgress: progress, score: 35 }), 620);
    }
  }, [progress, onComplete]);

  return (
    <GameStage letter={letter} title="Нарисуй букву" combo={Math.floor(progress / 20)} xp={progress} reward={progress >= 80 ? { title: "Линия завершена", xp: 35 } : null}>
      <div className="draw-board" onPointerDown={(event) => { setIsDrawing(true); addPoint(event); }} onPointerMove={draw} onPointerUp={() => setIsDrawing(false)} onPointerLeave={() => setIsDrawing(false)}>
        <span className="draw-board__ghost">{letter.letter}</span>
        <span className="draw-board__start">Начни здесь</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
        </svg>
      </div>
      <div className="letter-task-progress"><i style={{ width: `${progress}%` }} /></div>
      <strong className="game-percent">{progress}%</strong>
    </GameStage>
  );
}

function AssembleLetterStage({ letter, onComplete }) {
  const targets = [
    { id: "left", x: 32, y: 62, rotate: -8 },
    { id: "center", x: 50, y: 56, rotate: 0 },
    { id: "right", x: 68, y: 62, rotate: 8 }
  ];
  const [pieces, setPieces] = useState(() => targets.map((target, index) => ({ ...target, x: 22 + index * 28, y: 84, placed: false })));
  const [dragId, setDragId] = useState(null);
  const [shakeId, setShakeId] = useState("");
  const doneRef = useRef(false);
  const completed = pieces.every((piece) => piece.placed);

  useEffect(() => {
    if (completed && !doneRef.current) {
      doneRef.current = true;
      window.setTimeout(() => onComplete("find", { score: 45 }), 650);
    }
  }, [completed, onComplete]);

  function movePiece(event) {
    if (!dragId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPieces((current) => current.map((piece) => piece.id === dragId ? { ...piece, x, y } : piece));
  }

  function endDrag() {
    if (!dragId) return;
    setPieces((current) => current.map((piece) => {
      if (piece.id !== dragId) return piece;
      const target = targets.find((item) => item.id === piece.id);
      const distance = Math.hypot(piece.x - target.x, piece.y - target.y);
      if (distance < 16) return { ...piece, x: target.x, y: target.y, placed: true };
      setShakeId(piece.id);
      window.setTimeout(() => setShakeId(""), 300);
      return piece;
    }));
    setDragId(null);
  }

  return (
    <GameStage letter={letter} title="Собери букву" combo={pieces.filter((piece) => piece.placed).length} xp={pieces.filter((piece) => piece.placed).length * 15} reward={completed ? { title: "Буква собрана", xp: 45 } : null}>
      <div className="puzzle-board" onPointerMove={movePiece} onPointerUp={endDrag} onPointerLeave={endDrag}>
        <span className={`puzzle-board__complete ${completed ? "is-complete" : ""}`}>{letter.letter}</span>
        {targets.map((target) => <span className="puzzle-slot" key={target.id} style={{ left: `${target.x}%`, top: `${target.y}%` }} />)}
        {pieces.map((piece) => (
          <button
            className={`puzzle-piece ${piece.placed ? "is-placed" : ""} ${shakeId === piece.id ? "is-shaking" : ""}`}
            key={piece.id}
            type="button"
            style={{ left: `${piece.x}%`, top: `${piece.y}%`, rotate: `${piece.rotate}deg` }}
            onPointerDown={() => !piece.placed && setDragId(piece.id)}
          >
            {letter.letter}
          </button>
        ))}
      </div>
    </GameStage>
  );
}

function PronounceLetterStage({ letter, onComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState("");
  const [attempts, setAttempts] = useState(0);

  function record() {
    if (isRecording) return;
    setIsRecording(true);
    setQuality("");
    window.setTimeout(() => {
      const nextAttempts = attempts + 1;
      const score = nextAttempts >= 2 ? "Отлично" : Math.random() > 0.45 ? "Почти правильно" : "Попробуй ещё раз";
      setAttempts(nextAttempts);
      setQuality(score);
      setIsRecording(false);
      if (score === "Отлично" || score === "Почти правильно") {
        window.setTimeout(() => onComplete("trace", { score: score === "Отлично" ? 60 : 50 }), 700);
      }
    }, 1500);
  }

  return (
    <GameStage letter={letter} title="Произнеси букву" combo={attempts} xp={quality === "Отлично" ? 60 : attempts * 12} reward={quality === "Отлично" ? { title: "Отличное произношение", xp: 60 } : null}>
      <div className={`voice-orb ${isRecording ? "is-recording" : ""}`}>
        <Mic size={54} aria-hidden="true" />
        <span />
        <span />
        <span />
      </div>
      <h2 className="game-stage-title">{letter.soundText}</h2>
      <GameButton icon={Mic} onClick={record} disabled={isRecording}>
        {isRecording ? "Слушаю..." : "Нажми и произнеси"}
      </GameButton>
      {quality ? <div className={`voice-quality voice-quality--${quality === "Отлично" ? "great" : quality === "Почти правильно" ? "ok" : "retry"}`}>{quality}</div> : null}
    </GameStage>
  );
}

function FindLetterInWordStage({ letter, onComplete }) {
  const wordLetters = useMemo(() => {
    const index = arabicLetters.findIndex((item) => item.id === letter.id);
    return [
      arabicLetters[(index + 2) % arabicLetters.length],
      letter,
      arabicLetters[(index + 5) % arabicLetters.length],
      letter,
      arabicLetters[(index + 8) % arabicLetters.length]
    ];
  }, [letter]);
  const targetIndexes = wordLetters.map((item, index) => item.id === letter.id ? index : -1).filter((index) => index >= 0);
  const [selected, setSelected] = useState([]);
  const [wrong, setWrong] = useState(-1);
  const done = targetIndexes.every((index) => selected.includes(index));

  useEffect(() => {
    if (done) window.setTimeout(() => onComplete("quiz", { quizScore: 100, score: 80 }), 650);
  }, [done, onComplete]);

  function choose(item, index) {
    if (item.id === letter.id) {
      setSelected((current) => Array.from(new Set([...current, index])));
      return;
    }
    setWrong(index);
    window.setTimeout(() => setWrong(-1), 300);
  }

  return (
    <GameStage letter={letter} title="Найди букву в слове" combo={selected.length} xp={selected.length * 20} reward={done ? { title: "Все буквы найдены", xp: 80 } : null}>
      <div className="word-find-card" dir="rtl">
        {wordLetters.map((item, index) => (
          <button className={`${selected.includes(index) ? "is-found" : ""} ${wrong === index ? "is-wrong" : ""}`} key={`${item.id}-${index}`} type="button" onClick={() => choose(item, index)}>
            {item.letter}
          </button>
        ))}
      </div>
      <div className="game-counter">{selected.length} / {targetIndexes.length}</div>
      <p className="letter-task-copy">Нажми все буквы {letter.letter} в слове.</p>
    </GameStage>
  );
}

function MiniExamStage({ letter, completedTasks, onComplete, onNext }) {
  const required = taskTemplates.filter((task) => task.id !== "reward");
  const ready = required.every((task) => completedTasks.includes(task.id));
  const [opened, setOpened] = useState(completedTasks.includes("reward"));
  const stars = ready ? 3 : Math.max(1, Math.floor(completedTasks.length / 2));

  function openChest() {
    if (!ready) return;
    setOpened(true);
    window.setTimeout(() => onComplete("reward", { score: 100 }), 700);
  }

  return (
    <GameStage letter={letter} title="Мини-экзамен" combo={stars} xp={ready ? 100 : completedTasks.length * 12} reward={opened ? { title: "Сундук открыт", xp: 100, coins: 50 } : null}>
      <div className="mini-exam">
        <div className="mini-exam__steps">
          {required.map((task) => (
            <span className={completedTasks.includes(task.id) ? "is-done" : ""} key={task.id}>
              {task.number}
            </span>
          ))}
        </div>
        <button className={`reward-chest ${opened ? "is-open" : ""}`} type="button" onClick={openChest} disabled={!ready || opened}>
          <Gift size={64} aria-hidden="true" />
        </button>
        <div className="mini-exam__stars" aria-label={`${stars} звезды`}>
          {Array.from({ length: 3 }, (_, index) => <Star key={index} size={28} fill={index < stars ? "currentColor" : "none"} />)}
        </div>
        <GameButton onClick={opened ? onNext : openChest} disabled={!ready && !opened}>
          {opened ? "Дальше" : ready ? "Открыть награду" : "Заверши игры"}
        </GameButton>
      </div>
    </GameStage>
  );
}

export default function LetterLessonScreen() {
  const navigate = useNavigate();
  const { letterId } = useParams();
  const letter = getLetterById(letterId);
  const character = getSelectedCharacter() || "ahmad";
  const letterNodes = useMemo(() => getLessonNodesForLetter(letter.id), [letter.id]);
  const letterNodeId = getLessonNodeByType(letter.id, "letter");
  const rewardNodeId = getLetterRewardNodeId(letter.id);
  const rewardNode = getRewardNode(letterNodes);
  const [lessonProgress, setLessonProgress] = useState(() => getInitialProgress(letter, letterNodes));
  const [activeTaskId, setActiveTaskId] = useState(() => getInitialProgress(letter, letterNodes).currentTaskId);
  const [voiceStarted, setVoiceStarted] = useState(false);
  const [findChoice, setFindChoice] = useState("");
  const [findMessage, setFindMessage] = useState("");
  const [traceProgress, setTraceProgress] = useState(() => getInitialProgress(letter, letterNodes).traceProgress || 0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizMessage, setQuizMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const lessonState = useMemo(() => getLessonPathState(), [refreshKey, lessonProgress]);
  const completedTasks = lessonProgress.completedTasks || [];
  const activeTask = taskTemplates.find((task) => task.id === activeTaskId) || taskTemplates[0];
  const quiz = useMemo(() => buildQuiz(letter), [letter]);
  const doneCount = completedTasks.length;
  const progressPercent = Math.round((doneCount / taskTemplates.length) * 100);
  const reviewNumber = Math.ceil((arabicLetters.findIndex((item) => item.id === letter.id) + 1) / 4);
  const reviewDue = (arabicLetters.findIndex((item) => item.id === letter.id) + 1) % 4 === 0;
  const activeTaskIndex = taskTemplates.findIndex((task) => task.id === activeTaskId);

  useEffect(() => {
    const nextProgress = getInitialProgress(letter, letterNodes);
    setLessonProgress(nextProgress);
    setActiveTaskId(nextProgress.currentTaskId);
    setTraceProgress(nextProgress.traceProgress || 0);
    setVoiceStarted(false);
    setFindChoice("");
    setFindMessage("");
    setQuizAnswers({});
    setQuizMessage("");
  }, [letter.id, letterNodes]);

  useEffect(() => {
    stopAllAudio();
    return () => stopAllAudio();
  }, [letter.id, activeTaskId]);

  useEffect(() => {
    if (!letterNodeId) return;
    const state = getLessonPathState();
    const isCompleted = rewardNodeId && state.completedLessonNodes.includes(rewardNodeId);
    const canOpen = canOpenLessonNode(letterNodeId, state)
      || state.completedLessonNodes.includes(letterNodeId)
      || isCompleted
      || canOpenSequentialLetter(letter.id);
    if (!canOpen) navigate("/lessons", { replace: true });
  }, [letter.id, letterNodeId, rewardNodeId, navigate]);

  function updateProgress(updater) {
    const next = typeof updater === "function" ? updater(lessonProgress) : updater;
    saveLetterProgress(letter.id, next);
    setLessonProgress(next);
    return next;
  }

  function completeTask(taskId, extra = {}) {
    const legacyMap = {
      look: getLetterNode(letterNodes),
      sound: getSoundNode(letterNodes),
      find: getFindNode(letterNodes),
      trace: getTraceNode(letterNodes)
    };

    let rewardBlocked = false;

    if (taskId === "quiz") {
      completeLegacyPracticeBeforeReward(letterNodes);
    } else if (taskId === "reward") {
      completeLegacyPracticeBeforeReward(letterNodes);
      if (rewardNode) {
        const result = completeLessonNode(rewardNode.id, { completedLetterId: letter.id });
        rewardBlocked = Boolean(result?.blocked);
      }
    } else {
      completeLegacyNode(legacyMap[taskId]);
    }

    const rewardExtra = taskId === "reward" ? awardLetterReward(letter.id, rewardBlocked) : {};

    const nextProgress = updateProgress((current) => {
      const completed = Array.from(new Set([...(current.completedTasks || []), taskId]));
      const currentTaskId = resolveCurrentTaskId(completed, "");
      return { ...current, ...extra, ...rewardExtra, completedTasks: completed, currentTaskId };
    });
    setActiveTaskId(nextProgress.currentTaskId);
    setRefreshKey((value) => value + 1);
  }

  function handleTaskSelect(task) {
    const status = getTaskStatus(task.id, completedTasks);
    if (status === "locked") return;
    setActiveTaskId(task.id);
  }

  function goToTaskOffset(offset) {
    const nextTask = taskTemplates[activeTaskIndex + offset];
    if (!nextTask) return;
    handleTaskSelect(nextTask);
  }

  function handleSound() {
    speakLessonLetter(letter);
    completeTask("sound");
  }

  function handleVoiceConfirm() {
    completeTask("voice");
    setVoiceStarted(false);
  }

  function handleFindChoice(choice) {
    setFindChoice(choice);
    if (choice === letter.letter) {
      setFindMessage("Верно. Ты нашёл нужную букву.");
      window.setTimeout(() => completeTask("find"), 220);
      return;
    }
    setFindMessage(`Попробуй ещё раз. Буква ${letter.nameRu} выглядит так: ${letter.letter}`);
  }

  function handleTraceMove(event) {
    if (completedTasks.includes("trace")) return;
    if (event.buttons === 0 && event.pointerType === "mouse") return;
    setTraceProgress((current) => {
      const next = Math.min(100, current + 8);
      updateProgress((progress) => ({ ...progress, traceProgress: next }));
      return next;
    });
  }

  function submitQuiz() {
    const correct = quiz.filter((question) => quizAnswers[question.id] === question.answer).length;
    const score = Math.round((correct / quiz.length) * 100);

    if (score >= PASS_SCORE) {
      setQuizMessage(`Отлично: ${score}%. Буква закреплена.`);
      completeTask("quiz", { quizScore: score, score });
      return;
    }

    updateProgress((current) => ({ ...current, quizScore: score, score, currentTaskId: "find" }));
    setQuizMessage(`Давай повторим ещё раз. Сейчас ${score}%, нужно минимум ${PASS_SCORE}%.`);
    setActiveTaskId("find");
  }

  function handleReward() {
    completeTask("reward", { score: Math.max(lessonProgress.score || 0, lessonProgress.quizScore || 100) });
  }

  function renderTaskContent() {
    if (activeTask.id === "look") {
      return <ListenLetterStage letter={letter} character={character} onComplete={completeTask} />;
    }

    if (activeTask.id === "sound") {
      return <CatchLetterStage letter={letter} onComplete={completeTask} />;
    }

    if (activeTask.id === "voice") {
      return <DrawLetterStage letter={letter} onComplete={completeTask} />;
    }

    if (activeTask.id === "find") {
      return <AssembleLetterStage letter={letter} onComplete={completeTask} />;
    }

    if (activeTask.id === "trace") {
      return <PronounceLetterStage letter={letter} onComplete={completeTask} />;
    }

    if (activeTask.id === "quiz") {
      return <FindLetterInWordStage letter={letter} onComplete={completeTask} />;
    }

    if (activeTask.id === "reward") {
      return (
        <MiniExamStage
          letter={letter}
          completedTasks={completedTasks}
          onComplete={completeTask}
          onNext={() => navigate(getNextLetterPath(letter.id))}
        />
      );
    }

    if (activeTask.id === "look") {
      return (
        <>
          <CharacterHelper character={character} message={`Это буква ${letter.nameRu}. Она звучит как "${letter.soundText}".`} mood="teaching" compact />
          <span className="hero-letter hero-letter--lesson">{letter.letter}</span>
          <p className="letter-task-copy">Посмотри на форму буквы спокойно. Запомни, где у неё точки и как она выглядит.</p>
          <LetterHintBlock letter={letter} />
          <button className="button button--primary duo-main-button" type="button" onClick={() => completeTask("look")}>
            Понятно
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </>
      );
    }

    if (activeTask.id === "sound") {
      return (
        <>
          <span className="hero-letter hero-letter--lesson">{letter.letter}</span>
          <p className="letter-task-copy">Слушай внимательно и повтори звук без спешки.</p>
          <LetterHintBlock letter={letter} />
          <button className="button button--primary duo-sound-button" type="button" onClick={handleSound}>
            <Volume2 size={22} aria-hidden="true" />
            Прослушать
          </button>
        </>
      );
    }

    if (activeTask.id === "voice") {
      return (
          <div className="letter-task-panel">
            <div className="letter-task-mic">
              <Mic size={42} aria-hidden="true" />
            </div>
            <h2>Произнеси: {letter.nameRu}</h2>
            <p>Нажми микрофон, скажи букву вслух, затем подтверди, что произнёс правильно.</p>
          <LetterHintBlock letter={letter} />
            {!voiceStarted ? (
              <button className="button button--primary" type="button" onClick={() => setVoiceStarted(true)}>
                <Mic size={18} aria-hidden="true" />
              Нажать микрофон
            </button>
          ) : (
            <button className="button button--primary" type="button" onClick={handleVoiceConfirm}>
              <Check size={18} aria-hidden="true" />
              Я произнёс правильно
            </button>
          )}
          <small>Это MVP-проверка. Позже сюда можно подключить точное распознавание речи.</small>
        </div>
      );
    }

    if (activeTask.id === "find") {
      const choices = getChoiceLetters(letter);
      return (
        <div className="letter-task-panel">
          <h2>Найди букву {letter.nameRu}</h2>
          <p>Выбери правильную букву среди карточек.</p>
          <div className="letter-choice-grid">
            {choices.map((choice) => (
              <button
                className={`${findChoice === choice.letter ? choice.letter === letter.letter ? "is-correct" : "is-wrong" : ""}`}
                key={choice.id}
                type="button"
                onClick={() => handleFindChoice(choice.letter)}
              >
                {choice.letter}
              </button>
            ))}
          </div>
          {findMessage ? <p className="letter-task-message">{findMessage}</p> : null}
        </div>
      );
    }

    if (activeTask.id === "trace") {
      return (
        <div className="letter-task-panel">
          <h2>Обведи букву</h2>
          <p>Проведи пальцем или мышкой по пунктирной букве. Кнопка откроется, когда ты попробуешь обвести хотя бы большую часть формы.</p>
          <div className="letter-trace-pad" onPointerMove={handleTraceMove} onPointerDown={handleTraceMove}>
            <span>{letter.letter}</span>
          </div>
          <div className="letter-task-progress" aria-label={`Прогресс обведения ${traceProgress}%`}>
            <i style={{ width: `${traceProgress}%` }} />
          </div>
          <p className="letter-trace-status">
            {traceProgress >= TRACE_READY_PROGRESS ? "Хорошо! Теперь можно завершить." : `РћР±РІРµРґРё РµС‰С‘ РЅРµРјРЅРѕРіРѕ: РЅСѓР¶РЅРѕ РјРёРЅРёРјСѓРј ${TRACE_READY_PROGRESS}%.`}
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => completeTask("trace", { traceProgress: Math.max(traceProgress, TRACE_READY_PROGRESS) })}
            disabled={traceProgress < TRACE_READY_PROGRESS}
          >
            {traceProgress >= TRACE_READY_PROGRESS ? "Готово" : "Сначала обведи букву"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      );
    }

    if (activeTask.id === "quiz") {
      return (
        <div className="letter-task-panel letter-quiz-panel">
          <h2>Мини-проверка</h2>
          <p>Ответь минимум на {PASS_SCORE}%, чтобы буква считалась изученной.</p>
          {quiz.map((question) => (
            <div className="letter-quiz-question" key={question.id}>
              <div>
                <strong>{question.title}</strong>
                {question.listen ? (
                  <button className="icon-button" type="button" onClick={() => speakLessonLetter(letter)} aria-label="Прослушать">
                    <Play size={18} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <div className="letter-quiz-options">
                {question.options.map((option) => (
                  <button
                    className={quizAnswers[question.id] === option ? "is-selected" : ""}
                    key={option}
                    type="button"
                    onClick={() => setQuizAnswers((current) => ({ ...current, [question.id]: option }))}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {quizMessage ? <p className="letter-task-message">{quizMessage}</p> : null}
          <button className="button button--primary" type="button" onClick={submitQuiz}>
            Проверить
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      );
    }

    return (
      <div className="letter-task-panel letter-reward-panel">
        <div className="letter-reward-stars" aria-hidden="true">в… в… в…</div>
        <h2>Молодец! Ты выучил букву {letter.nameRu}.</h2>
        <p>Буква пройдена: форма, звук, произношение, поиск, обведение и проверка.</p>
        {reviewDue ? <p className="letter-task-message">После этой буквы открылось повторение {reviewNumber}: закрепи уже изученные буквы на карте уроков.</p> : null}
        {!completedTasks.includes("reward") ? (
          <button className="button button--primary" type="button" onClick={handleReward}>
            Получить награду
            <Sparkles size={18} aria-hidden="true" />
          </button>
        ) : (
          <button className="button button--primary" type="button" onClick={() => navigate(getNextLetterPath(letter.id))}>
            Следующая буква
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="duo-lesson-shell duo-letter-shell letter-sequence-shell">
      <header className="duo-lesson-top">
        <button className="duo-exit-button" type="button" onClick={() => navigate("/lessons")} aria-label="Выйти из урока">
          <X size={28} aria-hidden="true" />
        </button>
        <div className="duo-progress-track" aria-label={`Прогресс урока ${progressPercent}%`}>
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <div className="duo-lesson-main">
        <div className="duo-lesson-prompt">
          <span className="duo-kicker">
            <Sparkles size={21} aria-hidden="true" />
            Буква {letter.nameRu}
          </span>
          <h1>{activeTask.title}</h1>
          <p>{activeTask.description}</p>
        </div>

        <div className="duo-letter-layout letter-sequence-layout">
          <GlassCard className="letter-focus-card duo-letter-focus letter-active-task">
            {renderTaskContent()}
          </GlassCard>

          <div className="step-list duo-step-list letter-task-list" aria-label="Задания урока">
            {taskTemplates.map((task) => {
              const status = getTaskStatus(task.id, completedTasks);
              const isActive = activeTaskId === task.id;
              const canSelect = status === "available";
              return (
                <GlassCard className={`step-card duo-step-card letter-task-card is-${status} ${isActive ? "is-active" : ""}`} key={task.id}>
                  <span className={`step-card__index ${status === "completed" ? "is-done" : ""}`}>
                    {status === "completed" ? <Check size={18} /> : status === "locked" ? <Lock size={17} /> : task.number}
                  </span>
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>
                  <button className="icon-button" type="button" onClick={() => handleTaskSelect(task)} disabled={!canSelect} aria-label={task.title}>
                    {status === "completed" ? <Check size={18} /> : status === "locked" ? <Lock size={18} /> : <ArrowRight size={18} />}
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="duo-lesson-footer">
        <button className="button button--soft duo-skip-button" type="button" onClick={() => navigate("/lessons")}>
          К карте
        </button>
        <button
          className="button button--soft duo-step-nav-button"
          type="button"
          onClick={() => goToTaskOffset(-1)}
          disabled={activeTaskIndex <= 0}
        >
          Назад
        </button>
        <button
          className="button button--soft duo-step-nav-button"
          type="button"
          onClick={() => goToTaskOffset(1)}
          disabled={!taskTemplates[activeTaskIndex + 1] || getTaskStatus(taskTemplates[activeTaskIndex + 1].id, completedTasks) === "locked"}
        >
          Вперёд
        </button>
        <button
          className="button button--primary duo-main-button"
          type="button"
          onClick={() => setActiveTaskId(resolveCurrentTaskId(completedTasks, ""))}
        >
          Текущее задание
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}
