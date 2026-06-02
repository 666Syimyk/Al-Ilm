import React from "react";
import { Star } from "lucide-react";

const e = React.createElement;

export default function ProgressStars({ value = 0, total = 5, label = "Прогресс" }) {
  const safeTotal = Math.max(1, total);
  const filled = Math.max(0, Math.min(safeTotal, value));

  return e(
    "div",
    { className: "progress-stars", "aria-label": `${label}: ${filled} из ${safeTotal}` },
    Array.from({ length: safeTotal }, (_, index) => e(Star, {
      key: index,
      size: 17,
      fill: index < filled ? "currentColor" : "none",
      "aria-hidden": true
    })),
    e("span", null, `${filled}/${safeTotal}`)
  );
}
