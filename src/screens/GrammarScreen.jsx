import { ArrowRight, CheckCircle2, Volume2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import MixedText from "../components/MixedText.jsx";
import Header from "../components/Header.jsx";
import { grammarLessons, grammarLevels, getGrammarLessonById } from "../data/grammarData.js";
import { getProgress, recordStudyDay, setProgress } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speak(text) {
  speakText(text, { lang: "ar-SA", rate: 0.75 });
}

// ─── Урок грамматики ─────────────────────────────────────────────────────────
function GrammarLesson({ lessonId, onBack }) {
  const lesson = getGrammarLessonById(lessonId);
  const progress = getProgress();
  const completedIds = progress.completedGrammar || [];
  const isDone = completedIds.includes(lesson.id);
  const [showPractice, setShowPractice] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  function markDone() {
    if (!isDone) {
      const updated = [...completedIds, lesson.id];
      setProgress({ ...progress, completedGrammar: updated, points: (progress.points || 0) + 15 });
      recordStudyDay();
    }
    setShowPractice(false);
    setFinished(true);
  }

  function nextPractice() {
    if (practiceIdx + 1 >= lesson.practice.length) {
      markDone();
    } else {
      setPracticeIdx(practiceIdx + 1);
      setRevealed(false);
    }
  }

  if (finished) {
    return (
      <section className="content-stack">
        <Header title="Готово!" subtitle={lesson.title} compact>
          <button className="duo-exit-button" type="button" onClick={onBack}>
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="grammar-done-card">
          <CheckCircle2 size={64} color="var(--green-dark)" aria-hidden="true" />
          <h2>Урок завершён!</h2>
          <p>{lesson.title}</p>
          <p className="grammar-done-rule">«<MixedText text={lesson.rule} />»</p>
          <button className="button button--primary" type="button" onClick={onBack}>
            К урокам
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </GlassCard>
      </section>
    );
  }

  if (showPractice) {
    const item = lesson.practice[practiceIdx];
    return (
      <section className="content-stack">
        <Header title="Практика" subtitle={`${practiceIdx + 1} / ${lesson.practice.length}`} compact>
          <button className="duo-exit-button" type="button" onClick={() => setShowPractice(false)}>
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="grammar-practice-card">
          <p className="section-kicker">Переведи предложение</p>
          <p className="grammar-practice-arabic" dir="rtl">{item.arabic}</p>
          <button
            className="icon-button"
            type="button"
            onClick={() => speak(item.arabic)}
            aria-label="Послушать"
          >
            <Volume2 size={20} aria-hidden="true" />
          </button>
          {revealed ? (
            <div className="grammar-practice-answer">
              <p className="section-kicker">Перевод:</p>
              <p>{item.translation}</p>
              <button className="button button--primary" type="button" onClick={nextPractice}>
                {practiceIdx + 1 >= lesson.practice.length ? "Завершить урок" : "Далее"}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button className="button button--soft" type="button" onClick={() => setRevealed(true)}>
              Показать перевод
            </button>
          )}
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <Header title={lesson.title} subtitle={lesson.arabicTitle} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      {/* Объяснение */}
      <GlassCard className="grammar-rule-card">
        <p className="section-kicker">{lesson.subtitle}</p>
        <p>{lesson.description}</p>
        <div className="grammar-rule-box">
          <strong>Правило:</strong> <MixedText text={lesson.rule} />
        </div>
      </GlassCard>

      {/* Примеры */}
      <GlassCard>
        <h2 className="section-title">Примеры</h2>
        <div className="grammar-examples-list">
          {lesson.examples.map((ex) => (
            <div className="grammar-example-row" key={ex.arabic}>
              <button
                className="icon-button grammar-example-audio"
                type="button"
                onClick={() => speak(ex.arabic)}
                aria-label="Послушать"
              >
                <Volume2 size={16} aria-hidden="true" />
              </button>
              <div className="grammar-example-content">
                <span className="arabic-text grammar-example-arabic" dir="rtl">{ex.arabic}</span>
                <span className="grammar-example-reading">{ex.reading}</span>
                <span className="grammar-example-translation">{ex.translation}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Кнопки */}
      <div className="grammar-lesson-footer">
        {isDone ? (
          <div className="grammar-done-badge">
            <CheckCircle2 size={20} aria-hidden="true" />
            Урок пройден
          </div>
        ) : null}
        <button
          className="button button--primary"
          type="button"
          onClick={() => { setPracticeIdx(0); setRevealed(false); setShowPractice(true); }}
        >
          Перейти к практике
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

// ─── Список уроков ───────────────────────────────────────────────────────────
function GrammarHub({ onSelect }) {
  const progress = getProgress();
  const completedIds = progress.completedGrammar || [];

  return (
    <section className="content-stack">
      <Header title="Грамматика" subtitle="Как устроен арабский язык" compact />

      <GlassCard className="grammar-intro-card">
        <p>Арабская грамматика логична. Начни с простых именных предложений, потом переходи к глаголам и вопросам.</p>
        <p>Пройдено уроков: <strong>{completedIds.length}</strong> / {grammarLessons.length}</p>
      </GlassCard>

      {grammarLevels.map((lvl) => {
        const levelLessons = grammarLessons.filter((l) => l.level === lvl.level);
        const level1Done = lvl.level === 2
          ? grammarLessons.filter((l) => l.level === 1).every((l) => completedIds.includes(l.id))
          : lvl.level === 3
          ? grammarLessons.filter((l) => l.level === 2).every((l) => completedIds.includes(l.id))
          : true;
        const levelLocked = !level1Done;
        return (
          <div key={lvl.level} className="grammar-level-section">
            <div className="grammar-level-header" style={{ borderColor: lvl.color }}>
              <span className="section-kicker" style={{ color: lvl.color }}>Уровень {lvl.level}</span>
              <h2>{lvl.title}</h2>
              <p>{lvl.subtitle}</p>
            </div>
            <div className="grammar-lessons-list">
              {levelLessons.map((lesson, i) => {
                const isDone = completedIds.includes(lesson.id);
                const prevDone = i === 0 || completedIds.includes(levelLessons[i - 1]?.id);
                const isLocked = levelLocked || (lvl.level > 1 && !prevDone);
                return (
                  <GlassCard
                    key={lesson.id}
                    className={`grammar-lesson-card ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}
                  >
                    <div className={`grammar-lesson-card__index ${isDone ? "is-done" : ""}`}>
                      {isDone ? <CheckCircle2 size={18} /> : i + 1}
                    </div>
                    <div className="grammar-lesson-card__info">
                      <h3>{lesson.title}</h3>
                      <p>{lesson.subtitle}</p>
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => !isLocked && onSelect(lesson.id)}
                      disabled={isLocked}
                      aria-label={`Открыть урок ${lesson.title}`}
                    >
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ─── Главный экран ───────────────────────────────────────────────────────────
export default function GrammarScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  if (lessonId) {
    return <GrammarLesson lessonId={lessonId} onBack={() => navigate("/grammar")} />;
  }

  return <GrammarHub onSelect={(id) => navigate(`/grammar/${id}`)} />;
}
