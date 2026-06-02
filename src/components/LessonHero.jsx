import { Map, Sparkles } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";
import CharacterHelper from "./CharacterHelper.jsx";
import GlassCard from "./GlassCard.jsx";

export default function LessonHero({ character, message, currentTitle, nextReward }) {
  return (
    <GlassCard className="lesson-hero">
      <div className="lesson-hero__copy">
        <BrandLogo className="lesson-hero__brand" />
        <p className="section-kicker">Путь знаний</p>
        <h1>Уроки</h1>
        <p>Продолжай свой путь знаний</p>
        <div className="lesson-hero__chips">
          <span>
            <Map size={17} aria-hidden="true" />
            Сейчас: {currentTitle}
          </span>
          <span>
            <Sparkles size={17} aria-hidden="true" />
            Награда: {nextReward}
          </span>
        </div>
      </div>
      <CharacterHelper character={character} message={message} mood="teaching" />
    </GlassCard>
  );
}
