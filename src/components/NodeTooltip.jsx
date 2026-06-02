export default function NodeTooltip({ status, points = 0, coins = 0 }) {
  const statusText = {
    completed: "Можно повторить",
    current: "Текущий шаг",
    locked: "Сначала пройди предыдущий шаг",
    bonus: "Дополнительное задание"
  }[status] || "Шаг пути";

  return (
    <span className="node-tooltip" role="tooltip">
      <strong>{statusText}</strong>
      <small>
        +{points} очков{coins ? `, +${coins} монет` : ""}
      </small>
    </span>
  );
}
