import { Check, Lock } from "lucide-react";

export default function LetterCard({ letter, onClick }) {
  const disabled = letter.status === "locked";

  return (
    <button className={`letter-card letter-card--${letter.status}`} type="button" onClick={onClick} disabled={disabled}>
      <span className="letter-card__symbol">{letter.letter}</span>
      <span className="letter-card__name">{letter.nameRu}</span>
      <span className="letter-card__status">
        {letter.status === "completed" ? (
          <>
            <Check size={16} aria-hidden="true" /> Пройдено
          </>
        ) : letter.status === "current" ? (
          "Текущий урок"
        ) : (
          <>
            <Lock size={15} aria-hidden="true" /> Закрыто
          </>
        )}
      </span>
    </button>
  );
}
