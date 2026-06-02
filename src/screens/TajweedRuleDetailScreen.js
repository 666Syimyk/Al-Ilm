import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Gamepad2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ArabicTextBlock from "../components/ArabicTextBlock.js";
import AudioButton from "../components/AudioButton.js";
import PracticeQuiz from "../components/PracticeQuiz.js";
import { getTajweedLessonById } from "../data/tajweedRules.js";
import { completeTajweedRule, getQuranState } from "../utils/storage.js";

const e = React.createElement;

export default function TajweedRuleDetailScreen() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const lesson = getTajweedLessonById(ruleId);
  const [progress, setProgress] = useState(() => getQuranState().tajweedProgress);
  const learned = progress.includes(lesson.id);
  const example = lesson.examples?.[0] || "";

  function markLearned() {
    setProgress(completeTajweedRule(lesson.id));
  }

  return e(
    "section",
    { className: "content-stack tajweed-detail-screen" },
    e(
      Header,
      { title: lesson.title, subtitle: lesson.category, compact: true },
      e("button", { className: "button button--soft", type: "button", onClick: () => navigate(-1) }, e(ArrowLeft, { size: 17, "aria-hidden": true }), "Назад")
    ),
    e(
      GlassCard,
      { className: "tajweed-detail-hero", style: { "--tajweed-color": lesson.color } },
      e("span", { className: "tajweed-rule-card__num" }, lesson.order),
      e("div", null, e("p", { className: "section-kicker" }, "Простое объяснение"), e("h2", null, lesson.title), e("p", null, lesson.childExplanation), e("p", null, lesson.adultExplanation)),
      learned ? e(CheckCircle2, { size: 28, "aria-hidden": true }) : null
    ),
    e(ArabicTextBlock, {
      title: "Примеры",
      subtitle: "Слушай и повторяй без спешки",
      lines: (lesson.examples || []).map((item) => ({ arabic: item, transliteration: "", translation: lesson.title }))
    }),
    e(
      GlassCard,
      { className: "tajweed-practice-card" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Практика"), e("h2", null, "Слушать и повторить")), e(AudioButton, { text: example, label: "Слушать" })),
      e("div", { className: "tajweed-detail-actions" }, e(AudioButton, { text: example, label: "Повторить" }), e("button", { className: "button button--primary", type: "button", onClick: markLearned, disabled: learned }, e(CheckCircle2, { size: 18, "aria-hidden": true }), learned ? "Урок выучен" : "Отметить как выученный"))
    ),
    e(PracticeQuiz, { quiz: lesson.miniTest }),
    e(
      GlassCard,
      { className: "tajweed-games-card" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Игровые задания"), e("h2", null, "Закрепление")), e(Gamepad2, { size: 22, "aria-hidden": true })),
      e("div", { className: "tajweed-game-list" }, lesson.games.map((game) => e("span", { key: game }, game)))
    )
  );
}
