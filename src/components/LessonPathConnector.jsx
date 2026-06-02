export default function LessonPathConnector({ status = "locked" }) {
  return <span className={`lesson-path-connector lesson-path-connector--${status}`} aria-hidden="true" />;
}
