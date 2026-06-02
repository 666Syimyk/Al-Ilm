import ChapterDivider from "./ChapterDivider.jsx";
import ChapterRewardCard from "./ChapterRewardCard.jsx";
import CharacterHelper from "./CharacterHelper.jsx";
import LessonConnector from "./LessonConnector.jsx";
import LessonNode from "./LessonNode.jsx";
import { getNodeReward } from "../data/lessonPath.js";

export default function LearningMap({ chapters, nodes, completedChapters, lockedNodeId, character, activeMessage, onNodeClick }) {
  return (
    <div className="learning-map">
      <div className="learning-map__head">
        <p className="section-kicker">Карта знаний</p>
        <h2>Открывай шаги один за другим</h2>
        <p>Буквы, звуки, слоги, слова и чтение ведут к Корану шаг за шагом.</p>
      </div>

      <div className="learning-map__chapter-strip" aria-label="Главы пути знаний">
        {chapters.map((chapter) => {
          const chapterNodes = nodes.filter((node) => node.chapter === chapter.id);
          const completedCount = chapterNodes.filter((node) => node.status === "completed").length;
          const hasCurrent = chapterNodes.some((node) => node.status === "current");
          const percent = chapterNodes.length ? Math.round((completedCount / chapterNodes.length) * 100) : 0;

          return (
            <a className={`learning-map__chapter-chip ${hasCurrent ? "is-current" : ""}`} href={`#${chapter.id}`} key={chapter.id}>
              <span>{chapter.number}</span>
              <strong>{chapter.title}</strong>
              <small>{percent}%</small>
            </a>
          );
        })}
      </div>

      {chapters.map((chapter) => {
        const chapterNodes = nodes.filter((node) => node.chapter === chapter.id);
        const completedCount = chapterNodes.filter((node) => node.status === "completed").length;
        const isChapterCompleted = completedChapters.includes(chapter.id);

        return (
          <section className="learning-map__chapter" id={chapter.id} key={chapter.id}>
            <ChapterDivider chapter={chapter} completedCount={completedCount} totalCount={chapterNodes.length} />
            <div className="learning-map__path">
              {chapterNodes.map((node, index) => {
                const reward = getNodeReward(node);
                const connectorStatus = node.status === "locked" ? "locked" : "open";
                const side = index % 2 === 0 ? "left" : "right";

                return (
                  <div className={`learning-map__step learning-map__step--${side}`} key={node.id}>
                    <LessonNode
                      {...node}
                      points={reward.points}
                      coins={reward.coins}
                      isShaking={lockedNodeId === node.id}
                      onClick={() => onNodeClick(node)}
                    />
                    {node.status === "current" ? (
                      <div className={`active-node-coach active-node-coach--${side}`}>
                        <CharacterHelper character={character} message={activeMessage} mood="teaching" compact />
                      </div>
                    ) : null}
                    {index < chapterNodes.length - 1 ? <LessonConnector status={connectorStatus} /> : null}
                  </div>
                );
              })}
            </div>
            <ChapterRewardCard chapter={chapter} isCompleted={isChapterCompleted} />
          </section>
        );
      })}
    </div>
  );
}
