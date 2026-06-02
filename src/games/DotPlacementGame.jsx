import { useState } from "react";

const options = [
  "Без точек",
  "Одна точка сверху",
  "Одна точка снизу",
  "Две точки сверху",
  "Две точки снизу",
  "Три точки сверху"
];

export default function DotPlacementGame({ letter, onComplete }) {
  const [message, setMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const correctOption = letter.dotPlacement || "Без точек";

  function choose(option) {
    if (isSolved) return;
    setSelectedOption(option);
    if (option === correctOption) {
      setIsSolved(true);
      setMessage(`Молодец! Получилась буква ${letter.nameRu}.`);
      onComplete();
    } else {
      setMessage("Попробуй ещё раз.");
    }
  }

  return (
    <div className="game-content">
      <h3>Где точки у буквы «{letter.nameRu}»?</h3>
      <div className="duo-dot-stage">
        <span className="dot-preview">{letter.dotGroup || letter.letter}</span>
        <p>Выбери правильное расположение точек.</p>
      </div>
      <div className="dot-options">
        {options.map((option) => (
          <button
            className={`button button--soft ${selectedOption === option ? (option === correctOption ? "is-correct" : "is-wrong") : ""}`}
            key={option}
            type="button"
            onClick={() => choose(option)}
            disabled={isSolved}
          >
            {option}
          </button>
        ))}
      </div>
      {message ? <p className="game-message">{message}</p> : null}
    </div>
  );
}
