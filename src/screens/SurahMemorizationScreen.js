import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ListChecks, Repeat2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import GlassCard from "../components/GlassCard.jsx";
import ArabicTextBlock from "../components/ArabicTextBlock.js";
import AudioButton from "../components/AudioButton.js";
import PracticeQuiz from "../components/PracticeQuiz.js";
import { dailyDuas } from "../data/dailyDuas.js";
import { shortSurahs } from "../data/shortSurahs.js";
import { getQuranTracking, getStoredJson, setStoredJson, markAyahMemorized, memorizeSurah } from "../utils/storage.js";
import { quranTextSource, translationSource } from "../data/quranContent.js";
import { goBack } from "../utils/navigation.js";

const e = React.createElement;
const progressKey = "namazSurahMemorization";

function readProgress() {
  return [...new Set([...getStoredJson(progressKey, []), ...getQuranTracking().memorizedAyahs])];
}

function writeProgress(list) {
  setStoredJson(progressKey, list);
}

export default function SurahMemorizationScreen() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(shortSurahs[0]?.id || "");
  const [lineIndex, setLineIndex] = useState(0);
  const [learned, setLearned] = useState(readProgress);
  const activeSurah = useMemo(() => shortSurahs.find((surah) => surah.id === activeId) || shortSurahs[0], [activeId]);
  const activeLine = activeSurah?.lines?.[lineIndex] || activeSurah?.lines?.[0];
  const lineKey = `${activeSurah?.id}:${activeLine?.number}`;
  const learnedCount = learned.filter((item) => item.startsWith(`${activeSurah?.id}:`)).length;
  const progressPct = activeSurah?.lines?.length ? Math.round((learnedCount / activeSurah.lines.length) * 100) : 0;

  function selectSurah(surahId) {
    setActiveId(surahId);
    setLineIndex(0);
  }

  function markLine() {
    markAyahMemorized(lineKey);
    setLearned((current) => {
      const next = current.includes(lineKey) ? current : [...current, lineKey];
      writeProgress(next);
      if (activeSurah.lines.every((line) => next.includes(`${activeSurah.id}:${line.number}`))) memorizeSurah(activeSurah.id);
      return next;
    });
  }

  return e(
    "section",
    { className: "content-stack surah-memorization-screen" },
    e(
      Header,
      { title: "Суры и дуа для намаза", subtitle: "Арабский текст, транскрипция и заучивание по строкам", compact: true },
      e("button", { className: "button button--soft", type: "button", onClick: () => goBack(navigate, "/namaz") }, e(ArrowLeft, { size: 17, "aria-hidden": true }), "Назад")
    ),
    e(
      GlassCard,
      { className: "memorize-surah-picker" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Суры для намаза"), e("h2", null, "Выбери суру")), e(ListChecks, { size: 22, "aria-hidden": true })),
      e(
        "div",
        { className: "surah-memory-tabs" },
        shortSurahs.map((surah) => e("button", { key: surah.id, className: activeSurah?.id === surah.id ? "is-active" : "", type: "button", onClick: () => selectSurah(surah.id) }, surah.title))
      )
    ),
    activeSurah ? e(
      GlassCard,
      { className: "surah-memory-progress" },
      e("div", null, e("p", { className: "section-kicker" }, activeSurah.arabicTitle), e("h2", null, activeSurah.title), e("p", null, activeSurah.translation)),
      e("div", { className: "islamic-progress-line" }, e("span", null, `${learnedCount}/${activeSurah.lines.length} строк`), e("div", null, e("i", { style: { width: `${progressPct}%` } })))
    ) : null,
    activeLine ? e(ArabicTextBlock, {
      title: `Строка ${activeLine.number}`,
      subtitle: "Слушай, повторяй, а потом прочитай строку по памяти",
      arabic: activeLine.arabic,
      transliteration: activeLine.transliteration,
      translation: activeLine.translation,
      audioUrl: activeLine.audioUrl,
      isQuran: true
    }) : null,
    e(
      GlassCard,
      { className: "surah-memory-actions" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Заучивание"), e("h2", null, "Повторение по строкам")), e(Repeat2, { size: 22, "aria-hidden": true })),
      e(
        "div",
        { className: "tajweed-detail-actions" },
        e("button", { className: "button button--soft", type: "button", onClick: () => setLineIndex(Math.max(0, lineIndex - 1)), disabled: lineIndex <= 0 }, "Назад"),
        activeLine ? e(AudioButton, { audioUrl: activeLine.audioUrl, label: "Слушать" }) : null,
        activeLine ? e(AudioButton, { audioUrl: activeLine.audioUrl, label: "Повторить" }) : null,
        e("button", { className: "button button--primary", type: "button", onClick: markLine, disabled: learned.includes(lineKey) }, e(CheckCircle2, { size: 18, "aria-hidden": true }), learned.includes(lineKey) ? "Выучено" : "Знаю наизусть"),
        e("button", { className: "button button--soft", type: "button", onClick: () => setLineIndex(Math.min((activeSurah?.lines.length || 1) - 1, lineIndex + 1)), disabled: lineIndex >= (activeSurah?.lines.length || 1) - 1 }, "Дальше")
      ),
      activeSurah?.miniTest ? e(PracticeQuiz, { key: activeSurah.id, quiz: activeSurah.miniTest, compact: true }) : null
    ),
    e(
      "section",
      { className: "daily-dua-card" },
      e("div", { className: "profile-section-head" }, e("div", null, e("p", { className: "section-kicker" }, "Дуа на каждый день"), e("h2", null, "Короткие дуа для повторения"))),
      e("div", { className: "daily-dua-grid" }, dailyDuas.map((dua) => e(ArabicTextBlock, { ...dua, key: dua.id, subtitle: dua.hint })))
    ),
    e("p", { className: "content-source-note" }, translationSource.note, " ", e("a", { href: quranTextSource.url, target: "_blank", rel: "noreferrer" }, "Арабский текст: Tanzil"))
  );
}
