import ahmad from "../assets/characters/ahmad.png";
import amina from "../assets/characters/amina.png";

const characterImages = {
  ahmad,
  amina
};

const characterNames = {
  ahmad: "Ахмад",
  amina: "Амина"
};

export default function CharacterHelper({ character = "ahmad", message, mood = "happy", compact = false }) {
  const safeCharacter = characterImages[character] ? character : "ahmad";

  return (
    <div className={`character-helper mood-${mood} ${compact ? "character-helper--compact" : ""}`}>
      <div className="character-helper__image-wrap">
        <img src={characterImages[safeCharacter]} alt={characterNames[safeCharacter]} />
        <span className="character-helper__letter">ب</span>
      </div>
      {message ? (
        <div className="character-helper__bubble">
          <strong>{characterNames[safeCharacter]}</strong>
          <p>{message}</p>
        </div>
      ) : null}
    </div>
  );
}
