import { useMemo, useState } from "react";
import { arabicLetters } from "../data/arabicLetters.js";

export default function CatchLetterGame({ letter, onComplete }) {
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const letters = useMemo(() => {
    const distractors = arabicLetters
      .filter((item) => item.id !== letter.id)
      .slice(0, 12)
      .map((item, index) => ({ ...item, key: `${item.id}-${index}` }));
    const targets = Array.from({ length: 3 }, (_, index) => ({ ...letter, key: `${letter.id}-target-${index}` }));
    return [...distractors, ...targets].sort(() => Math.random() - 0.5);
  }, [letter]);

  function catchLetter(item) {
    if (item.id === letter.id) {
      const nextScore = score + 1;
      setScore(nextScore);
      setMessage("Правильно! Это нужная буква.");
      if (nextScore >= 3) {
        setMessage("Молодец! Ты поймал все нужные буквы.");
        onComplete();
      }
    } else {
      setScore(Math.max(0, score - 1));
      setMessage("Попробуй ещё раз.");
    }
  }

  return (
    <div className="game-content">
      <h3>Ловите только букву «{letter.nameRu}»</h3>
      <div className="duo-score-pill">Поймано: {score} / 3</div>
      <div className="catch-field">
        {letters.map((item) => (
          <button className="catch-letter" key={item.key} type="button" onClick={() => catchLetter(item)}>
            {item.letter}
          </button>
        ))}
      </div>
      {message ? <p className="game-message">{message}</p> : null}
    </div>
  );
}
