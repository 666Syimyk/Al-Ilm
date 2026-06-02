import { BookOpenCheck, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { prophetStories } from "../data/prophetsData.js";

function normalize(value) {
  return value.toLocaleLowerCase("ru").trim();
}

export default function ProphetsScreen() {
  const [query, setQuery] = useState("");
  const [activeProphetId, setActiveProphetId] = useState(prophetStories[0]?.id ?? "");

  const filteredProphets = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return prophetStories;

    return prophetStories.filter((prophet) => {
      const haystack = [
        prophet.name,
        prophet.arabicName,
        prophet.subtitle,
        prophet.period,
        prophet.story,
        prophet.lesson,
        prophet.quranRefs.join(" ")
      ].join(" ");

      return normalize(haystack).includes(needle);
    });
  }, [query]);

  const activeProphet =
    filteredProphets.find((prophet) => prophet.id === activeProphetId) ||
    filteredProphets[0] ||
    null;

  return (
    <section className="content-stack quran-inner-screen prophets-screen">
      <Header title="Пророки" subtitle="25 пророков, упомянутых в Коране: имена, истории и уроки" compact />

      <GlassCard className="prophets-hero">
        <div className="prophets-hero__icon" aria-hidden="true">
          <UserRound size={34} />
        </div>
        <div>
          <p className="section-kicker">Истории пророков</p>
          <h2>От Адама до Мухаммада ﷺ</h2>
          <p>
            Здесь собраны краткие истории всех 25 пророков, их имена на русском и арабском,
            главный урок и места в Коране, где можно продолжить чтение.
          </p>
        </div>
        <strong className="prophets-hero__count">25</strong>
      </GlassCard>

      <GlassCard className="quran-search-panel prophets-search">
        <Search size={20} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найди пророка: Юсуф, Муса, Иса..."
          aria-label="Поиск пророка"
        />
        <span className="quran-search-count">{filteredProphets.length} из 25</span>
      </GlassCard>

      <div className="prophets-layout">
        <div className="prophets-list" aria-label="Список пророков">
          {filteredProphets.map((prophet) => (
            <GlassCard
              as="button"
              className={`prophet-list-card${activeProphet?.id === prophet.id ? " is-active" : ""}`}
              key={prophet.id}
              type="button"
              onClick={() => setActiveProphetId(prophet.id)}
              aria-pressed={activeProphet?.id === prophet.id}
            >
              <span className="prophet-list-card__number">{prophet.number}</span>
              <span className="prophet-list-card__body">
                <strong>{prophet.name}</strong>
                <small>{prophet.subtitle}</small>
              </span>
              <span className="prophet-list-card__arabic" dir="rtl">{prophet.arabicName}</span>
            </GlassCard>
          ))}
        </div>

        {activeProphet ? (
          <GlassCard className="prophet-detail-card">
            <div className="prophet-detail-card__top">
              <div>
                <p className="section-kicker">Пророк {activeProphet.number} из 25</p>
                <h2>{activeProphet.name}</h2>
                <span>{activeProphet.honorific}</span>
              </div>
              <strong dir="rtl">{activeProphet.arabicName}</strong>
            </div>

            <div className="prophet-detail-card__meta">
              <span><UserRound size={16} aria-hidden="true" /> {activeProphet.subtitle}</span>
              <span><BookOpenCheck size={16} aria-hidden="true" /> {activeProphet.period}</span>
            </div>

            <div className="prophet-story-block">
              <h3>История</h3>
              <p>{activeProphet.story}</p>
            </div>

            <div className="prophet-lesson-block">
              <h3>Главный урок</h3>
              <p>{activeProphet.lesson}</p>
            </div>

            <div className="prophet-quran-refs" aria-label={`Аяты о пророке ${activeProphet.name}`}>
              {activeProphet.quranRefs.map((ref) => (
                <span key={ref}>{ref}</span>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="quran-warning-card">
            <h2>Ничего не найдено</h2>
            <p>Попробуй ввести другое имя или часть истории.</p>
          </GlassCard>
        )}
      </div>
    </section>
  );
}
