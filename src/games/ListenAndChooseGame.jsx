import { Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { arabicLetters } from "../data/arabicLetters.js";
import { speakText } from "../utils/audioPlayback.js";

export default function ListenAndChooseGame({ letter, onComplete }) {
  const [message, setMessage] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const options = useMemo(() => {
    const items = [letter, ...arabicLetters.filter((item) => item.id !== letter.id).slice(8, 12)];
    for (let index = items.length - 1; index > 0; index -= 1) {
      const other = Math.floor(Math.random() * (index + 1));
      [items[index], items[other]] = [items[other], items[index]];
    }
    return items;
  }, [letter]);

  function playSound(rate = 0.72) {
    setMessage(`Слушай: ${letter.soundText}`);
    speakText(letter.soundText, { lang: "ar-SA", rate });
  }

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
      <h3>Какую букву ты слышишь?</h3>
      <div className="duo-sound-cluster">
        <button className="duo-listen-button" type="button" onClick={() => playSound()} aria-label="Прослушать звук">
          <Volume2 size={48} aria-hidden="true" />
        </button>
        <button className="duo-listen-button duo-listen-button--slow" type="button" onClick={() => playSound(0.55)} aria-label="Прослушать медленно">
          <Volume2 size={30} aria-hidden="true" />
        </button>
      </div>
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
