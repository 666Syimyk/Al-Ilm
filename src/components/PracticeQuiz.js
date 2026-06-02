import React, { useState } from "react";
import { CheckCircle2, CircleAlert } from "lucide-react";

const e = React.createElement;

export default function PracticeQuiz({ quiz, compact = false, onCorrect }) {
  const [selected, setSelected] = useState("");
  if (!quiz) return null;

  const options = quiz.options || [];
  const answer = quiz.answer || options[0];
  const answered = Boolean(selected);
  const correct = selected === answer;

  function choose(option) {
    setSelected(option);
    if (option === answer) onCorrect?.();
  }

  return e(
    "div",
    { className: `practice-quiz ${compact ? "practice-quiz--compact" : ""}` },
    e("strong", null, quiz.question),
    e(
      "div",
      { className: "practice-quiz__options" },
      options.map((option) => e(
        "button",
        {
          key: option,
          type: "button",
          className: selected === option ? (correct ? "is-correct" : "is-wrong") : "",
          onClick: () => choose(option)
        },
        option
      ))
    ),
    answered
      ? e(
        "p",
        { className: correct ? "practice-quiz__result is-correct" : "practice-quiz__result is-wrong" },
        correct ? e(CheckCircle2, { size: 16, "aria-hidden": true }) : e(CircleAlert, { size: 16, "aria-hidden": true }),
        correct ? "Верно" : `Правильный ответ: ${answer}`
      )
      : null
  );
}
