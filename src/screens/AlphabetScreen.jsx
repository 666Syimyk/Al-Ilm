import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import LetterCard from "../components/LetterCard.jsx";
import { arabicLetters } from "../data/arabicLetters.js";
import { getLettersWithStatus, getProgress } from "../utils/storage.js";

export default function AlphabetScreen() {
  const navigate = useNavigate();
  const progress = getProgress();
  const letters = getLettersWithStatus();

  return (
    <section className="content-stack">
      <Header title="Арабский алфавит" subtitle="Выбери букву для изучения" compact>
        <div className="progress-pill">{progress.completedLetters.length} / {arabicLetters.length} букв изучено</div>
      </Header>

      <div className="alphabet-grid">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} onClick={() => navigate(`/letter/${letter.id}`)} />
        ))}
      </div>
    </section>
  );
}
