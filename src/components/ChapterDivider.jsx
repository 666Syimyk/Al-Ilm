import { Gift } from "lucide-react";

export default function ChapterDivider({ chapter, completedCount, totalCount }) {
  return (
    <div className="chapter-divider">
      <div className="chapter-divider__badge">Глава {chapter.number}</div>
      <div className="chapter-divider__copy">
        <h2>{chapter.title}</h2>
        <p>{chapter.description}</p>
        <div className="chapter-divider__progress" aria-label={`Прогресс главы ${completedCount} из ${totalCount}`}>
          <span style={{ "--chapter-progress": `${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%` }} />
        </div>
        <strong>Прогресс: {completedCount} / {totalCount}</strong>
      </div>
      <div className="chapter-divider__reward">
        <Gift size={22} aria-hidden="true" />
        <span>{chapter.rewardTitle}</span>
      </div>
    </div>
  );
}
