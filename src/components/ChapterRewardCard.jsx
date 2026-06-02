import { Sparkles, Trophy } from "lucide-react";

export default function ChapterRewardCard({ chapter, isCompleted }) {
  return (
    <div className={`chapter-reward-card ${isCompleted ? "is-completed" : ""}`}>
      <div className="chapter-reward-card__icon">
        {isCompleted ? <Trophy size={26} aria-hidden="true" /> : <Sparkles size={26} aria-hidden="true" />}
      </div>
      <div>
        <strong>{chapter.rewardTitle}</strong>
        <p>{chapter.rewardText}</p>
      </div>
    </div>
  );
}
