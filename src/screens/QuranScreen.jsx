import {
  ArrowRight,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Headphones,
  ListOrdered,
  Repeat2,
  Search,
  Sparkles,
  Star,
  Target,
  UserRound
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.webp";
import amina from "../assets/characters/amina.webp";
import { quranSections, quranSurahs } from "../data/quranContent.js";
import { getQuranState, getQuranTracking, getSelectedCharacter, setDailyQuranGoal } from "../utils/storage.js";

const characterImages = { ahmad, amina };

const sectionIcons = {
  reading: BookOpenCheck,
  surahs: Headphones,
  juz: ListOrdered,
  memorization: Repeat2,
  tajweed: GraduationCap,
  "reading-hints": BookOpenCheck,
  "allah-names": Sparkles,
  prophets: UserRound,
  search: Search,
  bookmarks: Bookmark
};

const DAILY_GOALS = [1, 3, 5, 10];

const LEARN_PATH = [
  { number: 1, title: "Аль-Фатиха", id: "al-fatihah", desc: "Первая и самая важная сура" },
  { number: 114, title: "Ан-Нас", id: "an-nas", desc: "Короткая сура для защиты" },
  { number: 113, title: "Аль-Фаляк", id: "al-falaq", desc: "Утреннее и вечернее чтение" },
  { number: 112, title: "Аль-Ихлас", id: "al-ikhlas", desc: "Сура о единобожии" },
  { number: 111, title: "Аль-Масад", id: "al-masad", desc: "Закрепление коротких сур" },
  { number: 110, title: "Ан-Наср", id: "an-nasr", desc: "Помощь и победа" },
  { number: 109, title: "Аль-Кафирун", id: "al-kafirun", desc: "Уверенность в вере" },
  { number: 108, title: "Аль-Каусар", id: "al-kawthar", desc: "Благой дар" },
  { number: 107, title: "Аль-Маун", id: "al-maun", desc: "Добрые дела и забота" }
];

function goalLabel(goal) {
  if (goal === 1) return "1 аят";
  return `${goal} ${goal < 5 ? "аята" : "аятов"}`;
}

export default function QuranScreen() {
  const navigate = useNavigate();
  const character = getSelectedCharacter() || "ahmad";
  const characterImage = characterImages[character] || ahmad;
  const quranState = getQuranState();
  const tracking = getQuranTracking();
  const [activeGoal, setActiveGoalState] = useState(() => tracking.dailyGoal ?? 1);

  const todayPct = activeGoal > 0 ? Math.min(100, Math.round((tracking.todayReadCount / activeGoal) * 100)) : 0;
  const favSurahs = quranSurahs.filter((surah) => tracking.favoriteSurahs.includes(surah.id) && surah.ayahs?.length > 0);
  const lastSurah = tracking.lastOpenedSurah ? quranSurahs.find((surah) => surah.id === tracking.lastOpenedSurah) : null;
  const startSurah = lastSurah || quranSurahs.find((surah) => surah.id === "al-fatihah") || quranSurahs[0];
  const surahReadCount = startSurah.ayahs.filter((ayah) => tracking.readAyahs.includes(`${startSurah.id}:${ayah.number}`)).length;
  const surahReadPct = Math.round(surahReadCount / startSurah.ayahs.length * 100);
  const rewards = [
    { title: "Первый аят", done: tracking.readAyahs.length > 0, note: "Прочитай 1 аят" },
    { title: "Аль-Фатиха", done: quranState.memorizedSurahs.includes("al-fatihah"), note: "Отметь суру выученной" },
    { title: "Первые 5 сур", done: quranState.memorizedSurahs.length >= 5, note: "Выучи 5 сур" },
    { title: "100 аятов", done: tracking.readAyahs.length >= 100, note: "Прочитай 100 аятов" }
  ];
  const completedPathCount = LEARN_PATH.filter((surah) => quranState.memorizedSurahs.includes(surah.id)).length;
  const currentPathIndex = LEARN_PATH.findIndex((surah) => !quranState.memorizedSurahs.includes(surah.id));
  const currentPathId = currentPathIndex >= 0 ? LEARN_PATH[currentPathIndex].id : LEARN_PATH[LEARN_PATH.length - 1]?.id;

  function handleGoalChange(goal) {
    setDailyQuranGoal(goal);
    setActiveGoalState(goal);
  }

  return (
    <section className="premium-quran">
      <div className="premium-quran__bg" aria-hidden="true" />
      <div className="premium-quran__light" aria-hidden="true" />
      <div className="premium-quran__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => <span key={index} />)}
      </div>

      <header className="premium-quran-appbar">
        <div>
          <span>Читай, слушай и учи постепенно</span>
          <h1>Коран</h1>
        </div>
        <div className="premium-quran-appbar__actions">
          <button type="button" onClick={() => navigate("/quran/search")} aria-label="Поиск">
            <Search size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigate("/quran/bookmarks")} aria-label="Закладки">
            <Bookmark size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="premium-quran-layout">
        <aside className="premium-quran-left">
          <section className="premium-quran-card premium-quran-hero">
            <div className="premium-quran-hero__copy">
              <span className="premium-quran-kicker">Коран</span>
              <h2>Читай, слушай и учи постепенно</h2>
              <p>Начни с коротких сур. Слушай, повторяй и читай внимательно.</p>
            </div>
            <div className="premium-quran-hero__character">
              <img src={characterImage} alt={character === "amina" ? "Амина" : "Ахмад"} />
            </div>
            <button className="premium-quran-primary" type="button" onClick={() => navigate(`/quran/surah/${startSurah.id}`)}>
              Продолжить
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>

          <section className="premium-quran-card premium-quran-progress">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Сегодняшний прогресс</span>
                <h2>{tracking.todayReadCount} из {activeGoal} аятов</h2>
              </div>
              <div className="premium-quran-ring" style={{ "--quran-ring": `${todayPct * 3.6}deg` }}>
                <strong>{todayPct}%</strong>
              </div>
            </div>
            <div className="premium-quran-progress__bar" aria-label={`Дневная цель ${todayPct}%`}>
              <span style={{ width: `${todayPct}%` }} />
            </div>
            <div className="premium-quran-stat-grid">
              <span><strong>{quranState.memorizedSurahs.length}</strong>Выучено сур</span>
              <span><strong>{tracking.difficultAyahs.length}</strong>Сложных аятов</span>
              <span><strong>{tracking.readAyahs.length}</strong>Всего прочитано</span>
              <span><strong>{tracking.streakDays}</strong>Серия дней</span>
            </div>
          </section>

          <section className="premium-quran-card premium-quran-goal">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Ежедневная цель</span>
                <h2>Выбери цель на сегодня</h2>
              </div>
              <Target size={22} aria-hidden="true" />
            </div>
            <div className="premium-quran-goal__pills">
              {DAILY_GOALS.map((goal) => (
                <button
                  key={goal}
                  className={activeGoal === goal ? "is-active" : ""}
                  type="button"
                  aria-pressed={activeGoal === goal}
                  onClick={() => handleGoalChange(goal)}
                >
                  {goalLabel(goal)}
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="premium-quran-center">
          <section className="premium-quran-card premium-quran-start">
            <div className="premium-quran-start__icon">
              <BookOpen size={34} aria-hidden="true" />
            </div>
            <div className="premium-quran-start__copy">
              <span className="premium-quran-kicker">{lastSurah ? "Продолжить чтение" : "С чего начать"}</span>
              <h2>{lastSurah ? lastSurah.title : "Начни с Аль-Фатиха"}</h2>
              <p>{lastSurah ? lastSurah.arabicTitle : "Первая и самая важная сура"}</p>
              <div className="premium-quran-progress__bar" aria-label={`Прочитано ${surahReadCount} из ${startSurah.ayahs.length} аятов суры`}>
                <span style={{ width: `${surahReadPct}%` }} />
              </div>
            </div>
            <button className="premium-quran-primary" type="button" onClick={() => navigate(`/quran/surah/${startSurah.id}`)}>
              {lastSurah ? "Открыть" : "Начать"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>

          <section className="premium-quran-card premium-quran-path">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Путь обучения</span>
                <h2>Первые суры</h2>
              </div>
              <span className="premium-quran-pill">{completedPathCount}/{LEARN_PATH.length}</span>
            </div>
            <div className="premium-quran-path__list">
              {LEARN_PATH.map((surah) => {
                const done = quranState.memorizedSurahs.includes(surah.id);
                const isCurrent = surah.id === currentPathId && !done;
                return (
                  <button
                    className={`premium-quran-path-step ${done ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                    key={surah.id}
                    type="button"
                    onClick={() => navigate(`/quran/surah/${surah.id}`)}
                  >
                    <span className="premium-quran-path-step__num">
                      {done ? <CheckCircle2 size={18} /> : surah.number}
                    </span>
                    <span className="premium-quran-path-step__body">
                      <strong>{surah.title}</strong>
                      <small>{surah.desc}</small>
                    </span>
                    <ChevronRight size={17} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="premium-quran-right">
          <section className="premium-quran-card premium-quran-sections">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Разделы</span>
                <h2>Открыть</h2>
              </div>
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <div className="premium-quran-section-grid">
              {quranSections.map((section) => {
                const Icon = sectionIcons[section.id] || BookOpenCheck;
                return (
                  <button className="premium-quran-section-link" key={section.id} type="button" onClick={() => navigate(section.to)}>
                    <Icon size={22} aria-hidden="true" />
                    <span>
                      <strong>{section.title}</strong>
                      <small>{section.description}</small>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="premium-quran-card premium-quran-search">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Поиск</span>
                <h2>Найди суру, аят или слово</h2>
              </div>
              <Search size={22} aria-hidden="true" />
            </div>
            <button className="premium-quran-search__input" type="button" onClick={() => navigate("/quran/search")}>
              <Search size={18} aria-hidden="true" />
              <span>Найди суру, аят или слово</span>
            </button>
            <div className="premium-quran-filter-chips">
              <span>Суры</span>
              <span>Аяты</span>
              <span>Закладки</span>
              <span>Заучивание</span>
            </div>
          </section>

          {favSurahs.length > 0 ? (
            <section className="premium-quran-card premium-quran-bookmarks">
              <div className="premium-quran-section-head">
                <div>
                  <span className="premium-quran-kicker">Закладки</span>
                  <h2>Избранные суры</h2>
                </div>
                <Star size={20} aria-hidden="true" />
              </div>
              <div className="premium-quran-fav-list">
                {favSurahs.slice(0, 3).map((surah) => (
                  <button key={surah.id} type="button" onClick={() => navigate(`/quran/surah/${surah.id}`)}>
                    <span>{surah.number}. {surah.title}</span>
                    <small dir="rtl">{surah.arabicTitle}</small>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="premium-quran-card premium-quran-rewards">
            <div className="premium-quran-section-head">
              <div>
                <span className="premium-quran-kicker">Награды</span>
                <h2>Ближайшие цели</h2>
              </div>
              <BookMarked size={22} aria-hidden="true" />
            </div>
            <div className="premium-quran-reward-grid">
              {rewards.map((reward) => (
                <div className={`premium-quran-reward ${reward.done ? "is-open" : ""}`} key={reward.title}>
                  {reward.done ? <CheckCircle2 size={20} aria-hidden="true" /> : <Target size={20} aria-hidden="true" />}
                  <strong>{reward.title}</strong>
                  <small>{reward.done ? "Выполнено" : reward.note}</small>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
