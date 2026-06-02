import React, { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Landmark, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import PracticeQuiz from "../components/PracticeQuiz.js";
import { muslimKnowledgeSections } from "../data/islamicBasics.js";
import { islamicRulings } from "../data/islamicRulings.js";

const e = React.createElement;

function TopicCard({ topic, mode }) {
  const isString = typeof topic === "string";
  const title = isString ? topic : topic.title;
  const child = isString ? `${topic} можно учить постепенно.` : topic.child;
  const adult = isString ? `${topic} полезно разобрать со смыслом и примерами.` : topic.adult;
  const examples = isString ? ["слушай", "повторяй", "применяй"] : topic.examples;
  const quiz = isString ? null : { question: topic.quiz, options: ["учить спокойно", "пропустить", "читать не глядя"], answer: "учить спокойно" };

  return e(
    "article",
    { className: "knowledge-topic-card" },
    e("h3", null, title),
    e("p", null, mode === "adult" ? adult : child),
    e("div", { className: "knowledge-topic-card__examples" }, (examples || []).map((item) => e("span", { key: item }, item))),
    quiz ? e(PracticeQuiz, { quiz, compact: true }) : null
  );
}

function SectionPanel({ section, mode }) {
  return e(
    GlassCard,
    { className: "knowledge-section-panel" },
    e(
      "div",
      { className: "profile-section-head" },
      e("div", null, e("p", { className: "section-kicker" }, "Что должен знать мусульманин"), e("h2", null, section.title), e("p", null, mode === "adult" ? section.adultIntro : section.childIntro)),
      e(CheckCircle2, { size: 22, "aria-hidden": true })
    ),
    e("div", { className: "knowledge-topic-grid" }, section.topics.map((topic) => e(TopicCard, { key: typeof topic === "string" ? topic : topic.title, topic, mode })))
  );
}

export default function IslamicBasicsScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("child");
  const [activeSectionId, setActiveSectionId] = useState(muslimKnowledgeSections[0].id);
  const activeSection = useMemo(
    () => muslimKnowledgeSections.find((section) => section.id === activeSectionId) || muslimKnowledgeSections[0],
    [activeSectionId]
  );

  return e(
    "section",
    { className: "content-stack islamic-learning-screen" },
    e(
      Header,
      {
        title: "Исламские знания",
        subtitle: "Основы веры, поклонения, очищения, адаба и добрых привычек",
        compact: true
      },
      e(
        "div",
        { className: "islamic-screen-actions" },
        e("button", { className: "button button--soft", type: "button", onClick: () => setMode(mode === "child" ? "adult" : "child") }, mode === "child" ? "Взрослый текст" : "Детский текст"),
        e("button", { className: "button button--primary", type: "button", onClick: () => navigate("/islamic-basics/rulings") }, "Основы Ислама", e(ArrowRight, { size: 17, "aria-hidden": true }))
      )
    ),
    e(
      GlassCard,
      { className: "islamic-hero-card" },
      e("div", null, e("p", { className: "section-kicker" }, mode === "child" ? "Ахмад и Амина учат по шагам" : "Спокойный учебный режим"), e("h2", null, "Сначала основы, затем практика"), e("p", null, "Раздел помогает ребёнку и взрослому увидеть главные темы без сложных формулировок.")),
      e(
        "div",
        { className: "islamic-hero-stats" },
        e("span", null, e(BookOpen, { size: 18, "aria-hidden": true }), muslimKnowledgeSections.length, " разделов"),
        e("span", null, e(GraduationCap, { size: 18, "aria-hidden": true }), islamicRulings.length, " правил"),
        e("span", null, e(Sparkles, { size: 18, "aria-hidden": true }), "мини-тесты")
      )
    ),
    e(
      GlassCard,
      { className: "islamic-rulings-preview" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Основы Ислама"), e("h2", null, "Фарз → Важиб → Сунна → Мустахаб → Мубах → Макрух → Харам")), e(Landmark, { size: 22, "aria-hidden": true })),
      e("div", { className: "islamic-ruling-chain" }, islamicRulings.map((rule) => e("button", { key: rule.id, type: "button", style: { "--rule-color": rule.color }, onClick: () => navigate("/islamic-basics/rulings") }, rule.title)))
    ),
    e(
      "div",
      { className: "knowledge-section-tabs", role: "tablist", "aria-label": "Разделы исламских знаний" },
      muslimKnowledgeSections.map((section) => e(
        "button",
        { key: section.id, className: activeSection.id === section.id ? "is-active" : "", type: "button", onClick: () => setActiveSectionId(section.id) },
        section.title
      ))
    ),
    e(SectionPanel, { section: activeSection, mode })
  );
}
