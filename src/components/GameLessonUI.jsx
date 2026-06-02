import { ArrowRight, Sparkles, Star } from "lucide-react";

export function GameLessonLayout({ children, className = "" }) {
  return <div className={`game-lesson-layout ${className}`.trim()}>{children}</div>;
}

export function TopBar({ title, subtitle, combo = 0, timeLeft = null }) {
  return (
    <div className="game-topbar">
      <div>
        <span className="game-topbar__eyebrow">{subtitle}</span>
        <strong>{title}</strong>
      </div>
      <div className="game-topbar__stats" aria-label="Игровой статус">
        {timeLeft !== null ? <span>{timeLeft}s</span> : null}
        <span>Комбо x{combo}</span>
      </div>
    </div>
  );
}

export function XPBar({ value = 0, max = 100 }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="game-xp" aria-label={`XP ${pct}%`}>
      <span style={{ width: `${pct}%` }} />
      <strong>{value} XP</strong>
    </div>
  );
}

export function GameButton({ children, icon: Icon = ArrowRight, className = "", ...props }) {
  return (
    <button className={`game-button ${className}`.trim()} type="button" {...props}>
      <span>{children}</span>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
    </button>
  );
}

export function FloatingParticles({ count = 16 }) {
  return (
    <div className="floating-particles" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => <span key={index} style={{ "--i": index }} />)}
    </div>
  );
}

export function RewardPopup({ show, title = "Награда", xp = 0, coins = 0 }) {
  if (!show) return null;
  return (
    <div className="reward-popup" role="status" aria-live="polite">
      <Sparkles size={20} aria-hidden="true" />
      <strong>{title}</strong>
      <span>+{xp} XP</span>
      {coins ? <span>+{coins} монет</span> : null}
    </div>
  );
}

export function LessonProgress({ current = 0, total = 7 }) {
  return (
    <div className="lesson-progress" aria-label={`Прогресс ${current} из ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={index < current ? "is-done" : index === current ? "is-current" : ""}>
          {index < current ? <Star size={13} fill="currentColor" /> : index + 1}
        </span>
      ))}
    </div>
  );
}

export function GameTransition({ label }) {
  if (!label) return null;
  return <div className="game-transition">{label}</div>;
}
