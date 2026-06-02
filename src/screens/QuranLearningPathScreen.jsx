import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { getSurahById } from "../data/quranContent.js";
import { getQuranState } from "../utils/storage.js";

const PATH_GROUPS = [
  {
    id: "beginner",
    title: "Начинающий",
    subtitle: "Короткие суры из Джуз Амма — с них начинают все",
    color: "#006F3D",
    surahs: ["al-fatihah", "al-ikhlas", "al-falaq", "an-nas", "al-kawthar", "al-asr", "al-fil", "al-masad"]
  },
  {
    id: "intermediate",
    title: "Средний",
    subtitle: "Популярные суры, которые читают в молитве",
    color: "#1565C0",
    surahs: ["ya-sin", "al-mulk", "ar-rahman", "al-waqia", "al-kahf"]
  },
  {
    id: "advanced",
    title: "Продвинутый",
    subtitle: "Длинные суры — для тех, кто уже уверенно читает",
    color: "#7B1FA2",
    surahs: ["al-baqara", "ali-imran", "an-nisa"]
  }
];

export default function QuranLearningPathScreen() {
  const navigate = useNavigate();
  const quranState = getQuranState();
  const memorized = quranState.memorizedSurahs;

  return (
    <section className="content-stack quran-inner-screen quran-path-screen">
      <Header title="Путь чтения" subtitle="Начни с коротких сур и двигайся вперёд" compact />

      {PATH_GROUPS.map((group) => {
        const surahs = group.surahs.map((id) => getSurahById(id)).filter(Boolean);
        const doneCount = surahs.filter((s) => memorized.includes(s.id)).length;

        return (
          <GlassCard className="quran-path-group" key={group.id}>
            <div className="quran-path-group__header">
              <div className="quran-path-group__badge" style={{ "--group-color": group.color }} />
              <div>
                <h2>{group.title}</h2>
                <p className="section-kicker">{group.subtitle}</p>
              </div>
              <span className="progress-pill">{doneCount}/{surahs.length}</span>
            </div>

            <div className="quran-path-surah-list">
              {surahs.map((surah) => {
                const isDone = memorized.includes(surah.id);
                const hasContent = surah.ayahs?.length > 0;
                return (
                  <button
                    className={`quran-path-surah-row${isDone ? " is-done" : ""}${!hasContent ? " is-locked" : ""}`}
                    key={surah.id}
                    type="button"
                    onClick={() => navigate(`/quran/surah/${surah.id}`)}
                  >
                    <span className="quran-path-surah-row__arabic">{surah.arabicTitle}</span>
                    <span className="quran-path-surah-row__info">
                      <strong>{surah.title}</strong>
                      <small>{hasContent ? `${surah.ayahs.length} аятов` : "Скоро"}</small>
                    </span>
                    {isDone
                      ? <CheckCircle2 size={18} className="quran-path-surah-row__check" aria-hidden="true" />
                      : <ArrowRight size={16} aria-hidden="true" />
                    }
                  </button>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </section>
  );
}
