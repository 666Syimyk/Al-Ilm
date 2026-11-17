import { useMemo, useState } from "react";
import { arabicLetters } from "../data/arabicLetters.js";

export default function CatchLetterGame({ letter, onComplete }) {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [caughtKeys, setCaughtKeys] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const letters = useMemo(() => {
    const distractors = arabicLetters
      .filter((item) => item.id !== letter.id)
      .slice(0, 12)
      .map((item, index) => ({ ...item, key: `${item.id}-${index}` }));
    const targets = Array.from({ length: 3 }, (_, index) => ({ ...letter, key: `${letter.id}-target-${index}` }));
    return [...distractors, ...targets].sort(() => Math.random() - 0.5);
  }, [letter]);

  function catchLetter(item) {
    if (isSolved || caughtKeys.includes(item.key)) return;
    if (item.id === letter.id) {
      const nextCaught = [...caughtKeys, item.key];
      setCaughtKeys(nextCaught);
      const nextScore = nextCaught.length;
      setScore(nextScore);
      setMessage("Правильно! Это нужная буква.");
      if (nextScore >= 3) {
        setIsSolved(true);
        setMessage("Молодец! Все нужные буквы пойманы.");
        onComplete();
      }
    } else {
      setMessage("Попробуй ещё раз.");
    }
  }

  return (
    <div className="game-content">
      <h3>Ловите только букву «{letter.nameRu}»</h3>
      <div className="duo-score-pill">Поймано: {score} / 3</div>
      <div className="catch-field">
        {letters.map((item) => (
          <button className={`catch-letter ${caughtKeys.includes(item.key) ? "is-correct" : ""}`} key={item.key} type="button" onClick={() => catchLetter(item)} disabled={isSolved || caughtKeys.includes(item.key)}>
            {item.letter}
          </button>
        ))}
      </div>
      {message ? <p className="game-message">{message}</p> : null}
    </div>
  );
}
