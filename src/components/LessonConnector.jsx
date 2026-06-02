export default function LessonConnector({ status = "locked" }) {
  return <span className={`lesson-connector lesson-connector--${status}`} aria-hidden="true" />;
}
