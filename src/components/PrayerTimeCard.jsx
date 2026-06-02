import { ArrowRight, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";
import { prayerTimes } from "../data/prayerTimes.js";

export default function PrayerTimeCard({ compact = false }) {
  const navigate = useNavigate();

  return (
    <GlassCard className={`prayer-card ${compact ? "prayer-card--compact" : ""}`}>
      <div className="prayer-card__header">
        <Clock3 aria-hidden="true" />
        <span>Следующий намаз</span>
      </div>
      <div className="prayer-card__main">
        <strong>{prayerTimes.nextPrayer}</strong>
        <span>{prayerTimes.nextPrayerTime}</span>
      </div>
      <p>Осталось: {prayerTimes.countdown}</p>
      <button className="button button--soft" type="button" onClick={() => navigate("/namaz")}>
        Подробнее
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </GlassCard>
  );
}
