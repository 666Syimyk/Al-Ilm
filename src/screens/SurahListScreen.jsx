import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { quranSurahs } from "../data/quranContent.js";
import { beginnerSurahNumbers, getSurahReveal } from "../data/quranNavigation.js";
import { getQuranState, getQuranTracking } from "../utils/storage.js";

const FILTERS = [
  { key: "all", label: "По порядку 1–114" },
  { key: "beginner", label: "Для начинающих" },
  { key: "short", label: "Короткие" },
  { key: "memorized", label: "Выучено" }
];

const bySurahNumber = (a, b) => (a.number || 0) - (b.number || 0);

export default function SurahListScreen() {
  const navigate = useNavigate();
  const quranState = getQuranState();
  const tracking = getQuranTracking();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showEmpty, setShowEmpty] = useState(false);

  const { available, empty } = useMemo(() => {
    let list = [...quranSurahs].sort(bySurahNumber);

    if (filter === "beginner") list = list.filter((s) => beginnerSurahNumbers.has(s.number));
    else if (filter === "short") list = list.filter((s) => s.ayahs && s.ayahs.length > 0 && s.ayahs.length <= 10);
    else if (filter === "memorized") list = list.filter((s) => quranState.memorizedSurahs.includes(s.id));

    const normalized = query.trim().toLowerCase();
    if (normalized) {
      list = list.filter((surah) =>
        [surah.title, surah.arabicTitle, surah.translation, String(surah.number)].some(
          (value) => value?.toLowerCase().includes(normalized)
        )
      );
    }

    return {
      available: list.filter((s) => s.ayahs && s.ayahs.length > 0),
      empty: list.filter((s) => !s.ayahs || s.ayahs.length === 0),
    };
  }, [query, filter, quranState.memorizedSurahs]);

  function renderSurahCard(surah) {
    const memorized = quranState.memorizedSurahs.includes(surah.id);
    const isFavorite = tracking.favoriteSurahs.includes(surah.id);
    const hasContent = surah.ayahs && surah.ayahs.length > 0;
    const isBeginner = beginnerSurahNumbers.has(surah.number);
    const reveal = getSurahReveal(surah.number);
    return (
      <GlassCard
        as="button"
        className={`surah-list-card${!hasContent ? " surah-list-card--soon" : ""}${memorized ? " surah-list-card--memorized" : ""}`}
        key={surah.id}
        type="button"
        onClick={() => hasContent ? navigate(`/quran/surah/${surah.id}`) : undefined}
        aria-disabled={!hasContent}
      >
        <span className="surah-list-card__number">{surah.number}</span>
        <div className="surah-list-card__info">
          <h2>{surah.title}</h2>
          <p className="surah-list-card__arabic">{surah.arabicTitle}</p>
          <div className="surah-list-card__meta">
            {reveal && <span className="surah-meta-mini">{reveal}</span>}
            {surah.ayahs?.length > 0 && <span className="surah-meta-mini">{surah.ayahs.length} аятов</span>}
            {isBeginner && <span className="surah-meta-mini surah-meta-mini--green">начинающим</span>}
            {isFavorite && <span className="surah-meta-mini">в™Ґ</span>}
          </div>
        </div>
        <span className={`surah-status surah-status--${!hasContent ? "soon" : memorized ? "memorized" : surah.status?.replaceAll(" ", "-") || "new"}`}>
          {!hasContent ? "скоро" : memorized ? "выучено ✓" : surah.status || "не начато"}
        </span>
      </GlassCard>
    );
  }

  const totalShown = available.length + (showEmpty ? empty.length : 0);

  return (
    <section className="content-stack quran-inner-screen surah-list-screen">
      <Header title="Суры" subtitle="Читай, слушай и заучивай" compact />

      <GlassCard className="quran-search-panel">
        <Search size={20} aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти суру по названию или номеру"
        />
      </GlassCard>

      <div className="surah-filter-tabs">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`surah-filter-tab${filter === key ? " is-active" : ""}`}
            type="button"
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {totalShown === 0 && available.length === 0 ? (
        <GlassCard className="quran-warning-card">
          <p>Ничего не найдено</p>
        </GlassCard>
      ) : (
        <>
          {available.length > 0 && (
            <div className="surah-list-grid">
              {available.map(renderSurahCard)}
            </div>
          )}

          {empty.length > 0 && (
            <div className="surah-coming-soon-section">
              <button
                type="button"
                className="surah-coming-soon-toggle"
                onClick={() => setShowEmpty((v) => !v)}
              >
                {showEmpty
                  ? `Скрыть ${empty.length} сур (скоро) ▲`
                  : `Показать ещё ${empty.length} сур (контент скоро) ▼`}
              </button>
              {showEmpty && (
                <div className="surah-list-grid surah-list-grid--dimmed">
                  {empty.map(renderSurahCard)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
