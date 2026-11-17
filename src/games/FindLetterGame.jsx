import { useMemo, useState } from "react";
import { arabicLetters } from "../data/arabicLetters.js";

export default function FindLetterGame({ letter, onComplete }) {
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const options = useMemo(() => {
    const pool = arabicLetters.filter((item) => item.id !== letter.id).slice(0, 5);
    return [letter, ...pool].sort((a, b) => a.letter.localeCompare(b.letter));
  }, [letter]);

  function choose(option) {
    if (isSolved) return;
    setSelectedId(option.id);
    if (option.id === letter.id) {
      setIsSolved(true);
      setMessage("Молодец! Правильно!");
      onComplete();
    } else {
      setMessage("Попробуй ещё раз.");
    }
  }

  return (
    <div className="game-content">
      <h3>Выбери букву «{letter.nameRu}»</h3>
      <div className="game-options">
        {options.map((option, index) => (
          <button
            className={`game-letter-button ${selectedId === option.id ? (option.id === letter.id ? "is-correct" : "is-wrong") : ""}`}
            key={option.id}
            type="button"
            onClick={() => choose(option)}
            disabled={isSolved}
          >
            <span className="game-letter-button__symbol">{option.letter}</span>
            <span className="game-letter-button__name">{option.nameRu}</span>
            <span className="game-letter-button__key">{index + 1}</span>
          </button>
        ))}
      </div>
      {message ? <p className="game-message">{message}</p> : null}
    </div>
  );
}
