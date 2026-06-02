import { BookOpen, Coins, Flame, Star } from "lucide-react";
import CharacterHelper from "./CharacterHelper.jsx";
import GlassCard from "./GlassCard.jsx";

export default function LessonProgressPanel({ character, message, progress, chapter, chapterProgress }) {
  const percent = chapterProgress.total ? Math.round((chapterProgress.completed / chapterProgress.total) * 100) : 0;

  return (
    <GlassCard className="lesson-progress-panel">
      <CharacterHelper character={character} message={message} mood="teaching" />
      <div className="lesson-progress-panel__chapter">
        <p className="section-kicker">Текущая глава</p>
        <h2>{chapter.title}</h2>
        <div className="lesson-progress-panel__bar" aria-label={`Глава открыта на ${percent}%`}>
          <span style={{ "--lesson-panel-progress": `${percent}%` }} />
        </div>
        <strong>{chapterProgress.completed} / {chapterProgress.total} шагов</strong>
      </div>
      <div className="lesson-progress-panel__stats">
        <div>
          <BookOpen size={19} aria-hidden="true" />
          <span>Буквы</span>
          <strong>{progress.completedLetters.length} / 28</strong>
        </div>
        <div>
          <Star size={19} aria-hidden="true" />
          <span>Очки</span>
          <strong>{progress.points}</strong>
        </div>
        <div>
          <Coins size={19} aria-hidden="true" />
          <span>Монеты</span>
          <strong>{progress.coins}</strong>
        </div>
        <div>
          <Flame size={19} aria-hidden="true" />
          <span>Серия</span>
          <strong>{progress.streak}</strong>
        </div>
      </div>
    </GlassCard>
  );
}
