import React, { useState } from "react";
import { ArrowLeft, BookOpenCheck, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import IslamicRuleCard from "../components/IslamicRuleCard.js";
import { islamicRulings } from "../data/islamicRulings.js";

const e = React.createElement;
const progressKey = "islamicRulingsProgress";

function readProgress() {
  try {
    return JSON.parse(window.localStorage.getItem(progressKey) || "[]");
  } catch {
    return [];
  }
}

function writeProgress(list) {
  try {
    window.localStorage.setItem(progressKey, JSON.stringify(list));
  } catch {
    // Keep the lesson usable when storage is blocked.
  }
}

export default function IslamicRulingsScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("child");
  const [learned, setLearned] = useState(readProgress);
  const doneCount = learned.length;

  function markLearned(ruleId) {
    setLearned((current) => {
      const next = current.includes(ruleId) ? current : [...current, ruleId];
      writeProgress(next);
      return next;
    });
  }

  return e(
    "section",
    { className: "content-stack islamic-learning-screen" },
    e(
      Header,
      {
        title: "Основы Ислама",
        subtitle: "Фарз, важиб, сунна и другие важные понятия простыми словами",
        compact: true
      },
      e(
        "div",
        { className: "islamic-screen-actions" },
        e("button", { className: "button button--soft", type: "button", onClick: () => navigate("/islamic-basics") }, e(ArrowLeft, { size: 17, "aria-hidden": true }), "К разделу"),
        e("button", { className: "button button--soft", type: "button", onClick: () => setMode(mode === "child" ? "adult" : "child") }, mode === "child" ? "Для взрослых" : "Для детей")
      )
    ),
    e(
      GlassCard,
      { className: "islamic-overview-card" },
      e("div", null, e("p", { className: "section-kicker" }, "Правильный порядок"), e("h2", null, "От обязательного к запретному")),
      e("div", { className: "islamic-ruling-chain" }, islamicRulings.map((rule) => e("span", { key: rule.id, style: { "--rule-color": rule.color } }, rule.title))),
      e("div", { className: "islamic-progress-line" }, e("span", null, `${doneCount}/${islamicRulings.length} тем`), e("div", null, e("i", { style: { width: `${Math.round((doneCount / islamicRulings.length) * 100)}%` } })))
    ),
    e(
      "div",
      { className: "islamic-rule-grid" },
      islamicRulings.map((rule) => e(IslamicRuleCard, {
        key: rule.id,
        rule,
        mode,
        learned: learned.includes(rule.id),
        onLearned: () => markLearned(rule.id)
      }))
    ),
    e(
      GlassCard,
      { className: "islamic-note-card" },
      e(BookOpenCheck, { size: 24, "aria-hidden": true }),
      e("div", null, e("strong", null, "Мягкое напоминание"), e("p", null, "Этот раздел даёт учебное, простое объяснение. Для подробных вопросов всегда лучше обращаться к надёжному учителю.")),
      e(Layers, { size: 24, "aria-hidden": true })
    )
  );
}
