import LessonNode from "./LessonNode.jsx";
import LessonPathConnector from "./LessonPathConnector.jsx";

export default function LessonPath({ nodes, onNodeClick }) {
  return (
    <div className="lesson-path-map" aria-label="Путь уроков">
      {nodes.map((node, index) => (
        <div className={`lesson-path-map__step lesson-path-map__step--${index % 2 === 0 ? "left" : "right"}`} key={node.id}>
          <LessonNode {...node} onClick={() => onNodeClick(node)} />
          {index < nodes.length - 1 ? <LessonPathConnector status={node.status === "locked" ? "locked" : "open"} /> : null}
        </div>
      ))}
    </div>
  );
}
