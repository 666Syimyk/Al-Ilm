import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gamepad2,
  GraduationCap,
  Landmark,
  Languages,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Volume2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.webp";
import amina from "../assets/characters/amina.webp";
import { getLetterById } from "../data/arabicLetters.js";
import { getChapterById, getLessonNodesForLetter, getNodeReward, lessonChapters, lessonPathNodes, withLessonPathStatus } from "../data/lessonPath.js";
import { getLessonPathState, getProgress, getSelectedCharacter, getStoredJson, getStoredValue, setStoredValue } from "../utils/storage.js";

import { countSteps } from "../utils/plural.js";
const characterImages = { ahmad, amina };
const LETTER_PROGRESS_KEY = "letterLessonProgress:v1";
const missionTypes = ["sound", "writing", "game", "quiz", "reward"];
const letterSequenceNodeTypes = ["letter", ...missionTypes];

const letterSequenceTasks = [
  { id: "look", title: "Посмотри букву" },
  { id: "sound", title: "Прослушай звук" },
  { id: "voice", title: "Произнеси вслух" },
  { id: "find", title: "Найди букву" },
  { id: "trace", title: "Обведи букву" },
  { id: "quiz", title: "Проверка" },
  { id: "reward", title: "Награда" }
];

const categories = [
  { id: "arabic", label: "Арабский язык", icon: Languages },
  { id: "quran", label: "Коран", icon: BookOpenCheck },
  { id: "namaz", label: "Намаз", icon: Landmark },
  { id: "basics", label: "Основы", icon: ShieldCheck },
  { id: "tajweed", label: "Таджвид", icon: GraduationCap },
  { id: "repeat", label: "Повторение", icon: RotateCcw }
];

const categoryCards = {
  quran: [
    { title: "Путь Корана", subtitle: "Суры, аяты и чтение", to: "/quran/path", icon: BookOpenCheck },
    { title: "Список сур", subtitle: "Читай и отмечай прогресс", to: "/quran/surahs", icon: BookOpen },
    { title: "Запоминание", subtitle: "Повторяй шаг за шагом", to: "/quran/memorization", icon: Star }
  ],
  namaz: [
    { title: "Учиться намазу", subtitle: "Пошаговый порядок молитвы", to: "/namaz", icon: Landmark },
    { title: "Прогресс намаза", subtitle: "Отмечай практику каждый день", to: "/namaz/progress", icon: Target },
    { title: "Суры и дуа", subtitle: "Тексты для намаза и повторение", to: "/namaz/surahs", icon: BookOpenCheck }
  ],
  basics: [
    { title: "Что должен знать мусульманин", subtitle: "Столпы, очищение, адаб и дуа", to: "/islamic-basics", icon: ShieldCheck },
    { title: "Основы Ислама", subtitle: "Фарз, важиб, сунна и другие понятия", to: "/islamic-basics/rulings", icon: GraduationCap }
  ],
  tajweed: [
    { title: "Основы таджвида", subtitle: "Правила красивого чтения", to: "/quran/tajweed", icon: GraduationCap },
    { title: "Чтение с подсказками", subtitle: "Буквы, огласовки и правила", to: "/quran/reading", icon: BookOpen }
  ],
  repeat: [
    { title: "Найди букву", subtitle: "Быстрая тренировка внимания", to: "/game/find-letter/alif", icon: Gamepad2 },
    { title: "Слушай и выбирай", subtitle: "Узнавай буквы по звуку", to: "/game/listen/alif", icon: Volume2 },
    { title: "Алфавит", subtitle: "Повтори все буквы", to: "/alphabet", icon: Languages }
  ]
};

const nodeIcons = {
  letter: Star,
  sound: Volume2,
  writing: BookOpen,
  game: Gamepad2,
  quiz: CheckCircle2,
  reward: Trophy,
  checkpoint: ShieldCheck,
  review: RotateCcw,
  syllable: Languages,
  word: BookOpen,
  reading: BookOpenCheck,
  boss: Trophy
};

const typeLabels = {
  letter: "Буква",
  sound: "Слушание",
  writing: "Письмо",
  game: "Игра",
  quiz: "Проверка",
  reward: "Награда",
  checkpoint: "Контроль",
  review: "Повторение",
  syllable: "Слог",
  word: "Слово",
  reading: "Чтение",
  boss: "Испытание"
};

const statusLabels = {
  completed: "Пройдено",
  current: "Сейчас",
  locked: "Закрыто",
  bonus: "Бонус"
};

function getDaysAway() {
  if (typeof window === "undefined") return 0;
  const lastVisit = getStoredValue("lastLessonsVisit", "");
  if (!lastVisit) return 0;
  const diff = Date.now() - new Date(lastVisit).getTime();
  return Math.floor(diff / 86400000);
}

function getTaskTitle(node) {
  if (node.type === "sound") return "Послушать звук";
  if (node.type === "writing") return "Обвести букву";
  if (node.type === "game") return `Пройти игру "${node.title}"`;
  if (node.type === "quiz") return "Пройти проверку";
  if (node.type === "reward") return "Забрать награду";
  if (node.type === "checkpoint") return "Пройти контрольную точку";
  if (node.type === "syllable") return "Прочитать слоги";
  if (node.type === "word") return "Прочитать слова";
  if (node.type === "reading") return "Перейти к чтению";
  if (node.type === "boss") return "Завершить испытание главы";
  return node.title;
}

function readLetterProgressMap() {
  return getStoredJson(LETTER_PROGRESS_KEY, {});
}

function getCompletedLetterTaskIds(letterId, nodes) {
  const saved = readLetterProgressMap()[letterId] || {};
  const completed = new Set(saved.completedTasks || []);
  const letterNodes = nodes.filter((node) => node.letterId === letterId);

  if (letterNodes.some((node) => node.type === "letter" && node.status === "completed")) completed.add("look");
  if (letterNodes.some((node) => (node.type === "sound" || node.gameType === "listen") && node.status === "completed")) completed.add("sound");
  if (letterNodes.some((node) => node.gameType === "find-letter" && node.status === "completed")) completed.add("find");
  if (letterNodes.some((node) => (node.type === "writing" || node.gameType === "trace") && node.status === "completed")) completed.add("trace");
  if (letterNodes.some((node) => node.type === "quiz" && node.status === "completed")) completed.add("quiz");

  if (letterNodes.some((node) => node.type === "reward" && node.status === "completed")) {
    letterSequenceTasks.forEach((task) => completed.add(task.id));
  }

  return completed;
}

function getCharacterMessage(currentNode, completedCount, stepsToReward, daysAway, currentLetterName) {
  if (daysAway >= 3) return "Рад видеть тебя снова! Продолжим путь?";
  if (completedCount === 0 || currentNode.id === "alif-letter") return "Начнём с первой буквы — Алиф!";
  if (stepsToReward === 1) return "Остался один шаг до награды!";
  if (currentNode.type === "syllable") return "Теперь соединяем буквы в слоги. Это первый шаг к настоящему чтению.";
  if (currentNode.type === "word") return "Отлично, теперь из слогов собираем слова.";
  if (currentNode.type === "reading") return "Ты уже знаешь буквы, слоги и слова. Можно читать короткие строки.";
  if (currentNode.type === "game") return `Найди букву ${currentLetterName} среди других букв.`;
  if (currentNode.type === "reward") return "Ты заслужил награду!";
  return `Сегодня продолжим с буквы ${currentLetterName}!`;
}

function buildMission(currentNode, nodes) {
  if (!currentNode.letterId) {
    const task = { title: getTaskTitle(currentNode), done: currentNode.status === "completed" };
    return {
      title: currentNode.title,
      subtitle: currentNode.subtitle,
      letter: currentNode.letter || "★",
      tasks: [task],
      completed: task.done ? 1 : 0,
      total: 1,
      message: currentNode.type === "boss" ? "Большое испытание главы. У тебя получится." : "Это важная точка на карте знаний."
    };
  }

  const letter = getLetterById(currentNode.letterId);
  const completedTaskIds = getCompletedLetterTaskIds(currentNode.letterId, nodes);
  const tasks = letterSequenceTasks.map((task) => ({
    title: task.title,
    done: completedTaskIds.has(task.id)
  }));
  const completed = tasks.filter((task) => task.done).length;

  return {
    title: `Буква ${letter.nameRu} - ${letter.letter}`,
    subtitle: "Пройди 7 шагов: посмотри, послушай, произнеси, найди, обведи, проверь себя и забери награду.",
    letter: letter.letter,
    tasks,
    completed,
    total: tasks.length,
    message: `Это буква ${letter.nameRu}. Посмотри внимательно.`
  };
}

function LessonsCategoryContent({ activeCategory, currentNode, onNavigate }) {
  if (activeCategory === "arabic") return null;
  const items = categoryCards[activeCategory] || [];

  return (
    <section className="premium-lessons-card premium-lessons-category-panel">
      <div className="premium-lessons-section-head">
        <div>
          <span className="premium-lessons-kicker">Раздел</span>
          <h2>{categories.find((item) => item.id === activeCategory)?.label}</h2>
        </div>
        <Sparkles size={22} aria-hidden="true" />
      </div>
      <div className="premium-lessons-category-grid">
        {items.map(({ title, subtitle, to, icon: Icon }) => (
          <button className="premium-lessons-route-card" key={title} type="button" onClick={() => onNavigate(to)}>
            <Icon size={24} aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </span>
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
      <button className="premium-lessons-secondary" type="button" onClick={() => onNavigate(currentNode.letterId ? `/letter/${currentNode.letterId}` : currentNode.to)}>
        Вернуться к текущему уроку
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </section>
  );
}

function LessonPathNode({ node, index, lockedNodeId, onOpen }) {
  const reward = getNodeReward(node);
  const Icon = node.status === "completed" ? CheckCircle2 : node.status === "locked" ? Lock : nodeIcons[node.type] || Star;
  const isSpecial = ["reward", "boss", "checkpoint"].includes(node.type);
  const side = index % 2 === 0 ? "left" : "right";
  const actionText = node.status === "completed" || node.status === "bonus" ? "Повторить" : node.status === "current" ? "Продолжить" : "Закрыто";

  return (
    <article className={`premium-lesson-node premium-lesson-node--${side} premium-lesson-node--${node.status} ${isSpecial ? "premium-lesson-node--special" : ""} ${lockedNodeId === node.id ? "is-shaking" : ""}`}>
      <span className="premium-lesson-node__line" aria-hidden="true" />
      <button className="premium-lesson-node__orb" type="button" onClick={() => onOpen(node)} aria-label={`${node.title}. ${statusLabels[node.status] || node.status}`}>
        <Icon size={22} aria-hidden="true" />
      </button>
      <div className="premium-lesson-node__card">
        <div className="premium-lesson-node__top">
          <span>{typeLabels[node.type] || "Урок"}</span>
          <strong>{statusLabels[node.status] || node.status}</strong>
        </div>
        <div className="premium-lesson-node__body">
          {node.letter ? <span className="premium-lesson-node__letter">{node.letter}</span> : null}
          <div>
            <h3>{node.title}</h3>
            <p>{node.subtitle}</p>
          </div>
        </div>
        <div className="premium-lesson-node__foot">
          <span>
            <Star size={14} aria-hidden="true" />
            +{reward.points}
          </span>
          <button type="button" onClick={() => onOpen(node)}>
            {actionText}
            {node.status === "locked" ? <Lock size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function LessonsScreen() {
  const navigate = useNavigate();
  const [lockedNodeId, setLockedNodeId] = useState("");
  const [toast, setToast] = useState("");
  const [activeCategory, setActiveCategory] = useState("arabic");
  const character = getSelectedCharacter() || "ahmad";
  const characterImage = characterImages[character] || ahmad;
  const progress = getProgress();
  const lessonState = getLessonPathState();
  const nodes = withLessonPathStatus(lessonPathNodes, lessonState);
  const currentNode = nodes.find((node) => node.status === "current") || [...nodes].reverse().find((node) => node.status === "completed") || nodes[0];
  const currentChapter = getChapterById(currentNode.chapter);
  const currentIndex = nodes.findIndex((node) => node.id === currentNode.id);
  const completedCount = nodes.filter((node) => node.status === "completed").length;
  const lockedCount = nodes.filter((node) => node.status === "locked").length;
  const nextRewardIndex = nodes.findIndex((node, index) => index >= currentIndex && (node.type === "reward" || node.type === "boss"));
  const nextReward = nextRewardIndex >= 0 ? nodes[nextRewardIndex] : currentNode;
  const stepsToReward = nextRewardIndex >= 0 ? nextRewardIndex - currentIndex : 0;
  const currentLetter = currentNode.letterId ? getLetterById(currentNode.letterId) : getLetterById(progress.currentLesson);
  const daysAway = getDaysAway();
  const heroMessage = getCharacterMessage(currentNode, completedCount, stepsToReward, daysAway, currentLetter.nameRu);
  const mission = useMemo(() => buildMission(currentNode, nodes), [currentNode, nodes]);
  const missionPercent = mission.total ? Math.round((mission.completed / mission.total) * 100) : 0;
  const overallPercent = nodes.length ? Math.round((completedCount / nodes.length) * 100) : 0;
  const currentChapterNodes = nodes.filter((node) => node.chapter === currentChapter.id);
  const currentChapterCompleted = currentChapterNodes.filter((node) => node.status === "completed").length;
  const lockedPreview = nodes.filter((node) => node.status === "locked").slice(0, 4);
  const currentChapterPercent = currentChapterNodes.length ? Math.round((currentChapterCompleted / currentChapterNodes.length) * 100) : 0;

  useEffect(() => {
    setStoredValue("lastLessonsVisit", new Date().toISOString());
  }, []);

  function showLockedMessage(nodeId) {
    setLockedNodeId(nodeId);
    setToast("Этот урок откроется после прохождения предыдущего.");
    window.setTimeout(() => setLockedNodeId(""), 520);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openNode(node) {
    if (node.status === "locked") {
      showLockedMessage(node.id);
      return;
    }
    const target = node.letterId && letterSequenceNodeTypes.includes(node.type) && getLessonNodesForLetter(node.letterId).some((item) => item.id === node.id)
      ? `/letter/${node.letterId}`
      : node.to;
    navigate(target);
  }

  return (
    <section className="premium-lessons">
      <div className="premium-lessons__bg" aria-hidden="true" />
      <div className="premium-lessons__light" aria-hidden="true" />
      <div className="premium-lessons__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
      </div>

      <header className="premium-lessons-appbar">
        <button type="button" onClick={() => navigate("/home")} aria-label="Назад">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div>
          <span>Продолжай путь знаний</span>
          <h1>Уроки</h1>
        </div>
        <button type="button" onClick={() => navigate("/profile")} aria-label="Профиль">
          <UserRound size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="premium-lessons-layout">
        <aside className="premium-lessons-left">
          <section className="premium-lessons-card premium-lessons-hero">
            <div className="premium-lessons-hero__copy">
              <span className="premium-lessons-kicker">Твой путь знаний</span>
              <h2>{currentChapter.title}</h2>
              <p>Пройдено {completedCount} из {nodes.length} шагов. Следующий урок: {currentNode.title}.</p>
            </div>
            <div className="premium-lessons-hero__character">
              <img src={characterImage} alt="Ахмад" />
            </div>
            <div className="premium-lessons-progress-ring" style={{ "--lessons-ring": `${overallPercent * 3.6}deg` }}>
              <strong>{overallPercent}%</strong>
              <span>общий путь</span>
            </div>
            <div className="premium-lessons-hero__stats">
              <span><Sparkles size={16} /> <strong>{progress.points || 0}</strong> очков</span>
              <span><Flame size={16} /> <strong>{progress.streak || 0}</strong> дней</span>
              <span><CheckCircle2 size={16} /> <strong>{completedCount}</strong> шагов</span>
            </div>
          </section>

          <section className="premium-lessons-card premium-lessons-side">
            <div className="premium-lessons-section-head">
              <div>
                <span className="premium-lessons-kicker">Категории</span>
                <h2>Разделы</h2>
              </div>
              <Target size={22} aria-hidden="true" />
            </div>
            <div className="premium-lessons-tabs premium-lessons-tabs--side" role="tablist" aria-label="Категории уроков">
              {categories.map(({ id, label, icon: Icon }) => (
                <button className={activeCategory === id ? "is-active" : ""} key={id} type="button" onClick={() => setActiveCategory(id)}>
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="premium-lessons-center">
          <nav className="premium-lessons-tabs premium-lessons-tabs--top" role="tablist" aria-label="Категории уроков">
            {categories.map(({ id, label, icon: Icon }) => (
              <button className={activeCategory === id ? "is-active" : ""} key={id} type="button" onClick={() => setActiveCategory(id)}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <section className="premium-lessons-card premium-lessons-current">
            <div className="premium-lessons-current__letter">{mission.letter}</div>
            <div className="premium-lessons-current__copy">
              <span className="premium-lessons-kicker">Продолжить обучение</span>
              <h2>{mission.title}</h2>
              <p>{mission.subtitle}</p>
              <div className="premium-lessons-current__bar" aria-label={`Прогресс миссии ${missionPercent}%`}>
                <span style={{ width: `${missionPercent}%` }} />
              </div>
            </div>
            <div className="premium-lessons-current__action">
              <strong>{mission.completed}/{mission.total}</strong>
              <button className="premium-lessons-primary" type="button" onClick={() => openNode(currentNode)}>
                Продолжить
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>

          <LessonsCategoryContent activeCategory={activeCategory} currentNode={currentNode} onNavigate={navigate} />

          <section className="premium-lessons-card premium-lessons-map" aria-label="Карта уроков">
            <div className="premium-lessons-section-head">
              <div>
                <span className="premium-lessons-kicker">Карта знаний</span>
                <h2>Путь Al-Ilm</h2>
                <p>{heroMessage}</p>
              </div>
              <Trophy size={24} aria-hidden="true" />
            </div>

            <div className="premium-lessons-chapters" aria-label="Главы">
              {lessonChapters.map((chapter) => {
                const chapterNodes = nodes.filter((node) => node.chapter === chapter.id);
                const chapterDone = chapterNodes.filter((node) => node.status === "completed").length;
                const hasCurrent = chapterNodes.some((node) => node.status === "current");
                const percent = chapterNodes.length ? Math.round((chapterDone / chapterNodes.length) * 100) : 0;

                return (
                  <a
                    className={hasCurrent ? "is-current" : ""}
                    href={`#${chapter.id}`}
                    key={chapter.id}
                    style={{ "--chapter-progress": `${percent}%` }}
                  >
                    <span>{chapter.number}</span>
                    <strong>{chapter.title}</strong>
                    <small>{percent}%</small>
                  </a>
                );
              })}
            </div>

            <div className="premium-lessons-path">
              {lessonChapters.map((chapter) => {
                const chapterNodes = nodes.filter((node) => node.chapter === chapter.id);
                const chapterDone = chapterNodes.filter((node) => node.status === "completed").length;

                return (
                  <section className="premium-lessons-chapter" id={chapter.id} key={chapter.id}>
                    <div className="premium-lessons-chapter__head">
                      <span>Глава {chapter.number}</span>
                      <h3>{chapter.title}</h3>
                      <p>{chapter.description}</p>
                      <strong>{chapterDone}/{chapterNodes.length} шагов</strong>
                    </div>
                    <div className="premium-lessons-node-list">
                      {chapterNodes.map((node, index) => (
                        <LessonPathNode key={node.id} node={node} index={index} lockedNodeId={lockedNodeId} onOpen={openNode} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="premium-lessons-right">
          <section className="premium-lessons-card premium-lessons-side">
            <div className="premium-lessons-section-head">
              <div>
                <span className="premium-lessons-kicker">Текущая глава</span>
                <h2>{currentChapter.title}</h2>
              </div>
              <BookOpen size={22} aria-hidden="true" />
            </div>
            <div className="premium-lessons-mini-progress">
              <span>Прогресс главы</span>
              <strong>{currentChapterPercent}%</strong>
              <div><i style={{ width: `${currentChapterPercent}%` }} /></div>
            </div>
            <p>{currentChapter.description}</p>
          </section>

          <section className="premium-lessons-card premium-lessons-side">
            <div className="premium-lessons-section-head">
              <div>
                <span className="premium-lessons-kicker">Награда</span>
                <h2>{nextReward.title}</h2>
              </div>
              <Trophy size={22} aria-hidden="true" />
            </div>
            <p>До следующей награды: {countSteps(stepsToReward)}.</p>
            <button className="premium-lessons-secondary" type="button" onClick={() => openNode(currentNode)}>
              Идти к награде
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>

          <section className="premium-lessons-card premium-lessons-side">
            <div className="premium-lessons-section-head">
              <div>
                <span className="premium-lessons-kicker">Откроется позже</span>
                <h2>{countSteps(lockedCount)}</h2>
              </div>
              <Lock size={22} aria-hidden="true" />
            </div>
            <div className="premium-lessons-locked-list">
              {lockedPreview.map((node) => (
                <button key={node.id} type="button" onClick={() => showLockedMessage(node.id)}>
                  <Lock size={15} aria-hidden="true" />
                  <span>{node.title}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {toast ? <div className="lesson-toast premium-lessons-toast" role="status">{toast}</div> : null}
    </section>
  );
}
