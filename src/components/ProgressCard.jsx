import { BookOpenCheck, Flame, GraduationCap, Sparkles, Star } from "lucide-react";
import GlassCard from "./GlassCard.jsx";
import { arabicLetters } from "../data/arabicLetters.js";

export default function ProgressCard({ progress, quranState = null, quranTracking = null, title = "Твой прогресс" }) {
  const quranGoal = quranTracking?.dailyGoal || 5;
  const metrics = [
    { label: "Изучено букв", value: `${progress.completedLetters.length} / ${arabicLetters.length}`, icon: GraduationCap },
    { label: "Коран сегодня", value: `${quranTracking?.todayReadCount || 0} / ${quranGoal}`, icon: BookOpenCheck },
    { label: "Выучено сур", value: quranState?.memorizedSurahs?.length || 0, icon: Star },
    { label: "Серия дней", value: progress.streak, icon: Flame },
    { label: "Очки", value: progress.points, icon: Sparkles }
  ];

  return (
    <GlassCard className="progress-card">
      <h2>{title}</h2>
      <div className="metric-grid">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div className="metric-tile" key={label}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
