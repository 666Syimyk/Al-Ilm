import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ahmad from "../assets/characters/ahmad.png";
import amina from "../assets/characters/amina.png";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import { getSelectedCharacter, setSelectedCharacter } from "../utils/storage.js";

const characters = [
  {
    id: "ahmad",
    name: "Ахмад",
    image: ahmad,
    description: "Поможет тебе изучать буквы и проходить задания."
  },
  {
    id: "amina",
    name: "Амина",
    image: amina,
    description: "Поможет тебе учиться, повторять и получать награды."
  }
];

export default function CharacterSelectScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(getSelectedCharacter() || "ahmad");

  function handleContinue() {
    setSelectedCharacter(selected);
    navigate("/home");
  }

  return (
    <section className="content-stack character-select-screen">
      <Header title="Выбери своего помощника" subtitle="Он будет помогать тебе учиться и получать награды." />
      <div className="character-select-grid">
        {characters.map((character) => (
          <GlassCard
            as="button"
            className={`character-select-card ${selected === character.id ? "is-selected" : ""}`}
            key={character.id}
            type="button"
            onClick={() => setSelected(character.id)}
          >
            {selected === character.id ? (
              <span className="selected-check">
                <Check size={20} aria-hidden="true" />
              </span>
            ) : null}
            <img src={character.image} alt={character.name} />
            <h2>{character.name}</h2>
            <p>{character.description}</p>
          </GlassCard>
        ))}
      </div>
      <div className="action-row action-row--center">
        <button className="button button--primary" type="button" onClick={handleContinue}>
          Продолжить
        </button>
      </div>
    </section>
  );
}
