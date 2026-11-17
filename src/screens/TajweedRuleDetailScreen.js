import React, { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ArabicTextBlock from "../components/ArabicTextBlock.js";
import { getTajweedLessonById } from "../data/tajweedRules.js";
import { completeTajweedRule, getQuranState } from "../utils/storage.js";
import { goBack } from "../utils/navigation.js";

const e = React.createElement;

export default function TajweedRuleDetailScreen() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const lesson = getTajweedLessonById(ruleId);
  const [progress, setProgress] = useState(() => getQuranState().tajweedProgress);
  const learned = progress.includes(lesson.id);

  function markLearned() {
    setProgress(completeTajweedRule(lesson.id));
  }

  return e(
    "section",
    { className: "content-stack tajweed-detail-screen" },
    e(
      Header,
      { title: lesson.title, subtitle: lesson.category, compact: true },
      e("button", { className: "button button--soft", type: "button", onClick: () => goBack(navigate, "/quran/tajweed") }, e(ArrowLeft, { size: 17, "aria-hidden": true }), "Назад")
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
      subtitle: "Прочитай примеры вместе с учителем",
      showAudio: false,
      lines: (lesson.examples || []).map((item) => ({ arabic: item, transliteration: "", translation: lesson.title }))
    }),
    e(
      GlassCard,
      { className: "tajweed-practice-card" },
      e("h2", null, "Закрепи с учителем"),
      e("p", { className: "content-source-note" }, lesson.practiceNote),
      e("p", null, "Найди пример правила, прочитай его вслух и попроси учителя послушать. Отметка ниже сохраняет твоё занятие, а не оценку произношения."),
      e("button", { className: "button button--primary", type: "button", onClick: markLearned, disabled: learned }, e(CheckCircle2, { size: 18, "aria-hidden": true }), learned ? "Изучено" : "Отметить изученное")
    )
  );
}
