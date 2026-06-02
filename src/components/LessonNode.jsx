import { BookOpenText, Check, Crown, Gamepad2, Gift, Lock, Pencil, RotateCcw, ShieldCheck, Star, Type, Volume2 } from "lucide-react";
import NodeTooltip from "./NodeTooltip.jsx";

const typeIcons = {
  letter: Star,
  sound: Volume2,
  writing: Pencil,
  game: Gamepad2,
  quiz: Check,
  reward: Gift,
  checkpoint: ShieldCheck,
  review: RotateCcw,
  syllable: Type,
  word: BookOpenText,
  reading: BookOpenText,
  boss: Crown
};

const typeLabels = {
  letter: "Буква",
  sound: "Слушание",
  writing: "Письмо",
  game: "Игра",
  quiz: "Проверка",
  reward: "Награда",
  checkpoint: "Контроль",
  review: "Повторение",
  syllable: "Слог",
  word: "Слово",
  reading: "Чтение",
  boss: "Испытание"
};

const statusLabels = {
  completed: "Пройдено",
  current: "Сейчас",
  locked: "Закрыто",
  bonus: "Бонус"
};

export default function LessonNode({ type, title, subtitle, letter, status, points = 0, coins = 0, icon: IconOverride, isShaking = false, onClick }) {
  const Icon = IconOverride || typeIcons[type] || Star;
  const statusLabel = statusLabels[status] || status;

  return (
    <button
      className={`lesson-node lesson-node--${type} lesson-node--${status} ${isShaking ? "is-shaking" : ""}`}
      type="button"
      aria-disabled={status === "locked"}
      aria-label={`${title}. ${statusLabel}`}
      onClick={onClick}
    >
      <span className="lesson-node__badge">
        {status === "completed" ? <Check size={20} aria-hidden="true" /> : status === "locked" ? <Lock size={20} aria-hidden="true" /> : <Icon size={22} aria-hidden="true" />}
      </span>
      <span className="lesson-node__body">
        <span className="lesson-node__topline">
          <span className="lesson-node__type">{typeLabels[type] || "Урок"}</span>
          <span className="lesson-node__status">{statusLabel}</span>
        </span>
        {letter ? <span className="lesson-node__letter">{letter}</span> : null}
        <strong>{title}</strong>
        <small>{subtitle}</small>
        {status === "current" ? <em>Продолжить</em> : null}
        {status === "bonus" ? <em className="lesson-node__bonus">Бонус</em> : null}
      </span>
      <span className="lesson-node__points" aria-hidden="true">
        +{points}
      </span>
      <NodeTooltip status={status} points={points} coins={coins} />
    </button>
  );
}
