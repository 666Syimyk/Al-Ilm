import { ArrowRight, CheckCircle2, Lock, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import VoiceCheckPanel from "../components/VoiceCheckPanel.jsx";
import { getNextSyllableLessonId, getSyllableLessonById, syllableLessons } from "../data/readingPath.js";
import { canOpenLessonNode, lessonPathNodes, withLessonPathStatus } from "../data/lessonPath.js";
import { completeLessonNode, getLessonPathState } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speakArabic(text) {
  speakText(text, { lang: "ar-SA", rate: 0.65 });
}

function getChoices(items, activeIndex) {
  const current = items[activeIndex];
  const others = items.filter((item) => item.reading !== current.reading);
  const first = others[activeIndex % Math.max(others.length, 1)]?.reading;
  const second = others[(activeIndex + 2) % Math.max(others.length, 1)]?.reading;
  const ordered = activeIndex % 2 === 0
    ? [first, current.reading, second]
    : [current.reading, second, first];
  return [...new Set(ordered.filter(Boolean))].slice(0, 3);
}

function SyllablesHub({ onSelect, onBack }) {
  const nodes = withLessonPathStatus(lessonPathNodes, getLessonPathState());
  const statusByNodeId = new Map(nodes.map((node) => [node.id, node.status]));
  const completedCount = syllableLessons.filter((lesson) => statusByNodeId.get(lesson.nodeId) === "completed").length;

  return (
    <section className="content-stack reading-path-screen">
      <Header title="Слоги" subtitle="После букв учимся соединять звуки" compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад к урокам">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      <GlassCard className="reading-path-intro">
        <p className="section-kicker">Путь чтения</p>
        <h2>Буква становится слогом</h2>
        <p>Проходи уроки по порядку: короткие огласовки, сукун, шадда и длинные звуки. Так ребенок не прыгает сразу к словам, а понимает каждый следующий шаг.</p>
        <div className="reading-path-progress">
          <span style={{ "--reading-path-progress": `${Math.round((completedCount / syllableLessons.length) * 100)}%` }} />
        </div>
        <strong>{completedCount} / {syllableLessons.length} уроков пройдено</strong>
      </GlassCard>

      <div className="reading-path-list">
        {syllableLessons.map((lesson) => {
          const status = statusByNodeId.get(lesson.nodeId) || "locked";
          const isDone = status === "completed";
          const isLocked = status === "locked";

          return (
            <GlassCard key={lesson.id} className={`reading-path-card ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}>
              <div className="reading-path-card__index">
                {isDone ? <CheckCircle2 size={18} aria-hidden="true" /> : isLocked ? <Lock size={18} aria-hidden="true" /> : lesson.order}
              </div>
              <div className="reading-path-card__body">
                <span className="section-kicker">{lesson.focus}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.subtitle}</p>
              </div>
              <button className="icon-button" type="button" onClick={() => onSelect(lesson.id)} disabled={isLocked} aria-label={`Открыть ${lesson.title}`}>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

function SyllableLesson({ lessonId, onBack }) {
  const navigate = useNavigate();
  const lesson = getSyllableLessonById(lessonId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [finished, setFinished] = useState(false);
  const item = lesson.items[activeIndex];
  const choices = useMemo(() => getChoices(lesson.items, activeIndex), [lesson.items, activeIndex]);
  const isCorrect = selected === item.reading;

  useEffect(() => {
    if (!canOpenLessonNode(lesson.nodeId, getLessonPathState())) {
      navigate("/lessons/syllables", { replace: true });
    }
  }, [lesson.nodeId, navigate]);

  function goNext() {
    if (!isCorrect) return;
    if (activeIndex + 1 >= lesson.items.length) {
      const result = completeLessonNode(lesson.nodeId);
      if (result.blocked) return;
      setFinished(true);
      return;
    }
    setActiveIndex((current) => current + 1);
    setSelected("");
  }

  function openNext() {
    const nextId = getNextSyllableLessonId(lesson.id);
    if (nextId) {
      navigate(`/lessons/syllables/${nextId}`);
      return;
    }
    navigate("/lessons/words/first-words");
  }

  if (finished) {
    return (
      <section className="content-stack reading-path-screen">
        <Header title="Слог пройден" subtitle={lesson.title} compact>
          <button className="duo-exit-button" type="button" onClick={onBack} aria-label="К слогам">
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="reading-path-done-card">
          <CheckCircle2 size={64} color="var(--green-dark)" aria-hidden="true" />
          <h2>Отлично, можно идти дальше</h2>
          <p>Ты прошел: {lesson.focus}</p>
          <button className="button button--primary" type="button" onClick={openNext}>
            {getNextSyllableLessonId(lesson.id) ? "Следующий урок" : "Перейти к словам"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack reading-path-screen">
      <Header title={lesson.title} subtitle={`${activeIndex + 1} / ${lesson.items.length}`} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="К слогам">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      <GlassCard className="reading-path-practice-card">
        <p className="section-kicker">{lesson.goal}</p>
        <div className="reading-path-focus" dir="rtl">{item.arabic}</div>
        <button className="button button--soft" type="button" onClick={() => speakArabic(item.arabic)}>
          <Volume2 size={18} aria-hidden="true" />
          Прослушать
        </button>
        <p className="reading-path-hint">{item.hint}</p>
      </GlassCard>

      <VoiceCheckPanel
        targets={[item.arabic, item.reading]}
        prompt={`Прочитай слог: ${item.arabic}`}
        successText="Хорошо! Слог звучит правильно."
        onPassed={() => setSelected(item.reading)}
      />

      <GlassCard className="reading-path-check-card">
        <h2>Как читается этот слог?</h2>
        <div className="reading-path-choice-grid">
          {choices.map((choice) => (
            <button
              key={choice}
              className={`reading-path-choice ${selected === choice ? "is-selected" : ""} ${selected === choice && choice === item.reading ? "is-correct" : ""} ${selected === choice && choice !== item.reading ? "is-wrong" : ""}`}
              type="button"
              onClick={() => setSelected(choice)}
            >
              {choice}
            </button>
          ))}
        </div>
        {selected ? (
          <p className={`reading-path-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}>
            {isCorrect ? "Верно. Теперь прочитай вслух и переходи дальше." : "Почти. Послушай еще раз и выбери правильный звук."}
          </p>
        ) : null}
      </GlassCard>

      <div className="reading-path-footer">
        <button className="button button--soft" type="button" onClick={() => speakArabic(item.arabic)}>
          Повторить звук
        </button>
        <button className="button button--primary" type="button" onClick={goNext} disabled={!isCorrect}>
          {activeIndex + 1 >= lesson.items.length ? "Завершить урок" : "Дальше"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default function SyllablesScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  if (lessonId) {
    return <SyllableLesson lessonId={lessonId} onBack={() => navigate("/lessons/syllables")} />;
  }

  return <SyllablesHub onSelect={(id) => navigate(`/lessons/syllables/${id}`)} onBack={() => navigate("/lessons")} />;
}
