import React from "react";
import { ArrowRight, CheckCircle2, Repeat2 } from "lucide-react";
import GlassCard from "./GlassCard.jsx";
import AudioButton from "./AudioButton.js";
import PracticeQuiz from "./PracticeQuiz.js";

const e = React.createElement;

export default function TajweedRuleCard({ lesson, learned = false, onOpen, onLearned }) {
  const firstExample = lesson.examples?.[0] || "";

  return e(
    GlassCard,
    { className: `tajweed-rule-card ${learned ? "is-done" : ""}`, style: { "--tajweed-color": lesson.color } },
    e(
      "div",
      { className: "tajweed-rule-card__top" },
      e("span", { className: "tajweed-rule-card__num" }, lesson.order),
      e("div", null, e("h3", null, lesson.title), e("p", null, lesson.explanation)),
      learned ? e(CheckCircle2, { size: 22, "aria-hidden": true }) : null
    ),
    e(
      "div",
      { className: "tajweed-rule-card__examples" },
      (lesson.examples || []).slice(0, 3).map((example) => e("span", { key: example, dir: "rtl" }, example))
    ),
    e(PracticeQuiz, { quiz: lesson.miniTest, compact: true }),
    e(
      "div",
      { className: "tajweed-rule-card__actions" },
      e(AudioButton, { text: firstExample, label: "Слушать" }),
      e(AudioButton, { text: firstExample, label: "Повторить", activeLabel: "Повтор..." , className: "button button--soft" }),
      e(
        "button",
        { className: "button button--soft", type: "button", onClick: onLearned, disabled: learned },
        e(Repeat2, { size: 17, "aria-hidden": true }),
        learned ? "Выучено" : "Выучил"
      ),
      e(
        "button",
        { className: "button button--soft", type: "button", onClick: onOpen },
        "Открыть",
        e(ArrowRight, { size: 17, "aria-hidden": true })
      )
    )
  );
}
