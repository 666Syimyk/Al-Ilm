import { ArrowRight, CheckCircle2, Lock, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import VoiceCheckPanel from "../components/VoiceCheckPanel.jsx";
import { getNextWordLessonId, getWordLessonById, wordLessons } from "../data/readingPath.js";
import { canOpenLessonNode, lessonPathNodes, withLessonPathStatus } from "../data/lessonPath.js";
import { completeLessonNode, getLessonPathState } from "../utils/storage.js";
import { speakText } from "../utils/audioPlayback.js";

function speakArabic(text) {
  speakText(text, { lang: "ar-SA", rate: 0.62 });
}

function WordsHub({ onSelect, onBack }) {
  const nodes = withLessonPathStatus(lessonPathNodes, getLessonPathState());
  const statusByNodeId = new Map(nodes.map((node) => [node.id, node.status]));
  const completedCount = wordLessons.filter((lesson) => statusByNodeId.get(lesson.nodeId) === "completed").length;

  return (
    <section className="content-stack reading-path-screen">
      <Header title="Слова" subtitle="После слогов читаем целые слова" compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="Назад к урокам">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      <GlassCard className="reading-path-intro">
        <p className="section-kicker">Путь чтения</p>
        <h2>Слоги складываются в слова</h2>
        <p>Здесь ребенок видит слово целиком, потом разбирает его на части и снова читает вместе. Так чтение становится спокойным и понятным.</p>
        <div className="reading-path-progress">
          <span style={{ "--reading-path-progress": `${Math.round((completedCount / wordLessons.length) * 100)}%` }} />
        </div>
        <strong>{completedCount} / {wordLessons.length} уроков пройдено</strong>
      </GlassCard>

      <div className="reading-path-list">
        {wordLessons.map((lesson) => {
          const status = statusByNodeId.get(lesson.nodeId) || "locked";
          const isDone = status === "completed";
          const isLocked = status === "locked";

          return (
            <GlassCard key={lesson.id} className={`reading-path-card ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}>
              <div className="reading-path-card__index">
                {isDone ? <CheckCircle2 size={18} aria-hidden="true" /> : isLocked ? <Lock size={18} aria-hidden="true" /> : lesson.order}
              </div>
              <div className="reading-path-card__body">
                <span className="reading-path-card__sample" lang="ar" dir="rtl">{lesson.words[0]?.arabic}</span>
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

function WordLesson({ lessonId, onBack }) {
  const navigate = useNavigate();
  const lesson = getWordLessonById(lessonId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [partsRevealed, setPartsRevealed] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState("");
  const word = lesson.words[activeIndex];
  const choices = useMemo(() => {
    const options = [...new Set([word.translation, ...lesson.words.filter((item) => item.translation !== word.translation).slice(0, 2).map((item) => item.translation)])];
    const offset = activeIndex % options.length;
    return [...options.slice(offset), ...options.slice(0, offset)];
  }, [lesson.words, activeIndex, word]);

  useEffect(() => {
    if (!canOpenLessonNode(lesson.nodeId, getLessonPathState())) {
      navigate("/lessons/words", { replace: true });
    }
  }, [lesson.nodeId, navigate]);

  function goNext() {
    if (selected !== word.translation) return;
    if (activeIndex + 1 >= lesson.words.length) {
      const result = completeLessonNode(lesson.nodeId);
      if (result.blocked) return;
      setFinished(true);
      return;
    }
    setActiveIndex((current) => current + 1);
    setPartsRevealed(false);
    setTranslationRevealed(false);
    setSelected("");
  }

  function openNext() {
    const nextId = getNextWordLessonId(lesson.id);
    if (nextId) {
      navigate(`/lessons/words/${nextId}`);
      return;
    }
    navigate("/reading");
  }

  if (finished) {
    return (
      <section className="content-stack reading-path-screen">
        <Header title="Слова пройдены" subtitle={lesson.title} compact>
          <button className="duo-exit-button" type="button" onClick={onBack} aria-label="К словам">
            <X size={24} aria-hidden="true" />
          </button>
        </Header>
        <GlassCard className="reading-path-done-card">
          <CheckCircle2 size={64} color="var(--green-dark)" aria-hidden="true" />
          <h2>Теперь можно читать строки</h2>
          <p>Ты уже умеешь соединять буквы, слоги и слова.</p>
          <button className="button button--primary" type="button" onClick={openNext}>
            {getNextWordLessonId(lesson.id) ? "Следующий урок" : "Перейти к чтению"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack reading-path-screen">
      <Header title={lesson.title} subtitle={`${activeIndex + 1} / ${lesson.words.length}`} compact>
        <button className="duo-exit-button" type="button" onClick={onBack} aria-label="К словам">
          <X size={24} aria-hidden="true" />
        </button>
      </Header>

      <GlassCard className="reading-path-practice-card">
        <p className="section-kicker">{lesson.goal}</p>
        <div className="reading-path-focus reading-path-focus--word" dir="rtl">{word.arabic}</div>
        <button className="button button--soft" type="button" onClick={() => speakArabic(word.arabic)}>
          <Volume2 size={18} aria-hidden="true" />
          Прослушать
        </button>
      </GlassCard>

      <VoiceCheckPanel
        targets={[word.arabic, word.reading]}
        prompt={`Прочитай слово: ${word.arabic}`}
        successText="Браузер распознал слово. Точность произношения проверяй с учителем."
        onPassed={() => {
          setPartsRevealed(true);
          setTranslationRevealed(true);
        }}
      />

      <GlassCard className="reading-path-word-card">
        <div className="reading-path-word-row">
          <span>Чтение</span>
          <strong>{word.reading}</strong>
        </div>
        <div className="reading-path-word-actions">
          <button className="button button--soft" type="button" onClick={() => setPartsRevealed((value) => !value)}>
            {partsRevealed ? "Скрыть части" : "Разобрать по слогам"}
          </button>
          <button className="button button--ghost" type="button" onClick={() => setTranslationRevealed((value) => !value)}>
            {translationRevealed ? "Скрыть перевод" : "Показать перевод"}
          </button>
        </div>
        {partsRevealed ? (
          <div className="reading-path-parts" dir="rtl">
            {word.parts.map((part) => (
              <span key={`${word.arabic}-${part}`}>{part}</span>
            ))}
          </div>
        ) : null}
        {translationRevealed ? <p className="reading-path-translation">{word.translation}</p> : null}
      </GlassCard>

      <GlassCard>
        <h2>Выбери значение слова</h2>
        <div className="game-actions">{choices.map((choice) => <button className={`button button--soft ${selected === choice ? choice === word.translation ? "is-correct" : "is-wrong" : ""}`} key={choice} type="button" onClick={() => setSelected(choice)}>{choice}</button>)}</div>
        <p role="status">{selected ? selected === word.translation ? "Верно!" : "Сверь с переводом и попробуй ещё раз." : "Прочитай слово и выбери его значение."}</p>
      </GlassCard>

      <div className="reading-path-footer">
        <button className="button button--soft" type="button" onClick={() => speakArabic(word.arabic)}>
          Повторить слово
        </button>
        <button className="button button--primary" type="button" onClick={goNext} disabled={selected !== word.translation}>
          {activeIndex + 1 >= lesson.words.length ? "Завершить урок" : "Следующее слово"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export default function WordsPathScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  if (lessonId) {
    return <WordLesson key={lessonId} lessonId={lessonId} onBack={() => navigate("/lessons/words")} />;
  }

  return <WordsHub onSelect={(id) => navigate(`/lessons/words/${id}`)} onBack={() => navigate("/lessons")} />;
}
