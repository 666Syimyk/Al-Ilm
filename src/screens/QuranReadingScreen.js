import React, { useMemo, useState } from "react";
import { BookOpenCheck, GraduationCap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import TajweedRuleCard from "../components/TajweedRuleCard.js";
import { harakatLessons } from "../data/harakatLessons.js";
import { getTajweedGroups, tajweedLessons } from "../data/tajweedRules.js";
import { completeTajweedRule, getQuranState } from "../utils/storage.js";
import { countLessons } from "../utils/plural.js";

const e = React.createElement;

export default function QuranReadingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(() => getQuranState().tajweedProgress);
  const [activeGroup, setActiveGroup] = useState("Все");
  const groups = useMemo(() => getTajweedGroups(), []);
  const groupNames = ["Все", ...Array.from(groups.keys())];
  const lessons = activeGroup === "Все" ? tajweedLessons : tajweedLessons.filter((lesson) => lesson.category === activeGroup);
  const donePct = Math.round((progress.filter((id) => tajweedLessons.some((lesson) => lesson.id === id)).length / tajweedLessons.length) * 100);

  function markLearned(ruleId) {
    setProgress(completeTajweedRule(ruleId));
  }

  return e(
    "section",
    { className: "content-stack quran-inner-screen quran-reading-screen" },
    e(Header, {
      title: "Коран и таджвид",
      subtitle: "Буквы, огласовки, произношение и правила чтения по шагам",
      compact: true
    }),
    e(
      GlassCard,
      { className: "quran-reading-hero" },
      e("div", null, e("p", { className: "section-kicker" }, "Учебный путь"), e("h2", null, countLessons(tajweedLessons.length)), e("p", null, "Изучай объяснения и примеры, тренируйся с учителем и отмечай изученные правила.")),
      e("div", { className: "quran-reading-ring", style: { "--reading-progress": `${donePct * 3.6}deg` } }, e("strong", null, `${donePct}%`), e("span", null, "пройдено"))
    ),
    e(
      GlassCard,
      { className: "harakat-review-card" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Огласовки"), e("h2", null, "Быстрое повторение")), e(BookOpenCheck, { size: 22, "aria-hidden": true })),
      e(
        "div",
        { className: "harakat-mini-grid" },
        harakatLessons.map((lesson) => e("button", { key: lesson.id, type: "button", onClick: () => navigate(`/quran/tajweed/${lesson.id}`) }, e("strong", { dir: "rtl" }, lesson.example), e("span", null, lesson.title)))
      )
    ),
    e(
      "div",
      { className: "knowledge-section-tabs", role: "tablist", "aria-label": "Группы уроков таджвида" },
      groupNames.map((group) => e("button", { key: group, type: "button", className: activeGroup === group ? "is-active" : "", onClick: () => setActiveGroup(group) }, group))
    ),
    e(
      "div",
      { className: "tajweed-reading-grid" },
      lessons.map((lesson) => e(TajweedRuleCard, {
        key: lesson.id,
        lesson,
        learned: progress.includes(lesson.id),
        onOpen: () => navigate(`/quran/tajweed/${lesson.id}`),
        onLearned: () => markLearned(lesson.id)
      }))
    ),
    e(
      GlassCard,
      { className: "islamic-note-card" },
      e(GraduationCap, { size: 24, "aria-hidden": true }),
      e("div", null, e("strong", null, "Как заниматься"), e("p", null, "Начни с 1–2 карточек в день. Произношение и применение правил проверяй с учителем, затем повторяй на суре.")),
      e(Sparkles, { size: 24, "aria-hidden": true })
    )
  );
}
