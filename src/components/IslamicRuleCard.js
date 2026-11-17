import React from "react";
import { CheckCircle2 } from "lucide-react";
import GlassCard from "./GlassCard.jsx";
import PracticeQuiz from "./PracticeQuiz.js";
import ProgressStars from "./ProgressStars.js";

const e = React.createElement;

export default function IslamicRuleCard({ rule, mode = "child", learned = false, onLearned }) {
  const explanation = mode === "adult" ? rule.adultExplanation : rule.childExplanation;

  return e(
    GlassCard,
    { className: `islamic-rule-card ${learned ? "is-learned" : ""}`, style: { "--rule-color": rule.color } },
    e(
      "div",
      { className: "islamic-rule-card__head" },
      e("span", { className: "islamic-rule-card__order" }, rule.order),
      e("div", null, e("h3", null, rule.title), e("p", null, explanation)),
      e(ProgressStars, { value: learned ? 3 : 1, total: 3, label: rule.title })
    ),
    rule.examples.length > 0 ? e(
      "div",
      { className: "islamic-rule-card__examples" },
      e("strong", null, "Примеры"),
      rule.examples.map((example) => e("span", { key: example }, example))
    ) : null,
    e("a", { href: rule.sourceUrl, target: "_blank", rel: "noopener noreferrer", className: "content-source-note" }, "Источник определения: Dar al-Ifta"),
    e(PracticeQuiz, { quiz: rule.miniTest, compact: true }),
    e(
      "button",
      { className: "button button--soft", type: "button", onClick: onLearned, disabled: learned },
      e(CheckCircle2, { size: 18, "aria-hidden": true }),
      learned ? "Изучено" : "Отметить изученным"
    )
  );
}
