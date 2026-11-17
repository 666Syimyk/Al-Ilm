import { ArrowRight, Check, Gift, Lock, Mic, Sparkles, Star, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import { FloatingParticles, GameButton, GameLessonLayout, GameTransition, RewardPopup, TopBar } from "../components/GameLessonUI.jsx";
import GlassCard from "../components/GlassCard.jsx";
import LetterKnowledgeCheck from "../components/LetterKnowledgeCheck.jsx";
import { arabicLetters, getLetterById } from "../data/arabicLetters.js";
import { canOpenLessonNode, getLessonNodeById, getLessonNodeByType, getLessonNodesForLetter, getLetterRewardNodeId } from "../data/lessonPath.js";
import { getCachedAudio, playCachedAudio, speakText, stopAllAudio } from "../utils/audioPlayback.js";
import { completeLessonNode, getLessonPathState, getProfilePreferences, getProgress, getSelectedCharacter, getStoredJson, setProgress, setStoredJson } from "../utils/storage.js";

const LETTER_PROGRESS_KEY = "letterLessonProgress:v1";

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
  alif: "أَلِفْ",
  ba: "بَاء",
  ta: "تَاء",
  tha: "ثَاء",
  jim: "جِيم",
  ha_guttural: "حَاء",
  kha: "خَاء",
  dal: "دَال",
  dhal: "ذَال",
  ra: "رَاء",
  zay: "زَاي",
  sin: "سِين",
  shin: "شِين",
  sad: "صَاد",
  dad: "ضَاد",
  ta_emphatic: "طَاء",
  za_emphatic: "ظَاء",
  ayn: "عَيْن",
  ghayn: "غَيْن",
  fa: "فَاء",
  qaf: "قَاف",
  kaf: "كَاف",
  lam: "لَام",
  mim: "مِيم",
  nun: "نُون",
  ha_soft: "هَاء",
  waw: "وَاو",
  ya: "يَاء"
};


const taskTemplates = [
  { id: "look", number: 1, title: "Слушай букву", description: "Прослушай произношение 3 раза" },
  { id: "sound", number: 2, title: "Поймай букву", description: "Лови только нужную букву" },
  { id: "voice", number: 3, title: "Практика письма", description: "Обведи и сравни с образцом" },
  { id: "find", number: 4, title: "Узнай букву", description: "Выбери букву по названию" },
  { id: "trace", number: 5, title: "Повтори название", description: "С микрофоном или без него" },
  { id: "quiz", number: 6, title: "Найди букву в ряду", description: "Отметь все нужные буквы" },
  { id: "reward", number: 7, title: "Мини-экзамен", description: "Заверши серию и открой сундук" }
];

function readProgressMap() {
  return getStoredJson(LETTER_PROGRESS_KEY, {});
}

function writeProgressMap(map) {
  setStoredJson(LETTER_PROGRESS_KEY, map);
}

function getLessonAudioText(letter) {
  const text = lessonAudioPrompts[letter.id] || letter.letter || letter.soundText;
  return text || "";
}

function getLetterAudioUrl(letter) {
  return `${import.meta.env.BASE_URL}audio/letters/${letter.id}.wav`;
}

function speakLessonFallback(letter, options = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    options.onBlocked?.("unsupported");
    return null;
  }

  const text = getLessonAudioText(letter);
  const spokenText = `${text}، ${text}`;

  return speakText(spokenText, {
    lang: "ar-SA",
    rate: options.rate || 0.58,
    pitch: 1,
    volume: 1,
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: options.onError
  });
}

function speakLessonLetter(letter, options = {}) {
  if (!getProfilePreferences().soundEnabled) {
    options.onBlocked?.("sound-off");
    return null;
  }

  const audioUrl = getLetterAudioUrl(letter);
  let fallbackStarted = false;
  const startFallback = () => {
    if (fallbackStarted) return;
    fallbackStarted = true;
    options.onFallback?.();
    speakLessonFallback(letter, options);
  };

  playCachedAudio(audioUrl, {
    onPlaying: options.onStart,
    onEnded: options.onEnd,
    onError: startFallback
  }).catch(startFallback);

  return true;
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


function resolveCurrentTaskId(completedTasks, preferredTaskId) {
  if (preferredTaskId && !completedTasks.includes(preferredTaskId)) return preferredTaskId;
  return taskTemplates.find((task) => !completedTasks.includes(task.id))?.id || "reward";
}

function getTaskStatus(taskId, completedTasks) {
  if (completedTasks.includes(taskId)) return "completed";
  const firstOpen = taskTemplates.find((task) => !completedTasks.includes(task.id));
  return firstOpen?.id === taskId ? "available" : "locked";
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

function getNextOpenLetterPath(letterId) {
  const node = getLessonNodeById(getLessonPathState().currentLessonNode);
  if (node.letterId && getLessonNodesForLetter(node.letterId).some((item) => item.id === node.id)) return `/letter/${node.letterId}`;
  return node.to || "/lessons";
}

function awardLetterReward(letterId) {
  const saved = readProgressMap()[letterId];
  if (saved?.rewardClaimed) return {};

  const progress = getProgress();
  const nextPoints = progress.points;
  const nextCoins = progress.coins;
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
    currentLesson: getLessonNodeById(getLessonPathState().currentLessonNode).letterId || progress.currentLesson
  });

  return { rewardClaimed: true, awardedStars: 3 };
}

function GameStage({ letter, title, subtitle, hearts, combo, xp, timeLeft, children, reward, transition }) {
  return (
    <GameLessonLayout>
      <FloatingParticles count={18} />
      <TopBar title={title} subtitle={subtitle || `Буква ${letter.nameRu}`} combo={combo} timeLeft={timeLeft} />
      <div className="game-xp" aria-label={`Прогресс упражнения ${Math.min(100, xp)}%`}><span style={{ width: `${Math.min(100, xp)}%` }} /><strong>Упражнение</strong></div>
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
  const [audioMessage, setAudioMessage] = useState("");
  const [visualPractice, setVisualPractice] = useState(false);
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    getCachedAudio(getLetterAudioUrl(letter));
    return () => {
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    };
  }, [letter.id]);

  function play() {
    if (repeatCount >= 3 || isPlaying) return;
    setIsPlaying(true);
    setAudioMessage("Запускаю звук буквы...");
    let fired = false;

    const clearFallbackTimer = () => {
      if (fallbackTimerRef.current) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };

    const finish = () => {
      if (fired) return;
      fired = true;
      clearFallbackTimer();
      setIsPlaying(false);
      const next = Math.min(3, repeatCount + 1);
      setRepeatCount(next);
      setAudioMessage(next >= 3 ? "Отлично, звук прослушан 3 раза." : "Нажми ещё раз и повтори вслух.");
      if (next >= 3) setDone(true);
    };

    const started = speakLessonLetter(letter, {
      onStart: () => setAudioMessage("Слушай внимательно и повторяй вслух."),
      onEnd: finish,
      onFallback: () => setAudioMessage("Локальный файл не запустился, пробую голос браузера."),
      onError: () => { clearFallbackTimer(); setIsPlaying(false); setAudioMessage("Не получилось запустить озвучку. Можно продолжить зрительную практику."); },
      onBlocked: (reason) => {
        fired = true;
        clearFallbackTimer();
        setIsPlaying(false);
        setAudioMessage(reason === "sound-off"
          ? "Звук выключен в профиле. Включи: Профиль → Настройки → Звук."
          : "Этот браузер не поддерживает озвучку. Попробуй Chrome или Edge.");
      }
    });

    if (started) {
      fallbackTimerRef.current = window.setTimeout(() => { setIsPlaying(false); setAudioMessage("Звук не завершился. Повтори запуск или выбери зрительную практику."); }, 10000);
    }
  }

  return (
    <GameStage letter={letter} title="Слушай букву" combo={repeatCount} xp={Math.round(repeatCount / 3 * 100)}>
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
        {audioMessage ? <p className="letter-audio-message">{audioMessage}</p> : null}
        {done ? <GameButton onClick={() => onComplete("look", { audioPractice: "listened-three-times" })}>Продолжить</GameButton> : null}
        <button className="button button--soft" type="button" onClick={() => { stopAllAudio(); setIsPlaying(false); setVisualPractice(true); }}>Зрительная практика без аудио</button>
        {visualPractice ? <><p>Произношение можно послушать позже. Сейчас проверим узнавание буквы.</p><LetterKnowledgeCheck letters={[letter]} onComplete={() => onComplete("look", { audioPractice: "visual-alternative" })} /></> : null}
      </div>
    </GameStage>
  );
}

function CatchLetterStage({ letter, onComplete }) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const options = useMemo(() => {
    const index = arabicLetters.findIndex((item) => item.id === letter.id);
    const others = [1, 3, 5, 8, 11].map((offset) => arabicLetters[(index + offset + round) % arabicLetters.length]).filter((item) => item.id !== letter.id);
    const items = [...new Map([letter, ...others].map((item) => [item.id, item])).values()];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [letter, round]);
  const correct = selected === letter.id;

  function choose(item) {
    if (correct) return;
    setSelected(item.id);
    setMessage(item.id === letter.id ? "Верно! Ты узнал букву." : "Пока не эта буква. Сравни с образцом.");
  }

  function next() {
    if (!correct) return;
    if (round === 4) onComplete("sound");
    else { setRound((value) => value + 1); setSelected(""); setMessage(""); }
  }

  return (
    <GameStage letter={letter} title="Поймай букву" combo={round} xp={round * 20}>
      <p className="letter-task-copy">Найди {letter.letter}. Раунд {round + 1} из 5.</p>
      <div className="game-options">
        {options.map((item) => (
          <button className={`game-letter-button ${selected === item.id ? correct ? "is-correct" : "is-wrong" : ""}`} key={item.id} type="button" disabled={correct} onClick={() => choose(item)} dir="rtl">
            {item.letter}
          </button>
        ))}
      </div>
      <p role="status">{message}</p>
      <GameButton disabled={!correct} onClick={next}>{round === 4 ? "Завершить упражнение" : "Следующий раунд"}</GameButton>
    </GameStage>
  );
}

function DrawLetterStage({ letter, onComplete }) {
  const [points, setPoints] = useState([]);
  const drawingRef = useRef(false);
  const boardRef = useRef(null);
  const [compared, setCompared] = useState(false);
  const distance = points.reduce((sum, point, index) => point.start || !index ? sum : sum + Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y), 0);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const span = points.length ? Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) : 0;
  const hasPractice = distance >= 25 && span >= 18;

  function addPoint(event, start = false) {
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    setPoints((current) => current.length < 3000 ? [...current, { x, y, start }] : current);
    setCompared(false);
  }

  return (
    <GameStage letter={letter} title="Практика письма" xp={hasPractice ? 100 : 0}>
      <p className="letter-task-copy">Обведи букву и сравни с образцом. Это самостоятельная практика: приложение не оценивает правильность почерка.</p>
      <div ref={boardRef} className="draw-board" style={{ touchAction: "none" }}
        onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drawingRef.current = true; addPoint(event, true); }}
        onPointerMove={(event) => { if (drawingRef.current) { event.preventDefault(); addPoint(event); } }}
        onPointerUp={() => { drawingRef.current = false; }} onPointerCancel={() => { drawingRef.current = false; }}>
        <span className="draw-board__ghost" dir="rtl">{letter.letter}</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d={points.map((point) => `${point.start ? "M" : "L"} ${point.x} ${point.y}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <button className="button button--soft" type="button" onClick={() => { setPoints([]); setCompared(false); }}>Очистить и повторить</button>
      <label className="check-line"><input type="checkbox" checked={compared} disabled={!hasPractice} onChange={(event) => setCompared(event.target.checked)} />Я сверил форму и точки с образцом</label>
      <GameButton disabled={!hasPractice || !compared} onClick={() => onComplete("voice", { writingPractice: "self-check" })}>Продолжить после практики</GameButton>
    </GameStage>
  );
}

function AssembleLetterStage({ letter, onComplete }) {
  return (
    <GameStage letter={letter} title="Узнай букву" xp={0}>
      <LetterKnowledgeCheck letters={[letter]} onComplete={() => onComplete("find")} />
    </GameStage>
  );
}

function PronounceLetterStage({ letter, onComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [quality, setQuality] = useState("");
  const [heardText, setHeardText] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [manualPractice, setManualPractice] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => () => {
    recognitionRef.current?.abort?.();
  }, []);

  function checkSpokenText(text) {
    const normalized = normalizeSpeech(text);
    const expectedAnswers = getExpectedVoiceAnswers(letter);

    return expectedAnswers.some((answer) => normalized === answer || normalized.split(" ").includes(answer));
  }

  function record() {
    if (isRecording || isAccepted) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setQuality("Браузер не поддерживает проверку голоса. Открой в Chrome или Edge.");
      return;
    }

    recognitionRef.current?.abort?.();
    stopAllAudio();
    setIsRecording(true);
    setQuality("Слушаю...");
    setHeardText("");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const results = Array.from(event.results?.[0] || []);
      const transcript = results.map((result) => result.transcript).join(" ").trim();
      const accepted = results.some((result) => checkSpokenText(result.transcript)) || checkSpokenText(transcript);
      const nextAttempts = attempts + 1;

      setAttempts(nextAttempts);
      setHeardText(transcript);
      setIsRecording(false);

      if (accepted) {
        setIsAccepted(true);
        setQuality("Название распознано. Точность арабского произношения проверяй с учителем.");
        return;
      }

      setQuality(`Попробуй ещё раз. Нужно сказать: ${letter.soundText}.`);
    };

    recognition.onerror = () => {
      setAttempts((current) => current + 1);
      setIsRecording(false);
      setQuality(`Не расслышал. Произнеси: ${letter.soundText}.`);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try { recognition.start(); } catch { setIsRecording(false); setQuality("Микрофон недоступен. Можно продолжить без записи."); }
  }

  const qualityType = isAccepted ? "great" : quality === "Слушаю..." ? "ok" : "retry";

  return (
    <GameStage letter={letter} title="Повтори название" combo={attempts} xp={isAccepted ? 100 : 0}>
      <div className={`voice-orb ${isRecording ? "is-recording" : ""}`}>
        <Mic size={54} aria-hidden="true" />
        <span />
        <span />
        <span />
      </div>
      <h2 className="game-stage-title">{letter.soundText}</h2>
      <LetterHintBlock letter={letter} />
      <GameButton icon={Mic} onClick={record} disabled={isRecording || isAccepted}>
        {isRecording ? "Слушаю..." : isAccepted ? "Принято" : "Нажми и произнеси"}
      </GameButton>
      {quality ? <div className={`voice-quality voice-quality--${qualityType}`}>{quality}</div> : null}
      {heardText ? <p className="letter-task-copy">Я услышал: {heardText}</p> : null}
      {isAccepted ? <GameButton onClick={() => onComplete("trace", { pronunciationPractice: "name-recognized" })}>Продолжить</GameButton> : null}
      <button className="button button--soft" type="button" onClick={() => { recognitionRef.current?.abort?.(); setIsRecording(false); setManualPractice(true); }}>Практика без микрофона</button>
      {manualPractice ? <><p>Повтори название вслух или про себя, затем ответь на вопросы. Это проверка узнавания буквы, а не произношения.</p><LetterKnowledgeCheck letters={[letter]} detailed onComplete={() => onComplete("trace", { pronunciationPractice: "visual-alternative" })} /></> : null}
    </GameStage>
  );
}

function FindLetterInWordStage({ letter, onComplete }) {
  const wordLetters = useMemo(() => {
    const index = arabicLetters.findIndex((item) => item.id === letter.id);
    const items = [
      arabicLetters[(index + 2) % arabicLetters.length],
      letter,
      arabicLetters[(index + 5) % arabicLetters.length],
      letter,
      arabicLetters[(index + 8) % arabicLetters.length]
    ];
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, [letter]);
  const targetIndexes = wordLetters.map((item, index) => item.id === letter.id ? index : -1).filter((index) => index >= 0);
  const [selected, setSelected] = useState([]);
  const [wrong, setWrong] = useState(-1);
  const done = targetIndexes.every((index) => selected.includes(index));

  function choose(item, index) {
    if (item.id === letter.id) {
      setSelected((current) => Array.from(new Set([...current, index])));
      return;
    }
    setWrong(index);
    window.setTimeout(() => setWrong(-1), 300);
  }

  return (
    <GameStage letter={letter} title="Найди букву в ряду" combo={selected.length} xp={selected.length * 50}>
      <div className="word-find-card" dir="rtl">
        {wordLetters.map((item, index) => (
          <button className={`${selected.includes(index) ? "is-found" : ""} ${wrong === index ? "is-wrong" : ""}`} key={`${item.id}-${index}`} type="button" onClick={() => choose(item, index)}>
            {item.letter}
          </button>
        ))}
      </div>
      <div className="game-counter">{selected.length} / {targetIndexes.length}</div>
      <p className="letter-task-copy">Это ряд отдельных букв. Нажми все {letter.letter}.</p>
      <GameButton disabled={!done} onClick={() => onComplete("quiz")}>Продолжить</GameButton>
    </GameStage>
  );
}

function MiniExamStage({ letter, completedTasks, onComplete, onNext }) {
  const required = taskTemplates.filter((task) => task.id !== "reward");
  const ready = required.every((task) => completedTasks.includes(task.id));
  const [opened, setOpened] = useState(completedTasks.includes("reward"));
  const [claimedNow, setClaimedNow] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const stars = ready ? 3 : Math.max(1, Math.floor(completedTasks.length / 2));

  function openChest() {
    if (!ready || !examResult || opened) return;
    if (onComplete("reward", { examResult }) !== false) { setOpened(true); setClaimedNow(true); }
  }

  return (
    <GameStage letter={letter} title="Мини-экзамен" combo={stars} xp={opened ? 100 : 0} reward={claimedNow ? { title: "Награда за букву", xp: 20, coins: 5 } : null}>
      <div className="mini-exam">
        {ready && !opened && !examResult ? <LetterKnowledgeCheck letters={[letter]} detailed onComplete={setExamResult} /> : null}
        <div className="mini-exam__steps">
          {required.map((task) => (
            <span className={completedTasks.includes(task.id) ? "is-done" : ""} key={task.id}>
              {task.number}
            </span>
          ))}
        </div>
        <button className={`reward-chest ${opened ? "is-open" : ""}`} type="button" onClick={openChest} disabled={!ready || !examResult || opened} aria-label="Получить награду за букву">
          <Gift size={64} aria-hidden="true" />
        </button>
        <div className="mini-exam__stars" aria-label={`${stars} звезды`}>
          {Array.from({ length: 3 }, (_, index) => <Star key={index} size={28} fill={index < stars ? "currentColor" : "none"} />)}
        </div>
        {opened && !claimedNow ? <p>Эта буква уже пройдена. Награда сохранена.</p> : null}
        <GameButton onClick={opened ? onNext : openChest} disabled={!opened && (!ready || !examResult)}>
          {opened ? "К следующему шагу" : ready ? "Открыть награду" : "Заверши игры"}
        </GameButton>
      </div>
    </GameStage>
  );
}

function LetterLesson() {
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
  const completedTasks = lessonProgress.completedTasks || [];
  const activeTask = taskTemplates.find((task) => task.id === activeTaskId) || taskTemplates[0];
  const doneCount = completedTasks.length;
  const progressPercent = Math.round((doneCount / taskTemplates.length) * 100);
  const activeTaskIndex = taskTemplates.findIndex((task) => task.id === activeTaskId);

  useEffect(() => {
    const nextProgress = getInitialProgress(letter, letterNodes);
    setLessonProgress(nextProgress);
    setActiveTaskId(nextProgress.currentTaskId);
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
      || isCompleted;
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

    if (taskId === "quiz") {
      completeLegacyPracticeBeforeReward(letterNodes);
    } else if (taskId === "reward") {
      completeLegacyPracticeBeforeReward(letterNodes);
      if (rewardNode) {
        const result = completeLessonNode(rewardNode.id, { completedLetterId: letter.id, perfect: extra.examResult?.perfect });
        if (result?.blocked) { navigate("/lessons"); return false; }
      }
    } else {
      completeLegacyNode(legacyMap[taskId]);
    }

    const rewardExtra = taskId === "reward" ? awardLetterReward(letter.id) : {};

    const nextProgress = updateProgress((current) => {
      const completed = Array.from(new Set([...(current.completedTasks || []), taskId]));
      const currentTaskId = resolveCurrentTaskId(completed, "");
      return { ...current, ...extra, ...rewardExtra, completedTasks: completed, currentTaskId };
    });
    setActiveTaskId(nextProgress.currentTaskId);
    return true;
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
          onNext={() => navigate(getNextOpenLetterPath(letter.id))}
        />
      );
    }

    return null;
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

export default function LetterLessonScreen() {
  const { letterId } = useParams();
  return <LetterLesson key={letterId} />;
}
