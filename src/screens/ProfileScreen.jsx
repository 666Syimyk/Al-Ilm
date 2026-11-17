import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Flame,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Languages,
  LogOut,
  Palette,
  RotateCcw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Target,
  Trophy,
  UserRound,
  Volume2,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.webp";
import amina from "../assets/characters/amina.webp";
import { arabicLetters, getLetterById } from "../data/arabicLetters.js";
import { PRAYERS } from "../data/namazGuide.js";
import { tajweedLessons } from "../data/tajweedRules.js";
import { vocabularyWords } from "../data/vocabularyData.js";
import {
  clearSession,
  getNamazProgress,
  getProfilePreferences,
  getProgress,
  getQuranState,
  getQuranTracking,
  getSelectedCharacter,
  getUser,
  resetLearningProgress,
  getStoredValue,
  setDailyQuranGoal,
  setProfilePreference,
  setStoredValue
} from "../utils/storage.js";
import { countAyahs } from "../utils/plural.js";

const characterImages = { ahmad, amina };
const characterNames = { ahmad: "Ахмад", amina: "Амина" };
const PROFILE_GOALS = [1, 3, 5, 10];
const NOTIFICATIONS_KEY = "notificationsEnabled";
const ARABIC_SIZE_LABELS = { normal: "обычный", large: "большой", xlarge: "очень большой" };

const STATIC_SETTINGS = [
  { id: "data", title: "Мои данные", icon: UserRound, action: "data" },
  { id: "character", title: "Сменить персонажа", icon: ImageIcon, action: "character" },
  { id: "background", title: "Фон главной страницы", icon: Palette, action: "background" },
  { id: "notifications", title: "Уведомления", icon: Bell },
  { id: "help", title: "Помощь", icon: HelpCircle }
];

const achievementCatalog = [
  { id: "young_student", title: "Первый урок", subtitle: "Первый шаг сделан", icon: BookOpen, isUnlocked: (m) => m.lettersDone > 0 || m.savedAchievements.includes("young_student") || m.savedAchievements.includes("first_steps") },
  { id: "letter_expert", title: "Знаток букв", subtitle: "5 букв изучено", icon: Languages, isUnlocked: (m) => m.lettersDone >= 5 || m.savedAchievements.includes("letter_expert") },
  { id: "alphabet_master", title: "Мастер алфавита", subtitle: "Все буквы пройдены", icon: Trophy, isUnlocked: (m) => m.lettersDone >= arabicLetters.length || m.savedAchievements.includes("alphabet_master") },
  { id: "quran_reader", title: "Чтец Корана", subtitle: "Первый прочитанный аят", icon: BookOpenCheck, isUnlocked: (m) => m.readAyahs > 0 },
  { id: "quran_100", title: "100 аятов", subtitle: "Уверенное чтение", icon: Star, isUnlocked: (m) => m.readAyahs >= 100 },
  { id: "first_surah", title: "Первая сура", subtitle: "Сура отмечена выученной", icon: Bookmark, isUnlocked: (m) => m.memorizedSurahs > 0 },
  { id: "fatiha", title: "Аль-Фатиха", subtitle: "Главная сура выучена", icon: ShieldCheck, isUnlocked: (m) => m.fatihaMemorized },
  { id: "tajweed", title: "Таджвид", subtitle: "Изучает правила чтения", icon: GraduationCap, isUnlocked: (m) => m.tajweedDone > 0 },
  { id: "namaz", title: "Намаз", subtitle: "Практика молитвы", icon: CheckCircle2, isUnlocked: (m) => m.namazPractice > 0 || m.namazDone > 0 },
  { id: "vocabulary", title: "Первые слова", subtitle: "Запоминает арабские слова", icon: Languages, isUnlocked: (m) => m.vocabularyDone >= 10 },
  { id: "grammar", title: "Грамматика", subtitle: "Грамматический урок пройден", icon: BookOpen, isUnlocked: (m) => m.grammarDone > 0 },
  { id: "strong_streak", title: "Серия", subtitle: "7 дней подряд", icon: Flame, isUnlocked: (m) => m.bestStreak >= 7 || m.savedAchievements.includes("strong_streak") }
];

function pct(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function formatTodayLeft(done, goal) {
  const left = Math.max(0, goal - done);
  return left === 0 ? "цель выполнена" : `осталось ${left}`;
}

// Tanzil Uthmani has 6236 ayahs; the full text is not needed to show progress.
const QURAN_AYAH_TOTAL = 6236;

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return window.Notification.permission;
}

function getNotificationsEnabled() {
  return getStoredValue(NOTIFICATIONS_KEY, "false") === "true" && getNotificationPermission() === "granted";
}

function getNotificationLabel(enabled, permission) {
  if (permission === "unsupported") return "не поддерживаются";
  if (permission === "denied") return "запрещены";
  return enabled ? "включены" : "не настроены";
}

function ProgressLine({ label, value, done, total }) {
  return (
    <div className="profile-goal-row">
      <span>{label}</span>
      <strong>{value ?? `${done}/${total}`}</strong>
      <div className="profile-progress-bar">
        <span style={{ width: `${pct(done, total)}%` }} />
      </div>
    </div>
  );
}

function SettingRows({
  activePanel,
  notificationEnabled,
  notificationPermission,
  preferences,
  resetDone,
  onSetting,
  onPreference,
  onReset,
  onLogout
}) {
  const rows = STATIC_SETTINGS.map((row) => {
    if (row.id === "notifications") return { ...row, value: getNotificationLabel(notificationEnabled, notificationPermission) };
    return row;
  });

  return (
    <div className="profile-settings-list">
      {rows.map((row) => {
        const Icon = row.icon;
        return (
          <button className={`profile-setting-row ${activePanel === row.id ? "is-expanded" : ""}`} key={row.id} type="button" onClick={() => onSetting(row)}>
            <div className="profile-setting-row__lead">
              <Icon size={22} aria-hidden="true" />
              <span>{row.title}</span>
            </div>
            {row.value ? <span className="profile-setting-row__value">{row.value}</span> : null}
            {row.toggle ? <span className={`profile-toggle ${row.checked ? "is-on" : ""}`} aria-hidden="true"><span /></span> : <ChevronRight size={20} aria-hidden="true" />}
          </button>
        );
      })}

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <Volume2 size={22} aria-hidden="true" />
          <span>Звук</span>
        </div>
        <button className={`profile-toggle ${preferences.soundEnabled ? "is-on" : ""}`} type="button" role="switch" aria-checked={preferences.soundEnabled} onClick={() => onPreference("soundEnabled", !preferences.soundEnabled)} aria-label="Звук"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <Languages size={22} aria-hidden="true" />
          <span>Перевод фраз и дуа</span>
        </div>
        <button className={`profile-toggle ${preferences.showTranslation ? "is-on" : ""}`} type="button" role="switch" aria-checked={preferences.showTranslation} onClick={() => onPreference("showTranslation", !preferences.showTranslation)} aria-label="Перевод фраз и дуа"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <HelpCircle size={22} aria-hidden="true" />
          <span>Подсказки</span>
        </div>
        <button className={`profile-toggle ${preferences.showHints ? "is-on" : ""}`} type="button" role="switch" aria-checked={preferences.showHints} onClick={() => onPreference("showHints", !preferences.showHints)} aria-label="Подсказки"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <SlidersHorizontal size={22} aria-hidden="true" />
          <span>Размер арабского текста</span>
        </div>
        <select aria-label="Размер арабского текста" value={preferences.arabicTextSize} onChange={(event) => onPreference("arabicTextSize", event.target.value)}>
          <option value="normal">Обычный</option>
          <option value="large">Большой</option>
          <option value="xlarge">Очень большой</option>
        </select>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <ShieldCheck size={22} aria-hidden="true" />
          <span>Родительский обзор</span>
        </div>
        <button className={`profile-toggle ${preferences.parentDigest ? "is-on" : ""}`} type="button" role="switch" aria-checked={preferences.parentDigest} onClick={() => onPreference("parentDigest", !preferences.parentDigest)} aria-label="Родительский обзор"><span /></button>
      </div>

      <button className="profile-setting-row profile-setting-row--danger" type="button" onClick={onReset}>
        <div className="profile-setting-row__lead">
          <RotateCcw size={22} aria-hidden="true" />
          <span>{resetDone ? "Прогресс сброшен" : "Сбросить прогресс"}</span>
        </div>
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      <button className="profile-setting-row profile-setting-row--danger" type="button" onClick={onLogout}>
        <div className="profile-setting-row__lead">
          <LogOut size={22} aria-hidden="true" />
          <span>Выйти из аккаунта</span>
        </div>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(getProfilePreferences);
  const [quranGoal, setQuranGoal] = useState(() => getQuranTracking().dailyGoal ?? 5);
  const [resetDone, setResetDone] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeSettingsPanel, setActiveSettingsPanel] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(getNotificationsEnabled);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);
  const settingsPanelRef = useRef(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const previousFocus = document.activeElement;
    const panel = settingsPanelRef.current;
    document.body.classList.add("is-dialog-open");
    panel?.querySelector("button")?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") { setSettingsOpen(false); return; }
      if (event.key !== "Tab") return;
      const controls = [...panel.querySelectorAll('button:not(:disabled), select, input, a[href], [tabindex="0"]')].filter((element) => element.getClientRects().length);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("is-dialog-open");
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [settingsOpen]);

  const user = getUser() || { name: "Ученик", email: "" };
  const character = getSelectedCharacter() || "ahmad";
  const progress = getProgress();
  const quranState = getQuranState();
  const tracking = getQuranTracking();
  const namazProgress = getNamazProgress();

  const currentLetter = getLetterById(progress.currentLesson) || arabicLetters[0];
  const currentImage = characterImages[character] || ahmad;
  const currentCharacterName = characterNames[character] || "Ахмад";
  const quranAyahTotal = QURAN_AYAH_TOTAL;

  const metrics = useMemo(() => ({
    savedAchievements: progress.achievements,
    lettersDone: progress.completedLetters.length,
    readAyahs: tracking.readAyahs.length,
    memorizedAyahs: tracking.memorizedAyahs.length,
    memorizedSurahs: quranState.memorizedSurahs.length,
    fatihaMemorized: quranState.memorizedSurahs.includes("al-fatihah"),
    tajweedDone: quranState.tajweedProgress.length,
    vocabularyDone: progress.learnedVocabulary.length,
    grammarDone: progress.completedGrammar.length,
    namazDone: namazProgress.completedPrayers.length,
    namazPractice: namazProgress.practiceCount,
    bestStreak: Math.max(progress.streak, tracking.streakDays)
  }), [progress, quranState, tracking, namazProgress]);

  const achievements = achievementCatalog.map((achievement) => ({ ...achievement, unlocked: achievement.isUnlocked(metrics) }));
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const visibleAchievements = achievementsOpen ? achievements : achievements.slice(0, 6);

  const alphabetPct = pct(progress.completedLetters.length, arabicLetters.length);
  const quranReadPct = pct(tracking.readAyahs.length, quranAyahTotal);
  const quranTodayPct = pct(tracking.todayReadCount, quranGoal);
  const levelPct = Math.min(100, Math.round(((progress.points % 150) / 150) * 100));

  const stats = [
    { label: "Буквы", value: `${progress.completedLetters.length}/${arabicLetters.length}`, note: `${alphabetPct}% алфавита`, icon: BookOpen },
    { label: "Слова", value: progress.learnedVocabulary.length, note: `из ${vocabularyWords.length}`, icon: Languages },
    { label: "Аяты", value: tracking.readAyahs.length, note: `из ${quranAyahTotal}`, icon: BookOpenCheck },
    { label: "Аяты сегодня", value: tracking.todayReadCount, note: `цель: ${quranGoal}`, icon: Target },
    { label: "Уроки", value: progress.completedLetters.length + progress.completedGrammar.length, note: "завершено", icon: GraduationCap },
    { label: "Дни подряд", value: metrics.bestStreak, note: `уровень ${progress.level}`, icon: Flame }
  ];

  const activity = [
    tracking.todayReadCount > 0 ? `Сегодня прочитано: ${countAyahs(tracking.todayReadCount)}` : null,
    progress.completedLetters.length > 0 ? `Изучено букв: ${progress.completedLetters.length}` : null,
    quranState.memorizedSurahs.length > 0 ? `Выучено сур: ${quranState.memorizedSurahs.length}` : null,
    namazProgress.practiceCount > 0 ? `Практика намаза: ${namazProgress.practiceCount}` : null
  ].filter(Boolean).slice(0, 3);

  const parentNotes = [
    tracking.todayReadCount >= quranGoal ? "Дневная цель по Корану закрыта." : `По Корану сегодня осталось: ${countAyahs(Math.max(0, quranGoal - tracking.todayReadCount))}.`,
    tracking.difficultAyahs.length ? `Сложных аятов на повторении: ${tracking.difficultAyahs.length}.` : "Сложных аятов пока нет.",
    progress.completedLetters.length < arabicLetters.length ? `Следующий фокус: буква ${currentLetter.nameRu}.` : "Алфавит пройден, можно усиливать чтение.",
    namazProgress.completedPrayers.length < PRAYERS.length ? "Намаз ещё можно закреплять по шагам." : "Раздел намаза выглядит уверенно."
  ];

  function handleSetting(row) {
    if (row.action === "data") {
      navigate("/profile/data");
      return;
    }
    if (row.action === "character") {
      navigate("/character");
      return;
    }
    if (row.action === "background") {
      navigate("/backgrounds");
      return;
    }
    setSettingsOpen(true);
    setActiveSettingsPanel((current) => current === row.id ? "" : row.id);
    setSettingsMessage("");
  }

  function updatePreference(key, value) {
    const next = setProfilePreference(key, value);
    setPreferences(next);
    const labels = {
      soundEnabled: value ? "Звук включён." : "Звук выключен.",
      showTranslation: value ? "Перевод будет показываться." : "Перевод скрыт.",
      showHints: value ? "Подсказки включены." : "Подсказки выключены.",
      parentDigest: value ? "Родительский обзор включён." : "Родительский обзор выключен.",
      arabicTextSize: "Размер арабского текста сохранён."
    };
    setSettingsMessage(labels[key] || "Настройка сохранена.");
  }

  function handleGoalChange(goal) {
    setQuranGoal(goal);
    setDailyQuranGoal(goal);
  }

  function handleResetProgress() {
    if (!window.confirm("Сбросить учебный прогресс? Профиль, персонаж и фон останутся.")) return;
    resetLearningProgress();
    setResetDone(true);
    setSettingsMessage("Прогресс сброшен. Можно начать обучение заново.");
  }

  function logout() {
    clearSession();
    navigate("/login");
  }

  function openSettings(panel = "") {
    setSettingsOpen(true);
    setActiveSettingsPanel(panel);
    setSettingsMessage("");
  }

  async function toggleNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStoredValue(NOTIFICATIONS_KEY, "false");
      setNotificationEnabled(false);
      setNotificationPermission("unsupported");
      setSettingsMessage("Этот браузер не поддерживает уведомления.");
      return;
    }

    if (notificationEnabled) {
      setStoredValue(NOTIFICATIONS_KEY, "false");
      setNotificationEnabled(false);
      setNotificationPermission(window.Notification.permission);
      setSettingsMessage("Уведомления выключены.");
      return;
    }

    let permission = window.Notification.permission;
    if (permission === "default") {
      try {
        permission = await window.Notification.requestPermission();
      } catch {
        permission = "denied";
      }
    }

    const enabled = permission === "granted";
    setStoredValue(NOTIFICATIONS_KEY, enabled ? "true" : "false");
    setNotificationEnabled(enabled);
    setNotificationPermission(permission);
    setSettingsMessage(enabled ? "Уведомления включены." : "Браузер не разрешил уведомления.");
  }

  function renderSettingsPanel() {
    if (activeSettingsPanel === "notifications") {
      return (
        <div className="profile-setting-panel">
          <h3>Уведомления</h3>
          <p>Напоминания о намазе работают, пока открыт раздел «Намаз» и разрешены уведомления браузера. При закрытом приложении доставка не гарантируется.</p>
          <button className="button button--primary" type="button" onClick={toggleNotifications}>
            <Bell size={18} aria-hidden="true" />
            {notificationEnabled ? "Выключить уведомления" : "Включить уведомления"}
          </button>
          <small>Статус: {getNotificationLabel(notificationEnabled, notificationPermission)}</small>
        </div>
      );
    }

    if (activeSettingsPanel === "help") {
      return (
        <div className="profile-setting-panel">
          <h3>Помощь</h3>
          <p>Быстрые действия для проверки профиля и продолжения обучения.</p>
          <div className="profile-setting-actions">
            <button className="button button--soft" type="button" onClick={() => navigate("/profile/data")}>Мои данные</button>
            <button className="button button--soft" type="button" onClick={() => navigate("/lessons")}>Карта уроков</button>
            <button className="button button--soft" type="button" onClick={() => navigate("/namaz")}>Намаз</button>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <section className="profile-screen premium-profile">
      <div className="premium-profile__bg" aria-hidden="true" />
      <div className="premium-profile__particles" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <span key={index} style={{ "--i": index }} />)}
      </div>

      <header className="premium-profile-appbar">
        <div>
          <span>Al-Ilm</span>
          <h1>Профиль</h1>
        </div>
        <button type="button" onClick={() => openSettings()} aria-label="Открыть настройки">
          <Settings size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="premium-profile-layout">
        <aside className="premium-profile-left">
          <section className="premium-profile-card premium-profile-hero">
            <div className="premium-profile-avatar">
              <img src={currentImage} alt={currentCharacterName} />
            </div>
            <h2>{user.name}</h2>
            <p>Стремлюсь к знаниям</p>
            <div className="premium-profile-level">
              <span>Уровень {progress.level}</span>
              <strong>{progress.points} XP</strong>
              <div className="profile-progress-bar" aria-label={`До следующего уровня: ${levelPct}%`}><span style={{ width: `${levelPct}%` }} /></div>
            </div>
            <div className="premium-profile-mini">
              <span><Flame size={16} /> {metrics.bestStreak} дней</span>
              <span><Trophy size={16} /> {unlockedAchievements}/{achievements.length}</span>
            </div>
            <button className="premium-profile-primary" type="button" onClick={() => navigate(`/letter/${currentLetter.id}`)}>
              Продолжить урок
              <ArrowRight size={18} />
            </button>
            <div className="premium-profile-actions">
              <button type="button" onClick={() => navigate("/profile/data")}><UserRound size={17} />Профиль</button>
              <button type="button" onClick={() => openSettings()}><Settings size={17} />Настройки</button>
              <button type="button" onClick={() => navigate("/backgrounds")}><Palette size={17} />Фон</button>
              <button type="button" onClick={() => openSettings("notifications")}><Bell size={17} />Уведомления</button>
            </div>
          </section>
        </aside>

        <main className="premium-profile-center">
          <section className="premium-profile-card premium-profile-progress">
            <div className="profile-section-head">
              <div>
                <span className="section-kicker">Коран · сегодня</span>
                <h2>{tracking.todayReadCount >= quranGoal ? "Цель выполнена!" : "Шаг за шагом"}</h2>
              </div>
              <div className="premium-profile-ring" style={{ "--profile-progress": `${quranTodayPct * 3.6}deg` }}>
                <strong>{quranTodayPct}%</strong>
              </div>
            </div>
            <p>Продолжай путь знаний. Маленькие шаги каждый день ведут к сильному чтению.</p>
          </section>

          <section className="premium-profile-card">
            <div className="profile-section-head">
              <h2>Учебный прогресс</h2>
              <Target size={20} />
            </div>
            <div className="profile-goal-list">
              <ProgressLine label="Аяты сегодня" done={tracking.todayReadCount} total={quranGoal} />
              <ProgressLine label="Буквы · всего" done={progress.completedLetters.length} total={arabicLetters.length} />
              <ProgressLine label="Таджвид · всего" done={quranState.tajweedProgress.length} total={tajweedLessons.length} />
              <ProgressLine label="Намаз · изучено" done={namazProgress.completedPrayers.length} total={PRAYERS.length} />
            </div>
            <div className="quran-goal-pills">
              {PROFILE_GOALS.map((goal) => (
                <button key={goal} className={`quran-goal-pill${quranGoal === goal ? " is-active" : ""}`} type="button" aria-pressed={quranGoal === goal} onClick={() => handleGoalChange(goal)}>
                  {goal} {goal === 1 ? "аят" : goal < 5 ? "аята" : "аятов"}
                </button>
              ))}
            </div>
          </section>

          <section className="premium-profile-card premium-profile-continue">
            <div className="premium-profile-letter">{currentLetter.letter}</div>
            <div>
              <span className="section-kicker">Текущий урок</span>
              <h2>Буква {currentLetter.nameRu}</h2>
              <p>Прослушай, обведи, закрепи в мини-игре и получи награду.</p>
              <div className="profile-progress-bar"><span style={{ width: `${alphabetPct}%` }} /></div>
            </div>
            <button className="premium-profile-primary" type="button" onClick={() => navigate(`/letter/${currentLetter.id}`)}>
              Продолжить
              <ArrowRight size={18} />
            </button>
          </section>

          <section className="premium-profile-card premium-profile-names">
            <div className="premium-profile-names__mark" aria-hidden="true">الله</div>
            <div>
              <span className="section-kicker">99 имён Аллаха</span>
              <h2>Прекрасные имена и значения</h2>
              <p>Изучай по карточкам, ищи имя и отмечай выученное.</p>
            </div>
            <button className="premium-profile-secondary" type="button" onClick={() => navigate("/quran/names")}>
              Открыть
              <ChevronRight size={17} />
            </button>
          </section>

          <section className="premium-profile-stats">
            {stats.map(({ label, value, note, icon: Icon }) => (
              <article className="premium-profile-stat" key={label}>
                <Icon size={21} aria-hidden="true" />
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </section>
        </main>

        <aside className="premium-profile-right">
          <section className="premium-profile-card premium-profile-achievements">
            <div className="profile-section-head">
              <h2>Достижения</h2>
              <button type="button" onClick={() => setAchievementsOpen((value) => !value)}>
                {achievementsOpen ? "Скрыть" : "Смотреть все"}
              </button>
            </div>
            <div className="profile-achievement-grid">
              {visibleAchievements.map(({ id, title, subtitle, icon: Icon, unlocked }) => (
                <article className={`profile-achievement ${unlocked ? "is-unlocked" : "is-locked"}`} key={id}>
                  <div className="profile-achievement__shield"><Icon size={22} /></div>
                  <strong>{title}</strong>
                  <small>{unlocked ? subtitle : "Закрыто"}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="premium-profile-card">
            <div className="profile-section-head">
              <h2>Активность</h2>
              <BookOpen size={19} />
            </div>
            <div className="profile-history-list">
              {(activity.length ? activity : ["Начни первый урок, и здесь появится история занятий."]).map((item) => (
                <div className="profile-history-row" key={item}>
                  <CheckCircle2 size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {preferences.parentDigest && <section className="premium-profile-card premium-profile-parent">
            <button className="premium-profile-collapse" type="button" aria-expanded={parentOpen} onClick={() => setParentOpen((value) => !value)}>
              <span><ShieldCheck size={19} /> Родительский обзор</span>
              <ChevronRight className={parentOpen ? "is-open" : ""} size={19} />
            </button>
            <div className="profile-parent-summary">
              <strong>{quranReadPct}% Корана прочитано</strong>
              <p>{tracking.readAyahs.length} из {quranAyahTotal} аятов.</p>
            </div>
            {parentOpen ? (
              <div className="profile-parent-list">
                {parentNotes.map((note) => <span key={note}>{note}</span>)}
              </div>
            ) : null}
          </section>}

          <section className="premium-profile-card premium-profile-settings-preview">
            <div className="profile-section-head">
              <h2>Настройки</h2>
              <Settings size={19} />
            </div>
            <div className="premium-profile-preview-list">
              <span><Volume2 size={17} /> Звук: {preferences.soundEnabled ? "включён" : "выключен"}</span>
              <span><Bell size={17} /> Уведомления: {getNotificationLabel(notificationEnabled, notificationPermission)}</span>
              <span><SlidersHorizontal size={17} /> Арабский текст: {ARABIC_SIZE_LABELS[preferences.arabicTextSize] || ARABIC_SIZE_LABELS.large}</span>
            </div>
            <button className="premium-profile-secondary" type="button" onClick={() => openSettings()}>
              Открыть настройки
            </button>
          </section>

          <section className="premium-profile-card">
            <div className="profile-section-head">
              <h2>Источники данных</h2>
              <ShieldCheck size={19} />
            </div>
            <p className="profile-sources-note">Арабский текст: Tanzil · Аудио: EveryAyah / Alafasy · Перевод смыслов: источник уточняется</p>
            <button className="premium-profile-secondary" type="button" onClick={() => navigate("/sources")}>
              Подробнее об источниках
            </button>
          </section>
        </aside>
      </div>

      {settingsOpen && <section className="premium-profile-drawer is-open">
        <button className="premium-profile-drawer__backdrop" type="button" tabIndex={-1} onClick={() => setSettingsOpen(false)} aria-label="Закрыть настройки" />
        <div ref={settingsPanelRef} className="premium-profile-drawer__panel" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title">
          <div className="profile-section-head">
            <div>
              <span className="section-kicker">Al-Ilm</span>
              <h2 id="profile-settings-title">Настройки</h2>
            </div>
            <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Закрыть">
              <X size={22} />
            </button>
          </div>
          <SettingRows
            activePanel={activeSettingsPanel}
            notificationEnabled={notificationEnabled}
            notificationPermission={notificationPermission}
            preferences={preferences}
            resetDone={resetDone}
            onSetting={handleSetting}
            onPreference={updatePreference}
            onReset={handleResetProgress}
            onLogout={logout}
          />
          {renderSettingsPanel()}
          {settingsMessage ? <p className="profile-setting-status" role="status">{settingsMessage}</p> : null}
        </div>
      </section>}
    </section>
  );
}
