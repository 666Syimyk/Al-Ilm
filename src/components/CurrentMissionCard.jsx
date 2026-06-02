import { ArrowRight, CheckCircle2, Circle, Target } from "lucide-react";
import CharacterHelper from "./CharacterHelper.jsx";
import GlassCard from "./GlassCard.jsx";

export default function CurrentMissionCard({ character, mission, onContinue }) {
  const progressPercent = mission.total ? Math.round((mission.completed / mission.total) * 100) : 0;

  return (
    <GlassCard className="current-mission-card">
      <div className="current-mission-card__main">
        <div>
          <p className="section-kicker">Сегодняшняя миссия</p>
          <h2>{mission.title}</h2>
          <p>{mission.subtitle}</p>
        </div>
        <span className="current-mission-card__letter">{mission.letter}</span>
      </div>

      <div className="current-mission-card__body">
        <div className="current-mission-card__tasks">
          {mission.tasks.map((task, index) => (
            <div className={`current-mission-task ${task.done ? "is-done" : ""}`} key={`${task.title}-${index}`}>
              {task.done ? <CheckCircle2 size={20} aria-hidden="true" /> : <Circle size={20} aria-hidden="true" />}
              <span>{task.title}</span>
            </div>
          ))}
        </div>

        <div className="current-mission-card__side">
          <CharacterHelper character={character} message={mission.message} mood="happy" compact />
          <div className="current-mission-card__progress">
            <Target size={22} aria-hidden="true" />
            <span>Прогресс миссии</span>
            <strong>{mission.completed} / {mission.total}</strong>
          </div>
          <div className="current-mission-card__bar" aria-label={`Миссия выполнена на ${progressPercent}%`}>
            <span style={{ "--mission-progress": `${progressPercent}%` }} />
          </div>
          <button className="button button--primary" type="button" onClick={onContinue}>
            Продолжить миссию
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
