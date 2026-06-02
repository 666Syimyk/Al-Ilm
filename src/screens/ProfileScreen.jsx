import {
  ArrowRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Languages,
  LogOut,
  MoonStar,
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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.png";
import amina from "../assets/characters/amina.png";
import { arabicLetters, getLetterById } from "../data/arabicLetters.js";
import { PRAYERS } from "../data/namazGuide.js";
import { quranSurahs, getAyahByNumber, getSurahById } from "../data/quranContent.js";
import { tajweedLessons } from "../data/tajweedRules.js";
import { vocabularyWords } from "../data/vocabularyData.js";
import {
  clearSession,
  getAge,
  getDarkMode,
  getNamazProgress,
  getProfilePreferences,
  getProgress,
  getQuranState,
  getQuranTracking,
  getSelectedCharacter,
  getUser,
  resetLearningProgress,
  setDailyQuranGoal,
  setDarkMode,
  setProfilePreference
} from "../utils/storage.js";

const characterImages = { ahmad, amina };
const characterNames = { ahmad: "Ахмад", amina: "Амина" };
const PROFILE_GOALS = [1, 3, 5, 10];

const STATIC_SETTINGS = [
  { id: "data", title: "Мои данные", icon: UserRound, action: "data" },
  { id: "character", title: "Сменить персонажа", icon: ImageIcon, action: "character" },
  { id: "background", title: "Фон главной страницы", icon: Palette, action: "background" },
  { id: "language", title: "Язык", icon: Globe, value: "Русский" },
  { id: "notifications", title: "Уведомления", icon: Bell, value: "не настроены" },
  { id: "help", title: "Помощь", icon: HelpCircle }
];

const achievementCatalog = [
  { id: "young_student", title: "Первый урок", subtitle: "Начал обучение", icon: BookOpen, isUnlocked: (m) => m.lettersDone > 0 || m.savedAchievements.includes("young_student") || m.savedAchievements.includes("first_steps") },
  { id: "letter_expert", title: "Знаток букв", subtitle: "Изучил несколько букв", icon: Languages, isUnlocked: (m) => m.lettersDone >= 3 || m.savedAchievements.includes("letter_expert") },
  { id: "alphabet_master", title: "Мастер алфавита", subtitle: "Все буквы пройдены", icon: Trophy, isUnlocked: (m) => m.lettersDone >= arabicLetters.length || m.savedAchievements.includes("alphabet_master") },
  { id: "quran_reader", title: "Чтец Корана", subtitle: "Первый прочитанный аят", icon: BookOpenCheck, isUnlocked: (m) => m.readAyahs > 0 },
  { id: "quran_100", title: "100 аятов", subtitle: "Уверенное чтение", icon: Star, isUnlocked: (m) => m.readAyahs >= 100 },
  { id: "first_surah", title: "Первая сура", subtitle: "Сура отмечена выученной", icon: Bookmark, isUnlocked: (m) => m.memorizedSurahs > 0 },
  { id: "fatiha", title: "Аль-Фатиха", subtitle: "Выучил главную суру", icon: ShieldCheck, isUnlocked: (m) => m.fatihaMemorized },
  { id: "tajweed", title: "Таджвид", subtitle: "Изучает правила чтения", icon: GraduationCap, isUnlocked: (m) => m.tajweedDone > 0 },
  { id: "namaz", title: "Намаз", subtitle: "Практика молитвы", icon: CheckCircle2, isUnlocked: (m) => m.namazPractice > 0 || m.namazDone > 0 },
  { id: "vocabulary", title: "Первые слова", subtitle: "Запоминает арабские слова", icon: Languages, isUnlocked: (m) => m.vocabularyDone >= 10 },
  { id: "grammar", title: "Грамматика", subtitle: "Прошёл грамматический урок", icon: BookOpen, isUnlocked: (m) => m.grammarDone > 0 },
  { id: "strong_streak", title: "Серия", subtitle: "Учится регулярно", icon: Flame, isUnlocked: (m) => m.bestStreak >= 5 || m.savedAchievements.includes("strong_streak") }
];

function pct(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

function formatTodayLeft(done, goal) {
  const left = Math.max(0, goal - done);
  return left === 0 ? "цель выполнена" : `осталось ${left}`;
}

function resolveAyahRef(ref) {
  const [surahId, ayahNumber] = ref.split(":");
  const surah = getSurahById(surahId);
  const ayah = getAyahByNumber(surahId, ayahNumber);
  return ayah ? { ref, surah, ayah } : null;
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

function SettingRows({ darkMode, preferences, resetDone, onSetting, onDark, onPreference, onReset, onLogout }) {
  return (
    <div className="profile-settings-list">
      {STATIC_SETTINGS.map((row) => {
        const Icon = row.icon;
        return (
          <button className="profile-setting-row" key={row.id} type="button" onClick={() => onSetting(row)}>
            <div className="profile-setting-row__lead">
              <Icon size={22} aria-hidden="true" />
              <span>{row.title}</span>
            </div>
            {row.value ? <span className="profile-setting-row__value">{row.value}</span> : null}
            {row.toggle ? <span className={`profile-toggle ${row.checked ? "is-on" : ""}`} aria-hidden="true"><span /></span> : <ChevronRight size={20} aria-hidden="true" />}
          </button>
        );
      })}

      <button className="profile-setting-row" type="button" onClick={onDark}>
        <div className="profile-setting-row__lead">
          <MoonStar size={22} aria-hidden="true" />
          <span>Тёмная тема</span>
        </div>
        <span className={`profile-toggle ${darkMode ? "is-on" : ""}`} aria-hidden="true"><span /></span>
      </button>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <Volume2 size={22} aria-hidden="true" />
          <span>Звук</span>
        </div>
        <button className={`profile-toggle ${preferences.soundEnabled ? "is-on" : ""}`} type="button" onClick={() => onPreference("soundEnabled", !preferences.soundEnabled)} aria-label="Переключить звук"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <Languages size={22} aria-hidden="true" />
          <span>Показывать перевод</span>
        </div>
        <button className={`profile-toggle ${preferences.showTranslation ? "is-on" : ""}`} type="button" onClick={() => onPreference("showTranslation", !preferences.showTranslation)} aria-label="Переключить перевод"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <HelpCircle size={22} aria-hidden="true" />
          <span>Подсказки</span>
        </div>
        <button className={`profile-toggle ${preferences.showHints ? "is-on" : ""}`} type="button" onClick={() => onPreference("showHints", !preferences.showHints)} aria-label="Переключить подсказки"><span /></button>
      </div>

      <div className="profile-setting-row profile-setting-row--split">
        <div className="profile-setting-row__lead">
          <SlidersHorizontal size={22} aria-hidden="true" />
          <span>Размер арабского текста</span>
        </div>
        <select value={preferences.arabicTextSize} onChange={(event) => onPreference("arabicTextSize", event.target.value)}>
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
        <button className={`profile-toggle ${preferences.parentDigest ? "is-on" : ""}`} type="button" onClick={() => onPreference("parentDigest", !preferences.parentDigest)} aria-label="Переключить родительский обзор"><span /></button>
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
  const [darkMode, setDarkModeState] = useState(getDarkMode);
  const [preferences, setPreferences] = useState(getProfilePreferences);
  const [quranGoal, setQuranGoal] = useState(() => getQuranTracking().dailyGoal ?? 5);
  const [resetDone, setResetDone] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  const user = getUser() || { name: "Сыймык", email: "student@al-ilm.local" };
  const age = getAge() || 9;
  const character = getSelectedCharacter() || "ahmad";
  const progress = getProgress();
  const quranState = getQuranState();
  const tracking = getQuranTracking();
  const namazProgress = getNamazProgress();

  const currentLetter = getLetterById(progress.currentLesson) || arabicLetters[0];
  const currentImage = characterImages[character] || ahmad;
  const currentCharacterName = characterNames[character] || "Ахмад";
  const lastSurah = tracking.lastOpenedSurah ? quranSurahs.find((s) => s.id === tracking.lastOpenedSurah) : null;
  const quranAyahTotal = quranSurahs.reduce((sum, surah) => sum + surah.ayahs.length, 0);

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
  const tajweedPct = pct(quranState.tajweedProgress.length, tajweedLessons.length);
  const namazPct = pct(namazProgress.completedPrayers.length, PRAYERS.length);
  const dailyAverage = Math.round((quranTodayPct + alphabetPct + tajweedPct + namazPct) / 4);

  const stats = [
    { label: "Буквы", value: `${progress.completedLetters.length}/${arabicLetters.length}`, note: `${alphabetPct}% алфавита`, icon: BookOpen },
    { label: "Слова", value: progress.learnedVocabulary.length, note: `РёР· ${vocabularyWords.length}`, icon: Languages },
    { label: "Аяты", value: tracking.readAyahs.length, note: `из ${quranAyahTotal}`, icon: BookOpenCheck },
    { label: "Время", value: `${Math.max(5, metrics.bestStreak * 5)}Рј`, note: "сегодня", icon: Target },
    { label: "Уроки", value: progress.completedLetters.length + progress.completedGrammar.length, note: "завершено", icon: GraduationCap },
    { label: "Дни подряд", value: metrics.bestStreak, note: `уровень ${progress.level}`, icon: Flame }
  ];

  const difficultAyahs = tracking.difficultAyahs.map(resolveAyahRef).filter(Boolean).slice(0, 3);
  const repeatItems = difficultAyahs.length
    ? difficultAyahs.map(({ ref, surah, ayah }) => ({
      id: ref,
      title: `${surah.title}, аят ${ayah.number}`,
      note: ayah.translation,
      action: () => navigate(`/quran/surah/${surah.id}?ayah=${ayah.number}`)
    }))
    : [
      { id: "letter", title: `Буква ${currentLetter.nameRu}`, note: "Закрепи текущий урок букв", action: () => navigate(`/letter/${currentLetter.id}`) },
      { id: "quran", title: lastSurah ? `Продолжить ${lastSurah.title}` : "Начать Аль-Фатиху", note: "Лучше читать понемногу каждый день", action: () => navigate(lastSurah ? `/quran/surah/${lastSurah.id}` : "/quran/surah/al-fatihah") }
    ];

  const activity = [
    tracking.todayReadCount > 0 ? `Сегодня прочитано ${tracking.todayReadCount} аятов` : null,
    progress.completedLetters.length > 0 ? `Изучено букв: ${progress.completedLetters.length}` : null,
    quranState.memorizedSurahs.length > 0 ? `Выучено сур: ${quranState.memorizedSurahs.length}` : null,
    namazProgress.practiceCount > 0 ? `Практика намаза: ${namazProgress.practiceCount}` : null
  ].filter(Boolean).slice(0, 3);

  const parentNotes = [
    tracking.todayReadCount >= quranGoal ? "Дневная цель по Корану закрыта." : `По Корану сегодня осталось: ${Math.max(0, quranGoal - tracking.todayReadCount)} аятов.`,
    difficultAyahs.length ? `На повторении ${difficultAyahs.length} сложных аятов.` : "Сложных аятов пока нет.",
    progress.completedLetters.length < arabicLetters.length ? `Следующий фокус: буква ${currentLetter.nameRu}.` : "Алфавит пройден, можно усиливать чтение.",
    namazProgress.completedPrayers.length < PRAYERS.length ? "Намаз ещё можно закреплять по шагам." : "Раздел намаза выглядит уверенно."
  ];

  function toggleDark() {
    const next = !darkMode;
    setDarkModeState(next);
    setDarkMode(next);
  }

  function handleSetting(row) {
    if (row.action === "data") navigate("/profile/data");
    if (row.action === "character") navigate("/character");
    if (row.action === "background") navigate("/backgrounds");
  }

  function updatePreference(key, value) {
    setPreferences(setProfilePreference(key, value));
  }

  function handleGoalChange(goal) {
    setQuranGoal(goal);
    setDailyQuranGoal(goal);
  }

  function handleResetProgress() {
    if (!window.confirm("Сбросить учебный прогресс? Профиль, персонаж и фон останутся.")) return;
    resetLearningProgress();
    setResetDone(true);
    window.location.reload();
  }

  function logout() {
    clearSession();
    navigate("/login");
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
        <button type="button" onClick={() => setSettingsOpen(true)} aria-label="Открыть настройки">
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
              <strong>{alphabetPct}% XP</strong>
              <div className="profile-progress-bar"><span style={{ width: `${alphabetPct}%` }} /></div>
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
              <button type="button" onClick={() => setSettingsOpen(true)}><Settings size={17} />Настройки</button>
              <button type="button" onClick={() => setSettingsOpen(true)}><Globe size={17} />Язык</button>
              <button type="button" onClick={() => setSettingsOpen(true)}><Bell size={17} />Уведомления</button>
            </div>
          </section>
        </aside>

        <main className="premium-profile-center">
          <section className="premium-profile-card premium-profile-progress">
            <div className="profile-section-head">
              <div>
                <span className="section-kicker">Сегодняшний прогресс</span>
                <h2>Отличная работа!</h2>
              </div>
              <div className="premium-profile-ring" style={{ "--profile-progress": `${dailyAverage * 3.6}deg` }}>
                <strong>{dailyAverage}%</strong>
              </div>
            </div>
            <p>Продолжай путь знаний. Маленькие шаги каждый день ведут к сильному чтению.</p>
          </section>

          <section className="premium-profile-card">
            <div className="profile-section-head">
              <h2>Цели на сегодня</h2>
              <Target size={20} />
            </div>
            <div className="profile-goal-list">
              <ProgressLine label="Коран" done={tracking.todayReadCount} total={quranGoal} />
              <ProgressLine label="Арабский" done={Math.min(progress.completedLetters.length, 20)} total={20} />
              <ProgressLine label="Тажвид" done={Math.min(quranState.tajweedProgress.length, 10)} total={10} />
              <ProgressLine label="Намаз" done={Math.min(namazProgress.completedPrayers.length, 5)} total={5} />
            </div>
            <div className="quran-goal-pills">
              {PROFILE_GOALS.map((goal) => (
                <button key={goal} className={`quran-goal-pill${quranGoal === goal ? " is-active" : ""}`} type="button" onClick={() => handleGoalChange(goal)}>
                  {goal} аят{goal === 1 ? "" : "а"}
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

          <section className="premium-profile-card premium-profile-parent">
            <button className="premium-profile-collapse" type="button" onClick={() => setParentOpen((value) => !value)}>
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
          </section>

          <section className="premium-profile-card premium-profile-settings-preview">
            <div className="profile-section-head">
              <h2>Настройки</h2>
              <Settings size={19} />
            </div>
            <div className="premium-profile-preview-list">
              <span><Globe size={17} /> Русский</span>
              <span><Bell size={17} /> Напоминания не настроены</span>
              <span><MoonStar size={17} /> {darkMode ? "Тёмная тема" : "Светлая тема"}</span>
            </div>
            <button className="premium-profile-secondary" type="button" onClick={() => setSettingsOpen(true)}>
              Открыть настройки
            </button>
          </section>
        </aside>
      </div>

      <section className={`premium-profile-drawer ${settingsOpen ? "is-open" : ""}`} aria-hidden={!settingsOpen}>
        <button className="premium-profile-drawer__backdrop" type="button" onClick={() => setSettingsOpen(false)} aria-label="Закрыть настройки" />
        <div className="premium-profile-drawer__panel">
          <div className="profile-section-head">
            <div>
              <span className="section-kicker">Al-Ilm</span>
              <h2>Настройки</h2>
            </div>
            <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Закрыть">
              <X size={22} />
            </button>
          </div>
          <SettingRows
            darkMode={darkMode}
            preferences={preferences}
            resetDone={resetDone}
            onSetting={handleSetting}
            onDark={toggleDark}
            onPreference={updatePreference}
            onReset={handleResetProgress}
            onLogout={logout}
          />
        </div>
      </section>
    </section>
  );
}
