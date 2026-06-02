import { useState } from "react";
import { BookOpenCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import TajweedRuleCard from "../components/TajweedRuleCard.js";
import { getTajweedGroups, tajweedLessons } from "../data/tajweedRules.js";
import { completeTajweedRule, getQuranState } from "../utils/storage.js";

function formatLessonCount(count) {
  if (count % 10 === 1 && count % 100 !== 11) return `${count} урок`;
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} урока`;
  return `${count} уроков`;
}

const tajweedGroups = getTajweedGroups();

export default function TajweedScreen() {
  const navigate = useNavigate();
  const [tajweedProgress, setTajweedProgress] = useState(() => getQuranState().tajweedProgress);

  function handleMarkDone(ruleId) {
    const updated = completeTajweedRule(ruleId);
    setTajweedProgress(updated);
  }

  return (
    <section className="content-stack quran-inner-screen tajweed-screen">
      <Header title="Таджвид" subtitle="Учись читать Коран правильно" compact>
        <button className="button button--soft" type="button" onClick={() => navigate("/quran/reading")}>
          <BookOpenCheck size={17} aria-hidden="true" />
          Путь чтения
        </button>
      </Header>

      <GlassCard className="tajweed-learning-summary">
        <div>
          <p className="section-kicker">Прогресс</p>
          <h2>{tajweedProgress.length}/{tajweedLessons.length} уроков</h2>
          <p>Слушай пример, повторяй, проходи мини-тест и отмечай выученное.</p>
        </div>
        <div className="islamic-progress-line">
          <span>{Math.round((tajweedProgress.length / tajweedLessons.length) * 100)}%</span>
          <div><i style={{ width: `${Math.round((tajweedProgress.length / tajweedLessons.length) * 100)}%` }} /></div>
        </div>
      </GlassCard>

      {[...tajweedGroups.entries()].map(([category, rules]) => (
        <section className="tajweed-section" key={category}>
          <div className="tajweed-section-head">
            <h2>{category}</h2>
            <span>{formatLessonCount(rules.length)}</span>
          </div>

          <div className="tajweed-grid">
            {rules.map((rule) => (
              <TajweedRuleCard
                key={rule.id}
                lesson={rule}
                learned={tajweedProgress.includes(rule.id)}
                onOpen={() => navigate(`/quran/tajweed/${rule.id}`)}
                onLearned={() => handleMarkDone(rule.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
