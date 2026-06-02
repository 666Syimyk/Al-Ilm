import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { quranSurahs } from "../data/quranContent.js";
import { getJuzForAyah } from "../data/quranNavigation.js";

const MAX_RESULTS = 80;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .trim();
}

function parseAyahReference(query) {
  const match = query.trim().match(/^(\d{1,3})\s*[:.,-]\s*(\d{1,3})$/);
  if (!match) return null;
  return { surahNumber: Number(match[1]), ayahNumber: Number(match[2]) };
}

function highlightMatch(text, query) {
  const source = String(text || "");
  const needle = query.trim();
  if (!needle) return source;
  const index = source.toLowerCase().indexOf(needle.toLowerCase());
  if (index < 0) return source;

  return (
    <>
      {source.slice(0, index)}
      <mark>{source.slice(index, index + needle.length)}</mark>
      {source.slice(index + needle.length)}
    </>
  );
}

export default function QuranSearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = normalizeText(query);
    if (!normalized) return [];

    const exactRef = parseAyahReference(query);
    if (exactRef) {
      const surah = quranSurahs.find((item) => item.number === exactRef.surahNumber);
      const ayah = surah?.ayahs.find((item) => item.number === exactRef.ayahNumber);
      return surah && ayah ? [{ type: "ayah", surah, ayah, exact: true }] : [];
    }

    const list = [];
    for (const surah of quranSurahs) {
      const surahMatches = [surah.title, surah.arabicTitle, surah.translation, String(surah.number)].some((value) =>
        normalizeText(value).includes(normalized)
      );

      if (surahMatches) list.push({ type: "surah", surah });

      for (const ayah of surah.ayahs) {
        const haystack = [ayah.arabic, ayah.translation, String(ayah.number), `${surah.number}:${ayah.number}`]
          .map(normalizeText)
          .join(" ");
        if (haystack.includes(normalized)) list.push({ type: "ayah", surah, ayah });
        if (list.length >= MAX_RESULTS) return list;
      }
      if (list.length >= MAX_RESULTS) return list;
    }
    return list;
  }, [query]);

  return (
    <section className="content-stack quran-inner-screen quran-search-screen">
      <Header title="Поиск по Корану" subtitle="Ищи по суре, номеру аята или тексту" compact />

      <GlassCard className="quran-search-panel">
        <Search size={20} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Например: 2:255, Фатиха, الحمد, Милостивый" />
      </GlassCard>

      {query.trim() && (
        <p className="quran-search-count">
          Найдено: {results.length}{results.length >= MAX_RESULTS ? "+" : ""}
        </p>
      )}

      <div className="quran-search-results">
        {results.length ? (
          results.map((result) => (
            <GlassCard
              as="button"
              className="quran-search-result"
              key={`${result.type}-${result.surah.id}-${result.ayah?.number || "surah"}`}
              type="button"
              onClick={() =>
                result.type === "surah"
                  ? navigate(`/quran/surah/${result.surah.id}`)
                  : navigate(`/quran/surah/${result.surah.id}?ayah=${result.ayah.number}`)
              }
            >
              <span className="surah-list-card__number">{result.type === "surah" ? result.surah.number : result.ayah.number}</span>
              <span className="quran-search-result__body">
                <strong>
                  {result.type === "surah"
                    ? highlightMatch(result.surah.title, query)
                    : `${result.surah.title}, аят ${result.ayah.number}`}
                </strong>
                {result.type === "ayah" ? (
                  <>
                    <span className="quran-search-result__meta">
                      {result.surah.number}:{result.ayah.number} В· {getJuzForAyah(result.surah.number, result.ayah.number)} джуз
                    </span>
                    <span className="quran-search-arabic" dir="rtl">{highlightMatch(result.ayah.arabic, query)}</span>
                    <span>{highlightMatch(result.ayah.translation, query)}</span>
                  </>
                ) : (
                  <span>{highlightMatch(result.surah.translation, query)}</span>
                )}
              </span>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="quran-warning-card">
            <h2>Начни поиск</h2>
            <p>Можно искать по названию суры, номеру, арабскому тексту или переводу.</p>
          </GlassCard>
        )}
      </div>
    </section>
  );
}
