import { ArrowRight, CheckCircle2, Crown, ShieldCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterHelper from "../components/CharacterHelper.jsx";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import LetterKnowledgeCheck from "../components/LetterKnowledgeCheck.jsx";
import { arabicLetters } from "../data/arabicLetters.js";
import { canOpenLessonNode, getChapterById, lessonPathNodes } from "../data/lessonPath.js";
import { completeLessonNode, getLessonPathState, getSelectedCharacter } from "../utils/storage.js";

export default function ChapterChallengeScreen({ mode = "checkpoint" }) {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const chapter = getChapterById(chapterId);
  const character = getSelectedCharacter() || "ahmad";
  const lessonState = getLessonPathState();
  const targetNode =
    lessonPathNodes.find((node) => node.id === lessonState.currentLessonNode && node.chapter === chapter.id && node.type === mode) ||
    lessonPathNodes.find((node) => node.chapter === chapter.id && node.type === mode);
  const Icon = mode === "boss" ? Crown : ShieldCheck;
  const title = mode === "boss" ? `Испытание: ${chapter.title}` : `Контрольная точка: ${chapter.title}`;

  const canFinish = Boolean(targetNode && canOpenLessonNode(targetNode.id, lessonState));

  const letters = arabicLetters.filter((letter) => chapter.letters.includes(letter.letter));

  function finishChallenge(result) {
    if (!canFinish) return;
    completeLessonNode(targetNode.id, { perfect: result.perfect });
    navigate("/lessons");
  }

  return (
    <section className="content-stack">
      <Header title={title} subtitle="Проверим знания спокойно и уверенно">
        <CharacterHelper character={character} message="Позади уже большой путь. Давай закрепим результат." mood="success" compact />
      </Header>

      <GlassCard className="chapter-challenge-card">
        <div className="chapter-challenge-card__icon">
          <Icon size={54} aria-hidden="true" />
        </div>
        <div>
          <p className="section-kicker">Глава {chapter.number}</p>
          <h2>{chapter.title}</h2>
          <p>{chapter.description}</p>
        </div>
        <div className="chapter-challenge-card__checks">
          <span><CheckCircle2 size={18} aria-hidden="true" /> Узнать буквы</span>
          <span><CheckCircle2 size={18} aria-hidden="true" /> Вспомнить звуки</span>
          <span><CheckCircle2 size={18} aria-hidden="true" /> Закрепить без спешки</span>
        </div>
        {canFinish && letters.length ? <LetterKnowledgeCheck key={targetNode.id} letters={letters} onComplete={finishChallenge} /> : <p>Сначала заверши предыдущие задания на карте уроков.</p>}
        <button className="button button--soft" type="button" onClick={() => navigate("/lessons")}>К карте уроков</button>
      </GlassCard>
    </section>
  );
}
