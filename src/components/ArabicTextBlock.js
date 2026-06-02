import React from "react";
import GlassCard from "./GlassCard.jsx";
import AudioButton from "./AudioButton.js";

const e = React.createElement;

function TextLine({ line, index }) {
  return e(
    "div",
    { className: "arabic-text-block__line" },
    e("div", { className: "arabic-text-block__line-head" }, e("span", null, index + 1), e(AudioButton, { text: line.arabic, audioUrl: line.audioUrl, label: "Слушать" })),
    e("p", { className: "arabic-line arabic-line--large", dir: "rtl" }, line.arabic),
    line.transliteration ? e("p", { className: "ayah-translit" }, line.transliteration) : null,
    line.translation ? e("p", { className: "ayah-translation-line" }, line.translation) : null
  );
}

export default function ArabicTextBlock({ title, subtitle, arabic, transliteration, translation, lines = [], audioUrl, className = "" }) {
  const hasLines = Array.isArray(lines) && lines.length > 0;

  return e(
    GlassCard,
    { className: `arabic-text-block ${className}`.trim() },
    title ? e("div", { className: "profile-section-head" }, e("div", null, e("h3", null, title), subtitle ? e("p", null, subtitle) : null)) : null,
    hasLines
      ? e("div", { className: "arabic-text-block__lines" }, lines.map((line, index) => e(TextLine, { key: `${line.arabic}-${index}`, line, index })))
      : e(
        React.Fragment,
        null,
        arabic ? e("p", { className: "arabic-line arabic-line--large", dir: "rtl" }, arabic) : null,
        transliteration ? e("p", { className: "ayah-translit" }, transliteration) : null,
        translation ? e("p", { className: "ayah-translation-line" }, translation) : null,
        (arabic || audioUrl) ? e("div", { className: "arabic-text-block__actions" }, e(AudioButton, { text: arabic, audioUrl, label: "Слушать" })) : null
      )
  );
}
