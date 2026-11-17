import { ArrowRight, BookOpenCheck } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { quranSurahs } from "../data/quranContent.js";
import { getJuzRanges } from "../data/quranNavigation.js";
import { getSurahDisplayMeta } from "../data/surahDisplayMeta.js";
import { getQuranTracking } from "../utils/storage.js";
import { countAyahs } from "../utils/plural.js";

function ayahRef(surahId, ayahNumber) {
  return `${surahId}:${ayahNumber}`;
}

function countReadAyahsInJuz(range, readAyahs) {
  const readSet = new Set(readAyahs);
  return quranSurahs.reduce((count, surah) => {
    if (surah.number < range.start.surah || surah.number > range.end.surah) return count;
    const from = surah.number === range.start.surah ? range.start.ayah : 1;
    const to = surah.number === range.end.surah ? range.end.ayah : surah.ayahs.length;
    let next = count;
    for (let ayah = from; ayah <= to; ayah += 1) {
      if (readSet.has(ayahRef(surah.id, ayah))) next += 1;
    }
    return next;
  }, 0);
}

function padSurahNumber(number) {
  return String(number).padStart(3, "0");
}

function getSurahsInJuz(range) {
  return quranSurahs
    .filter((surah) => surah.number >= range.start.surah && surah.number <= range.end.surah)
    .sort((a, b) => a.number - b.number)
    .map((surah) => {
      const meta = getSurahDisplayMeta(surah.number);
      return {
        ...surah,
        latinTitle: meta?.latinTitle || surah.title,
        displayTranslation: meta?.translation || surah.translation,
        juzStartAyah: surah.number === range.start.surah ? range.start.ayah : 1,
        juzEndAyah: surah.number === range.end.surah ? range.end.ayah : surah.ayahs.length
      };
    });
}

export default function JuzScreen() {
  const navigate = useNavigate();
  const tracking = getQuranTracking();
  const ranges = useMemo(() => getJuzRanges(quranSurahs), []);

  return (
    <section className="content-stack quran-inner-screen juz-screen">
      <Header title="Джузы" subtitle="30 частей Корана: каждая сура внутри джуза на месте" compact />

      <div className="juz-list-grid">
        {ranges.map((range) => {
          const readCount = countReadAyahsInJuz(range, tracking.readAyahs);
          const progress = range.ayahCount ? Math.round((readCount / range.ayahCount) * 100) : 0;
          const surahs = getSurahsInJuz(range);

          return (
            <GlassCard className="juz-card" key={range.juz}>
              <div className="juz-card__header">
                <div className="juz-card__number">
                  <BookOpenCheck size={20} aria-hidden="true" />
                  <strong>{range.juz}</strong>
                </div>

                <div className="juz-card__body">
                  <h2>Джуз {range.juz}</h2>
                  <p>
                    {range.startSurah.title} {range.start.ayah} — {range.endSurah.title} {range.end.ayah}
                  </p>
                  <div className="progress-bar" aria-label={`Джуз ${range.juz}: ${progress}% прочитано`}>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <small>{readCount}/{range.ayahCount} аятов прочитано</small>
                </div>

                <button
                  className="button button--primary juz-read-button"
                  type="button"
                  onClick={() => navigate(`/quran/surah/${range.startSurah.id}?ayah=${range.start.ayah}`)}
                >
                  Читать джуз
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="juz-surah-list">
                {surahs.map((surah) => (
                  <button
                    className="juz-surah-row"
                    key={`${range.juz}-${surah.id}`}
                    type="button"
                    onClick={() => navigate(`/quran/surah/${surah.id}?ayah=${surah.juzStartAyah}`)}
                  >
                    <span className="juz-surah-row__num">{surah.number}</span>
                    <span className="juz-surah-row__copy">
                      <strong>{surah.title}</strong>
                      <small>{surah.displayTranslation}</small>
                    </span>
                    <span className="juz-surah-row__meta">
                      <strong>{padSurahNumber(surah.number)}</strong>
                      <small>{countAyahs(surah.ayahs.length)}</small>
                    </span>
                  </button>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
