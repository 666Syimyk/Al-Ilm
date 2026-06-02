import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Landmark,
  Languages,
  Library,
  Repeat2,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.png";
import amina from "../assets/characters/amina.png";
import { arabicLetters, getLetterById } from "../data/arabicLetters.js";
import { lessonPathNodes, withLessonPathStatus } from "../data/lessonPath.js";
import { prayerTimes } from "../data/prayerTimes.js";
import {
  getDailyMissionState,
  getLessonPathState,
  getProgress,
  getQuranState,
  getQuranTracking,
  getSelectedCharacter,
  getUser,
  setDailyMissionDone,
  setProgress
} from "../utils/storage.js";

const characterImages = { ahmad, amina };

const MISSIONS = [
  { id: "letter", title: "Изучи букву дня", desc: "Прослушай, обведи и закрепи букву в мини-игре", icon: BookOpen, color: "#006F3D", reward: 15 },
  { id: "quran", title: "Прочитай суру", desc: "Открой Коран и прочитай любую суру вслух", icon: BookOpenCheck, color: "#2f80ed", reward: 10 },
  { id: "game", title: "Сыграй в мини-игру", desc: "Найди нужную букву быстро и точно", icon: Sparkles, color: "#f5b849", reward: 10 },
  { id: "namaz", title: "Повтори намаз", desc: "Пройди один шаг намаза от начала до конца", icon: Library, color: "#8d6cff", reward: 10 },
  { id: "grammar", title: "Урок грамматики", desc: "Открой раздел грамматики и пройди один урок", icon: Languages, color: "#ff7966", reward: 10 },
  { id: "repeat", title: "Повтори изученное", desc: "Сыграй в игру по букве, которую уже знаешь", icon: Repeat2, color: "#3ed6c2", reward: 10 }
];

function getDailyMission() {
  const dayIndex = Math.floor(Date.now() / 86400000) % MISSIONS.length;
  return MISSIONS[dayIndex];
}

function getMissionPath(mission, currentLetter) {
  if (mission.id === "letter") return `/letter/${currentLetter.id}`;
  if (mission.id === "quran") return "/quran/surahs";
  if (mission.id === "game") return `/game/find-letter/${currentLetter.id}`;
  if (mission.id === "namaz") return "/namaz";
  if (mission.id === "grammar") return "/grammar";
  if (mission.id === "repeat") return `/game/listen/${currentLetter.id}`;
  return "/home";
}

function isBirthdayToday(dateOfBirth) {
  if (!dateOfBirth) return false;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return false;
  const today = new Date();
  return birthDate.getDate() === today.getDate() && birthDate.getMonth() === today.getMonth();
}

function getLessonStageLabel(type) {
  if (type === "letter") return "Буква";
  if (type === "sound") return "Звук";
  if (type === "writing") return "Письмо";
  if (type === "game") return "Игра";
  if (type === "quiz") return "Проверка";
  if (type === "reward") return "Награда";
  if (type === "syllable") return "Слоги";
  if (type === "word") return "Слова";
  if (type === "reading") return "Чтение";
  return "Урок";
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

export default function ChildHomeScreen() {
  const navigate = useNavigate();
  const user = getUser() || { name: "Сыймык" };
  const greetingName = user.firstName || user.name || "Сыймык";
  const birthdayToday = isBirthdayToday(user.dateOfBirth);
  const character = getSelectedCharacter() || "ahmad";
  const characterImage = characterImages[character] || ahmad;
  const progress = getProgress();
  const quranState = getQuranState();
  const quranTracking = getQuranTracking();
  const currentLetter = getLetterById(progress.currentLesson);
  const mission = getDailyMission();
  const [missionDone, setMissionDone] = useState(() => getDailyMissionState().done);
  const lessonNodes = withLessonPathStatus(lessonPathNodes, getLessonPathState());
  const currentLetterNodes = lessonNodes.filter((node) => node.letterId === currentLetter.id);
  const currentLetterDone = currentLetterNodes.filter((node) => node.status === "completed").length;
  const lessonProgressPercent = currentLetterNodes.length
    ? Math.min(100, Math.round((currentLetterDone / currentLetterNodes.length) * 100))
    : progress.completedLetters.includes(currentLetter.id)
      ? 100
      : 0;
  const currentLetterStep = currentLetterNodes.find((node) => node.status === "current") || currentLetterNodes[currentLetterDone] || currentLetterNodes[0];
  const currentStageLabel = getLessonStageLabel(currentLetterStep?.type);
  const quranGoal = quranTracking?.dailyGoal || 1;
  const quranToday = quranTracking?.todayReadCount || 0;
  const quranPercent = Math.min(100, Math.round((quranToday / quranGoal) * 100));
  const lettersPercent = Math.min(100, Math.round((progress.completedLetters.length / arabicLetters.length) * 100));
  const points = safeNumber(progress.points || progress.coins);
  const hasPrayerData = prayerTimes.nextPrayer && prayerTimes.nextPrayer !== "—" && prayerTimes.nextPrayerTime !== "—";

  const quickSections = [
    { title: "Арабский алфавит", subtitle: "Буквы и звуки", icon: BookOpen, to: "/alphabet" },
    { title: "Повторение", subtitle: "Мини-игры", icon: Repeat2, to: `/game/find-letter/${currentLetter.id}` },
    { title: "Коран", subtitle: "Суры и чтение", icon: BookOpenCheck, to: "/quran" },
    { title: "Таджвид", subtitle: "Правила чтения", icon: GraduationCap, to: "/quran/tajweed" },
    { title: "Основы Ислама", subtitle: "Вера, намаз и адаб", icon: Landmark, to: "/islamic-basics" }
  ];

  const languageSections = [
    { title: "Огласовки", symbol: "ـَ", to: "/harakat", desc: "Короткие звуки и чтение", progress: 22 },
    { title: "Словарь", symbol: "ك", to: "/vocabulary", desc: "Слова по темам", progress: 10 },
    { title: "Грамматика", symbol: "ن", to: "/grammar", desc: "Правила языка", progress: 8 },
    { title: "Чтение", symbol: "ق", to: "/reading", desc: "Тексты и суры", progress: 14 }
  ];

  const stats = [
    { label: "Изучено букв", value: `${progress.completedLetters.length}/${arabicLetters.length}`, icon: GraduationCap, progress: lettersPercent },
    { label: "Коран сегодня", value: `${quranToday}/${quranGoal}`, icon: BookOpenCheck, progress: quranPercent },
    { label: "Выучено сур", value: quranState?.memorizedSurahs?.length || 0, icon: Star, progress: Math.min(100, (quranState?.memorizedSurahs?.length || 0) * 8) },
    { label: "Серия дней", value: progress.streak || 0, icon: Flame, progress: Math.min(100, (progress.streak || 0) * 12) },
    { label: "Очки", value: points, icon: Sparkles, progress: Math.min(100, points / 5) }
  ];

  function completeMission() {
    setDailyMissionDone();
    setMissionDone(true);
    const updated = { ...progress, coins: (progress.coins || 0) + mission.reward, points: (progress.points || 0) + mission.reward };
    setProgress(updated);
  }

  const MissionIcon = mission.icon;

  return (
    <section className="premium-home">
      <div className="premium-home__bg" aria-hidden="true" />
      <div className="premium-home__light" aria-hidden="true" />
      <div className="premium-home__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
      </div>

      <div className="premium-home-layout">
        <aside className="premium-home-left">
          <section className="premium-home-card premium-home-hero">
            <div className="premium-home-hero__top">
              <div>
                <span className="premium-home-kicker">{birthdayToday ? "С днем рождения" : "Личный путь"}</span>
                <h1>Ассаляму алейкум, {greetingName}!</h1>
                <p>Сегодня отличный день для знаний.</p>
              </div>
              <div className="premium-home-avatar">
                <img src={characterImage} alt="Ахмад" />
              </div>
            </div>

            <div className="premium-home-hero__stats" aria-label="Краткая статистика">
              <span>
                <Sparkles size={17} aria-hidden="true" />
                <strong>{points}</strong>
                очков
              </span>
              <span>
                <Flame size={17} aria-hidden="true" />
                <strong>{progress.streak || 0}</strong>
                дней
              </span>
              <span>
                <Trophy size={17} aria-hidden="true" />
                <strong>{currentStageLabel}</strong>
                этап
              </span>
            </div>

            <div className="premium-home-motivation">
              <Target size={18} aria-hidden="true" />
              <span>Отличная работа! Продолжай путь знаний шаг за шагом.</span>
            </div>
          </section>

          <section className="premium-home-card premium-home-profile-quick">
            <div className="premium-home-section-head">
              <div>
                <span className="premium-home-kicker">Ученик</span>
                <h2>Мой прогресс</h2>
              </div>
              <UserRound size={21} aria-hidden="true" />
            </div>
            <div className="premium-home-mini-progress">
              <span>Путь букв</span>
              <strong>{lettersPercent}%</strong>
              <div><i style={{ width: `${lettersPercent}%` }} /></div>
            </div>
            <button className="premium-home-secondary" type="button" onClick={() => navigate("/profile")}>
              Открыть профиль
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </section>

          <section className="premium-home-card premium-home-allah-names">
            <div className="premium-home-allah-names__mark" aria-hidden="true">
              الله
            </div>
            <div>
              <span className="premium-home-kicker">99 имён Аллаха</span>
              <h2>Изучай и запоминай прекрасные имена Аллаха</h2>
            </div>
            <button type="button" onClick={() => navigate("/quran/names")} aria-label="Открыть 99 имён Аллаха">
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </section>
        </aside>

        <main className="premium-home-center">
          <section className="premium-home-card premium-home-continue">
            <div className="premium-home-letter" aria-hidden="true">{currentLetter.letter}</div>
            <div className="premium-home-continue__copy">
              <span className="premium-home-kicker">Продолжить обучение</span>
              <h2>Буква {currentLetter.nameRu}</h2>
              <p>Этап: {currentStageLabel}. Закрепи звук, письмо и чтение.</p>
              <div className="premium-home-progress-line" aria-label={`Прогресс урока ${lessonProgressPercent}%`}>
                <span style={{ width: `${lessonProgressPercent}%` }} />
              </div>
            </div>
            <div className="premium-home-continue__action">
              <strong>{lessonProgressPercent}%</strong>
              <button className="premium-home-primary" type="button" onClick={() => navigate(`/letter/${currentLetter.id}`)}>
                Продолжить
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className={`premium-home-card premium-home-mission${missionDone ? " is-done" : ""}`}>
            <div className="premium-home-mission__icon" style={{ "--mission-color": mission.color }}>
              <MissionIcon size={24} aria-hidden="true" />
            </div>
            <div className="premium-home-mission__body">
              <span className="premium-home-kicker">Задание дня</span>
              <h2>{mission.title}</h2>
              <p>{mission.desc}</p>
            </div>
            <div className="premium-home-mission__actions">
              <span className="premium-home-reward">
                <Star size={15} aria-hidden="true" />
                +{mission.reward} очков
              </span>
              {missionDone ? (
                <span className="premium-home-done">
                  <CheckCircle2 size={19} aria-hidden="true" />
                  Выполнено
                </span>
              ) : (
                <>
                  <button className="premium-home-primary" type="button" onClick={() => navigate(getMissionPath(mission, currentLetter))}>
                    Выполнить
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                  <button className="premium-home-link" type="button" onClick={completeMission}>Уже сделал</button>
                </>
              )}
            </div>
          </section>

          <section className="premium-home-stats" aria-label="Прогресс">
            {stats.map(({ label, value, icon: Icon, progress: statProgress }) => (
              <article className="premium-home-stat" key={label}>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
                <div><i style={{ width: `${statProgress}%` }} /></div>
              </article>
            ))}
          </section>

          <section className="premium-home-card premium-home-modules">
            <div className="premium-home-section-head">
              <div>
                <span className="premium-home-kicker">Арабский язык</span>
                <h2>Учебные модули</h2>
              </div>
              <Languages size={22} aria-hidden="true" />
            </div>
            <div className="premium-home-module-grid">
              {languageSections.map(({ title, symbol, to, desc, progress: moduleProgress }) => (
                <button className="premium-home-module" key={to} type="button" onClick={() => navigate(to)}>
                  <span className="premium-home-module__symbol">{symbol}</span>
                  <span className="premium-home-module__body">
                    <strong>{title}</strong>
                    <small>{desc}</small>
                    <i><b style={{ width: `${moduleProgress}%` }} /></i>
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="premium-home-right">
          <section className="premium-home-card premium-home-prayer">
            <div className="premium-home-section-head">
              <div>
                <span className="premium-home-kicker">Намаз</span>
                <h2>Следующий намаз</h2>
              </div>
              <Landmark size={22} aria-hidden="true" />
            </div>
            {hasPrayerData ? (
              <div className="premium-home-prayer__time">
                <strong>{prayerTimes.nextPrayer}</strong>
                <span>{prayerTimes.nextPrayerTime}</span>
                <p>Осталось: {prayerTimes.countdown}</p>
              </div>
            ) : (
              <div className="premium-home-empty">
                <Clock3 size={24} aria-hidden="true" />
                <strong>Время намаза скоро появится</strong>
                <p>Разрешите геолокацию, чтобы видеть точное время.</p>
              </div>
            )}
            <button className="premium-home-secondary" type="button" onClick={() => navigate("/namaz")}>
              Настроить
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>

          <section className="premium-home-card premium-home-quick">
            <div className="premium-home-section-head">
              <div>
                <span className="premium-home-kicker">Быстро</span>
                <h2>Разделы</h2>
              </div>
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <div className="premium-home-quick-grid">
              {quickSections.map(({ title, subtitle, icon: Icon, to }) => (
                <button className="premium-home-quick-card" key={title} type="button" onClick={() => navigate(to)}>
                  <Icon size={22} aria-hidden="true" />
                  <span>
                    <strong>{title}</strong>
                    <small>{subtitle}</small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>

          <section className="premium-home-card premium-home-activity">
            <div className="premium-home-section-head">
              <div>
                <span className="premium-home-kicker">Сегодня</span>
                <h2>Фокус дня</h2>
              </div>
              <Target size={22} aria-hidden="true" />
            </div>
            <div className="premium-home-activity-list">
              <span><BookOpen size={17} /> Буква {currentLetter.nameRu}</span>
              <span><BookOpenCheck size={17} /> Коран: {quranToday}/{quranGoal}</span>
              <span><Flame size={17} /> Серия: {progress.streak || 0} дней</span>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
