import { ArrowRight, Lock } from "lucide-react";
import GlassCard from "./GlassCard.jsx";

export default function LessonCard({ title, description, meta, action, locked = false, onClick, letter }) {
  return (
    <GlassCard as="article" className={`lesson-card ${locked ? "lesson-card--locked" : ""}`}>
      <div className="lesson-card__top">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {letter ? <span className="arabic-chip">{letter}</span> : locked ? <Lock aria-hidden="true" /> : null}
      </div>
      {meta ? <p className="lesson-card__meta">{meta}</p> : null}
      {action ? (
        <button className="button button--soft" type="button" onClick={onClick} disabled={locked}>
          {action}
          {locked ? <Lock size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
        </button>
      ) : null}
    </GlassCard>
  );
}
