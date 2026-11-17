import { CheckCircle2, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { allahNames, allahNamesSource } from "../data/allahNames.js";
import { getStoredJson, setStoredJson } from "../utils/storage.js";

function normalize(value) {
  return String(value || "").toLocaleLowerCase("ru").trim();
}

const LEARNED_NAMES_KEY = "allahNamesLearned";

function getLearnedNames() {
  return getStoredJson(LEARNED_NAMES_KEY, []);
}

function saveLearnedNames(value) {
  setStoredJson(LEARNED_NAMES_KEY, value);
}

export default function AllahNamesScreen() {
  const [query, setQuery] = useState("");
  const [learnedNames, setLearnedNames] = useState(getLearnedNames);
  const learnedSet = useMemo(() => new Set(learnedNames), [learnedNames]);

  const filteredNames = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return allahNames;

    return allahNames.filter((name) => {
      const haystack = [
        name.number,
        name.arabic,
        name.transliteration,
        name.meaning
      ].join(" ");

      return normalize(haystack).includes(needle);
    });
  }, [query]);

  function toggleLearned(number) {
    setLearnedNames((current) => {
      const next = current.includes(number)
        ? current.filter((item) => item !== number)
        : [...current, number].sort((a, b) => a - b);
      saveLearnedNames(next);
      return next;
    });
  }

  const learnedCount = learnedNames.length;

  return (
    <section className="content-stack quran-inner-screen allah-names-screen">
      <Header
        title="99 имён Аллаха"
        subtitle="Красивые имена Аллаха с простыми значениями для чтения, повторения и понимания"
        compact
      />

      <GlassCard className="allah-names-hero">
        <div className="allah-names-hero__icon" aria-hidden="true">
          <Sparkles size={34} />
        </div>
        <div>
          <p className="section-kicker">Асмауль-Хусна</p>
          <h2>Учись узнавать имена Аллаха постепенно</h2>
          <p>
            Каждая карточка показывает арабское написание, русскую передачу и короткое значение простыми словами.
          </p>
        </div>
        <strong className="allah-names-hero__count">{learnedCount}/99</strong>
      </GlassCard>

      <GlassCard className="islamic-note-card">
        <p>Краткие значения помогают познакомиться с именами Аллаха. Они ещё проверяются — уточняй их с учителем.</p>
        <a href={allahNamesSource.sourceUrl} target="_blank" rel="noopener noreferrer">Коран 7:180 — об именах Аллаха</a>
      </GlassCard>

      <GlassCard className="quran-search-panel allah-names-search">
        <Search size={20} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найди имя: Ар-Рахман, Милостивый, 1..."
          aria-label="Поиск имени Аллаха"
        />
        <span className="quran-search-count">{filteredNames.length} из 99</span>
      </GlassCard>

      {filteredNames.length ? (
        <div className="allah-names-grid" aria-label="Список 99 имён Аллаха">
          {filteredNames.map((name) => (
            <GlassCard as="article" className={`allah-name-card${learnedSet.has(name.number) ? " is-learned" : ""}`} key={name.number}>
              <div className="allah-name-card__top">
                <span className="allah-name-card__number">{name.number}</span>
                <strong className="allah-name-card__arabic" dir="rtl">{name.arabic}</strong>
              </div>
              <div className="allah-name-card__body">
                <h2>{name.transliteration}</h2>
                <p>{name.meaning}</p>
              </div>
              <button className="allah-name-card__learned" type="button" onClick={() => toggleLearned(name.number)}>
                <CheckCircle2 size={17} aria-hidden="true" />
                {learnedSet.has(name.number) ? "Выучено" : "Отметить выученным"}
              </button>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="quran-warning-card allah-names-empty">
          <h2>Ничего не найдено</h2>
          <p>Попробуй другое имя, значение или номер карточки.</p>
        </GlassCard>
      )}
    </section>
  );
}
