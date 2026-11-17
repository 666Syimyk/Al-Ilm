import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Volume2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { vocabularyThemes, getWordsByTheme, getThemeById } from "../data/vocabularyData.js";
import { getProgress, recordStudyDay, setProgress } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speak(text) {
  speakText(text, { lang: "ar-SA", rate: 0.75 });
}

// ─── Флэш-карточки ───────────────────────────────────────────────────────────
function FlashcardMode({ themeId, onBack }) {
  const theme = getThemeById(themeId);
  const words = getWordsByTheme(themeId);
  const progress = getProgress();
  const learnedIds = progress.learnedVocabulary || [];

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learned, setLearned] = useState(new Set(learnedIds));
  const [done, setDone] = useState(false);

  const word = words[idx];
  if (!word) return null;

  const learnedCount = words.filter((w) => learned.has(w.id)).length;

  function markLearned() {
    const next = new Set(learned);
    next.add(word.id);
    setLearned(next);
    const allLearnedIds = Array.from(next);
    setProgress({ ...progress, learnedVocabulary: allLearnedIds });
    recordStudyDay();
    goNext();
  }

  function markReview() {
    goNext();
  }

  function goNext() {
    setFlipped(false);
    if (idx + 1 >= words.length) {
      setDone(true);
    } else {
      setIdx(idx + 1);
    }
  }

  function restart() {
    setIdx(0);
    setFlipped(false);
    setDone(false);
  }

  if (done) {
    return (
      <section className="content-stack">
        <Header title={theme.title} subtitle="Результат" compact>
          <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад">
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="vocab-done-card">
          <CheckCircle2 size={64} color="var(--green-dark)" aria-hidden="true" />
          <h2>Тема пройдена!</h2>
          <p>Выучено: {learnedCount} из {words.length} слов</p>
          <div className="vocab-done-actions">
            <button className="button button--soft" type="button" onClick={restart}>
              <RefreshCw size={18} aria-hidden="true" />
              Повторить
            </button>
            <button className="button button--primary" type="button" onClick={onBack}>
              К темам
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <Header title={theme.title} subtitle={`${idx + 1} / ${words.length}`} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      <div className="vocab-progress-bar" aria-label={`Прогресс ${Math.round(learnedCount / words.length * 100)}%`}>
        <div className="vocab-progress-fill" style={{ width: `${(learnedCount / words.length) * 100}%` }} />
      </div>

      <div
        className={`flashcard ${flipped ? "is-flipped" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => setFlipped(!flipped)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((value) => !value);
          }
        }}
        aria-label="Перевернуть карточку"
      >
        <div className="flashcard__front">
          <p className="flashcard__hint">Нажми, чтобы увидеть перевод</p>
          <span className="flashcard__arabic" dir="rtl">{word.arabic}</span>
          <span className="flashcard__reading">{word.reading}</span>
          <button
            className="icon-button flashcard__audio"
            type="button"
            onClick={(e) => { e.stopPropagation(); speak(word.arabic); }}
            aria-label="Послушать слово"
          >
            <Volume2 size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="flashcard__back">
          <p className="flashcard__hint">Перевод</p>
          <span className="flashcard__translation">{word.translation}</span>
          <span className="flashcard__arabic-small" dir="rtl">{word.arabic}</span>
          <span className="flashcard__reading">{word.reading}</span>
        </div>
      </div>

      {flipped ? (
        <div className="flashcard-actions">
          <button className="button button--soft flashcard-btn-review" type="button" onClick={markReview}>
            Повторить ещё
          </button>
          <button className="button button--primary flashcard-btn-learned" type="button" onClick={markLearned}>
            <CheckCircle2 size={18} aria-hidden="true" />
            Знаю!
          </button>
        </div>
      ) : (
        <p className="flashcard-tip">Вспомни перевод, потом переверни</p>
      )}

      <div className="flashcard-nav">
        <button
          className="icon-button"
          type="button"
          onClick={() => { setIdx(Math.max(0, idx - 1)); setFlipped(false); }}
          disabled={idx === 0}
          aria-label="Предыдущее слово"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <span>{learned.has(word.id) ? "✓ Выучено" : ""}</span>
        <button
          className="icon-button"
          type="button"
          onClick={goNext}
          aria-label="Следующее слово"
        >
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

// ─── Список тем ──────────────────────────────────────────────────────────────
function ThemeHub({ onSelectTheme }) {
  const progress = getProgress();
  const learnedIds = new Set(progress.learnedVocabulary || []);

  return (
    <section className="content-stack">
      <Header title="Словарный запас" subtitle="Учи слова по темам — по 10–15 минут в день" compact />

      <GlassCard className="vocab-stats-card">
        <div>
          <p className="section-kicker">Выучено слов</p>
          <strong>{learnedIds.size}</strong>
        </div>
        <div>
          <p className="section-kicker">Всего слов</p>
          <strong>130</strong>
        </div>
        <div>
          <p className="section-kicker">Тем</p>
          <strong>{vocabularyThemes.length}</strong>
        </div>
      </GlassCard>

      <div className="vocab-theme-grid">
        {vocabularyThemes.map((theme) => {
          const themeWords = getWordsByTheme(theme.id);
          const doneCount = themeWords.filter((w) => learnedIds.has(w.id)).length;
          const pct = Math.round((doneCount / themeWords.length) * 100);
          return (
            <button
              className="vocab-theme-card"
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
            >
              <span className="vocab-theme-emoji">{theme.emoji}</span>
              <span className="vocab-theme-title">{theme.title}</span>
              <span className="vocab-theme-count">{doneCount}/{themeWords.length}</span>
              <div className="vocab-theme-bar">
                <div className="vocab-theme-bar__fill" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Главный экран ───────────────────────────────────────────────────────────
export default function VocabularyScreen() {
  const { themeId } = useParams();
  const navigate = useNavigate();

  if (themeId) {
    return <FlashcardMode themeId={themeId} onBack={() => navigate("/vocabulary")} />;
  }

  return <ThemeHub onSelectTheme={(id) => navigate(`/vocabulary/${id}`)} />;
}
