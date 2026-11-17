import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import LetterCard from "../components/LetterCard.jsx";
import LetterKnowledgeCheck from "../components/LetterKnowledgeCheck.jsx";
import { canOpenLessonNode } from "../data/lessonPath.js";
import { arabicLetters } from "../data/arabicLetters.js";
import { completeLessonNode, getLessonPathState, getLettersWithStatus, getProgress } from "../utils/storage.js";

export default function AlphabetScreen() {
  const navigate = useNavigate();
  const progress = getProgress();
  const letters = getLettersWithStatus();

  return (
    <section className="content-stack">
      <Header title="Арабский алфавит" subtitle="Выбери букву для изучения" compact>
        <div className="progress-pill">{progress.completedLetters.length} / {arabicLetters.length} букв изучено</div>
      </Header>

      {canOpenLessonNode("alphabet-review", getLessonPathState()) ? (
        <section className="glass-card">
          <h2>Повторение алфавита</h2>
          <p>Узнай все 28 букв. Ошибочный ответ можно исправить.</p>
          <LetterKnowledgeCheck letters={arabicLetters} onComplete={() => { completeLessonNode("alphabet-review"); navigate("/lessons"); }} />
        </section>
      ) : null}

      <div className="alphabet-grid">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} onClick={() => navigate(`/letter/${letter.id}`)} />
        ))}
      </div>
    </section>
  );
}
