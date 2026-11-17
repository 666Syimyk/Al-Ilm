import React from "react";
import { ArrowRight, CheckCircle2, Repeat2 } from "lucide-react";
import GlassCard from "./GlassCard.jsx";

const e = React.createElement;

export default function TajweedRuleCard({ lesson, learned = false, onOpen, onLearned }) {
  const examples = lesson.examples || [];

  return e(
    GlassCard,
    { className: `tajweed-rule-card ${learned ? "is-done" : ""}`, style: { "--tajweed-color": lesson.color } },
    e(
      "div",
      { className: "tajweed-rule-card__top" },
      e("span", { className: "tajweed-rule-card__num" }, lesson.order),
      e(
        "div",
        { className: "tajweed-rule-card__intro" },
        e("h3", null, lesson.title),
        e("p", null, lesson.explanation)
      ),
      learned ? e(CheckCircle2, { size: 22, "aria-hidden": true }) : null
    ),
    e(
      "div",
      { className: "tajweed-rule-card__body" },
      e(
        "div",
        { className: "tajweed-rule-card__examples", "aria-label": "Примеры" },
        examples.slice(0, 3).map((example) => e("span", { key: example, dir: "rtl" }, example))
      ),
      e("p", { className: "content-source-note" }, lesson.practiceNote),
      e(
        "div",
        { className: "tajweed-rule-card__actions" },
        e(
          "button",
          { className: "button button--soft", type: "button", onClick: onLearned, disabled: learned },
          e(Repeat2, { size: 17, "aria-hidden": true }),
          learned ? "Выучено" : "Отметить изученным"
        ),
        e(
          "button",
          { className: "button button--soft", type: "button", onClick: onOpen },
          "Открыть",
          e(ArrowRight, { size: 17, "aria-hidden": true })
        )
      )
    )
  );
}
