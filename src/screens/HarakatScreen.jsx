import { ArrowRight, CheckCircle2, Volume2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { harakatList, getHarakatById } from "../data/harakatData.js";
import { getProgress } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speak(text, lang = "ar") {
  speakText(text, { lang, rate: 0.75 });
}

function HarakatLesson({ harakat, onBack }) {
  const [playingIdx, setPlayingIdx] = useState(null);

  function playWord(word, idx) {
    setPlayingIdx(idx);
    speak(word.arabic);
    setTimeout(() => setPlayingIdx(null), 2000);
  }

  function playExample(ex) {
    speak(ex.arabic);
  }

  return (
    <section className="content-stack">
      <Header title={harakat.name} subtitle={harakat.arabicName} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      {/* Символ и звук */}
      <GlassCard className="harakat-hero-card">
        <div className="harakat-symbol-block">
          <span className="harakat-big-symbol" style={{ color: harakat.color }}>{harakat.symbolOnBa}</span>
          <div>
            <p className="section-kicker">Звук: «{harakat.sound}»</p>
            <p>{harakat.description}</p>
          </div>
        </div>
        <div className="harakat-rule-box">
          <strong>Правило:</strong> {harakat.rule}
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => speak(harakat.symbolOnBa)}
        >
          <Volume2 size={18} aria-hidden="true" />
          Послушать звук
        </button>
      </GlassCard>

      {/* Примеры букв */}
      <GlassCard>
        <h2 className="section-title">Буквы с {harakat.name.toLowerCase()}</h2>
        <div className="harakat-examples-grid">
          {harakat.examples.map((ex) => (
            <button
              key={ex.arabic}
              className="harakat-example-tile"
              type="button"
              onClick={() => playExample(ex)}
              aria-label={`Послушать ${ex.reading}`}
            >
              <span className="arabic-text" dir="rtl">{ex.arabic}</span>
              <span>{ex.reading}</span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Слова */}
      <GlassCard>
        <h2 className="section-title">Слова с {harakat.name.toLowerCase()}</h2>
        <div className="harakat-words-list">
          {harakat.words.map((word, idx) => (
            <div className="harakat-word-row" key={word.arabic}>
              <span className="arabic-text harakat-word-arabic" dir="rtl">{word.arabic}</span>
              <span className="harakat-word-reading">{word.reading}</span>
              <span className="harakat-word-translation">{word.translation}</span>
              <button
                className="icon-button"
                type="button"
                onClick={() => playWord(word, idx)}
                disabled={playingIdx === idx}
                aria-label="Послушать слово"
              >
                <Volume2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}

function HarakatHub() {
  const navigate = useNavigate();
  const progress = getProgress();
  const completedIds = progress.completedHarakat || [];

  return (
    <section className="content-stack">
      <Header title="Огласовки" subtitle="Харакат — ключ к чтению арабского" compact />

      <GlassCard className="harakat-intro-card">
        <p className="section-kicker">Зачем учить огласовки?</p>
        <p>Огласовки — это маленькие знаки над и под буквами. Они показывают, как читать слово. Без них невозможно читать арабский текст правильно.</p>
        <div className="harakat-intro-symbols">
          {harakatList.slice(0, 3).map((h) => (
            <span key={h.id} className="harakat-intro-symbol" style={{ color: h.color }}>
              {h.symbolOnBa}
            </span>
          ))}
        </div>
      </GlassCard>

      <div className="harakat-list">
        {harakatList.map((harakat, idx) => {
          const isDone = completedIds.includes(harakat.id);
          const isLocked = harakat.level > 1 && idx > 0 && !completedIds.includes(harakatList[idx - 1]?.id);
          return (
            <GlassCard
              key={harakat.id}
              className={`harakat-card ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}
            >
              <div className="harakat-card__symbol" style={{ color: harakat.color }}>
                {harakat.symbolOnBa}
              </div>
              <div className="harakat-card__info">
                <span className="section-kicker">Уровень {harakat.level}</span>
                <h3>{harakat.name}</h3>
                <p>Звук: «{harakat.sound}»</p>
                <p className="harakat-card__desc">{harakat.description.substring(0, 60)}...</p>
              </div>
              {isDone ? (
                <CheckCircle2 size={28} color="var(--green-dark)" aria-hidden="true" />
              ) : (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => navigate(`/harakat/${harakat.id}`)}
                  disabled={isLocked}
                >
                  Изучить
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

export default function HarakatScreen() {
  const { harakatId } = useParams();
  const navigate = useNavigate();

  if (harakatId) {
    const harakat = getHarakatById(harakatId);
    return <HarakatLesson harakat={harakat} onBack={() => navigate("/harakat")} />;
  }

  return <HarakatHub />;
}
