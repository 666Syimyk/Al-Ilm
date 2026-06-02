import { BookOpen, ChevronDown, ChevronUp, Volume2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import VoiceCheckPanel from "../components/VoiceCheckPanel.jsx";
import { readingTexts, readingCategories, getTextById } from "../data/readingTexts.js";
import { getProgress, setProgress } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speak(text) {
  speakText(text, { lang: "ar-SA", rate: 0.65 });
}

// ─── Экран чтения конкретного текста ─────────────────────────────────────────
function ReadingLesson({ textId, onBack }) {
  const text = getTextById(textId);
  const progress = getProgress();
  const completedIds = progress.completedReadingTexts || [];
  const isDone = completedIds.includes(text.id);

  const [showReading, setShowReading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [done, setDone] = useState(false);
  const [voicePassed, setVoicePassed] = useState(false);

  function markDone() {
    if (!isDone) {
      const updated = [...completedIds, text.id];
      setProgress({ ...progress, completedReadingTexts: updated, points: (progress.points || 0) + 10 });
    }
    setDone(true);
  }

  if (done) {
    return (
      <section className="content-stack">
        <Header title="Прочитано!" subtitle={text.title} compact>
          <button className="duo-exit-button" type="button" onClick={onBack}>
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="reading-done-card">
          <BookOpen size={56} color="var(--green-dark)" aria-hidden="true" />
          <h2>Отличная работа!</h2>
          <p className="reading-done-text" dir="rtl">{text.arabic}</p>
          <p className="reading-done-translation">{text.translation}</p>
          <button className="button button--primary" type="button" onClick={onBack}>
            К текстам
          </button>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <Header title={text.title} subtitle={`Уровень ${text.level}`} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      {/* Арабский текст */}
      <GlassCard className="reading-arabic-card">
        <p className="reading-arabic-text" dir="rtl">{text.arabic}</p>
        <button
          className="button button--soft reading-listen-btn"
          type="button"
          onClick={() => speak(text.arabic)}
        >
          <Volume2 size={18} aria-hidden="true" />
          Послушать
        </button>
      </GlassCard>

      {/* Транслитерация */}
      <VoiceCheckPanel
        targets={[text.arabic, text.reading]}
        prompt="Прочитай текст вслух после прослушивания."
        successText="Отлично! Текст прочитан уверенно."
        onPassed={() => setVoicePassed(true)}
      />

      <GlassCard className="reading-toggle-card">
        <button
          className="reading-toggle-header"
          type="button"
          onClick={() => setShowReading(!showReading)}
        >
          <span>Произношение (транслит.)</span>
          {showReading ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showReading && (
          <p className="reading-transliteration">{text.reading}</p>
        )}
      </GlassCard>

      {/* Перевод */}
      <GlassCard className="reading-toggle-card">
        <button
          className="reading-toggle-header"
          type="button"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          <span>Перевод</span>
          {showTranslation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showTranslation && (
          <p className="reading-translation-text">{text.translation}</p>
        )}
      </GlassCard>

      {/* Заметка */}
      {text.note && (
        <GlassCard className="reading-note-card">
          <p className="section-kicker">Примечание</p>
          <p>{text.note}</p>
        </GlassCard>
      )}

      <div className="reading-lesson-footer">
        {isDone && (
          <div className="grammar-done-badge">
            ✓ Прочитано
          </div>
        )}
        {voicePassed ? <div className="grammar-done-badge">Голос проверен</div> : null}
        <button className="button button--primary" type="button" onClick={markDone}>
          {isDone ? "Прочитать снова" : "Отметить как прочитанное"}
        </button>
      </div>
    </section>
  );
}

// ─── Список текстов ───────────────────────────────────────────────────────────
function ReadingHub({ onSelect }) {
  const progress = getProgress();
  const completedIds = progress.completedReadingTexts || [];
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? readingTexts
    : readingTexts.filter((t) => t.category === activeCategory);

  const levelColors = { 1: "#006F3D", 2: "#FF9600", 3: "#A855F7" };
  const levelLabels = { 1: "Начинающий", 2: "Средний", 3: "Продвинутый" };

  return (
    <section className="content-stack">
      <Header title="Чтение" subtitle="Практикуй арабские тексты" compact />

      <GlassCard className="reading-stats-card">
        <div>
          <p className="section-kicker">Прочитано</p>
          <strong>{completedIds.length}</strong>
        </div>
        <div>
          <p className="section-kicker">Всего текстов</p>
          <strong>{readingTexts.length}</strong>
        </div>
        <div>
          <p className="section-kicker">Уровней</p>
          <strong>3</strong>
        </div>
      </GlassCard>

      {/* Фильтр по категориям */}
      <div className="reading-category-tabs">
        <button
          className={`reading-tab ${activeCategory === "all" ? "is-active" : ""}`}
          type="button"
          onClick={() => setActiveCategory("all")}
        >
          Все
        </button>
        {readingCategories.map((cat) => (
          <button
            key={cat.id}
            className={`reading-tab ${activeCategory === cat.id ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.emoji} {cat.title}
          </button>
        ))}
      </div>

      {/* Тексты */}
      <div className="reading-texts-list">
        {filtered.map((text) => {
          const isDone = completedIds.includes(text.id);
          return (
            <GlassCard key={text.id} className={`reading-text-card ${isDone ? "is-done" : ""}`}>
              <div className="reading-text-card__level" style={{ color: levelColors[text.level] }}>
                {levelLabels[text.level]}
              </div>
              <div className="reading-text-card__info">
                <h3>{text.title}</h3>
                <p className="reading-text-preview" dir="rtl">{text.arabic.slice(0, 40)}…</p>
              </div>
              <div className="reading-text-card__actions">
                {isDone && <span className="reading-done-mark">вњ“</span>}
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => onSelect(text.id)}
                >
                  Читать
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

// ─── Главный экран ────────────────────────────────────────────────────────────
export default function ReadingScreen() {
  const { textId } = useParams();
  const navigate = useNavigate();

  if (textId) {
    return <ReadingLesson textId={textId} onBack={() => navigate("/reading")} />;
  }

  return <ReadingHub onSelect={(id) => navigate(`/reading/${id}`)} />;
}
