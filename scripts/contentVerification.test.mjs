import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compareQuran, parseTanzilText } from "./compareQuranText.mjs";
import { getAyahWords, quranSurahs } from "../src/data/quranContent.js";
import { dailyDuas } from "../src/data/dailyDuas.js";
import { readingTexts } from "../src/data/readingTexts.js";
import { muslimKnowledgeSections, getKnowledgeQuiz } from "../src/data/islamicBasics.js";

const raw = readFileSync(new URL("../src/data/sources/tanzil-uthmani.txt", import.meta.url), "utf8");
const reference = parseTanzilText(raw);

test("full exact publisher copy passes without normalization", () => {
  assert.equal(compareQuran(quranSurahs, reference).exactMatches, 6236);
});
test("empty, truncated and duplicate references fail closed", () => {
  assert.throws(() => parseTanzilText(""), /Incomplete/);
  assert.throws(() => parseTanzilText(raw.split("\n").slice(0, 20).join("\n")), /Incomplete/);
  assert.throws(() => parseTanzilText(`${raw}\n${raw.split("\n")[0]}`), /Duplicate/);
  assert.throws(() => compareQuran(quranSurahs, new Map()), /Complete/);
});
test("even added whitespace is an unresolved difference", () => {
  const modified = structuredClone(quranSurahs);
  modified[0].ayahs[0].arabic += " ";
  assert.deepEqual(compareQuran(modified, reference).differences, ["1:1"]);
});
test("missing app ayahs cannot yield a pass", () => {
  const modified = structuredClone(quranSurahs);
  modified[0].ayahs.pop();
  assert.throws(() => compareQuran(modified, reference), /Incomplete/);
});
test("plausible unverified word gloss is hidden", () => {
  assert.deepEqual(getAyahWords({ words: [{ arabic: "x", reading: "x", meaning: "x" }] }), []);
});

test("Quran duas use complete matching publisher ayahs and recorded audio", () => {
  const quranDuas = dailyDuas.filter(dua => dua.isQuran);
  assert.equal(quranDuas.length, 2);
  for (const dua of quranDuas) {
    assert.equal(dua.arabic, reference.get(dua.quranRef));
    assert.equal(dua.translation, "");
    assert.match(dua.audioUrl, /audio\/quran\/alafasy\/\d{6}\.mp3$/);
  }
  assert.equal(dailyDuas.some(dua => dua.id === "leaving-home"), false);
});

test("reading-practice Quran text and audio playlists refer to the same ayahs", () => {
  for (const text of readingTexts.filter(item => item.category === "quran")) {
    const surah = quranSurahs.find(item => item.id === text.surahId);
    const ayahs = text.audioUrls.map((url, index) => {
      const number = text.firstAyah + index;
      const filename = `${String(surah.number).padStart(3, "0")}${String(number).padStart(3, "0")}.mp3`;
      assert.ok(url.endsWith(filename));
      return reference.get(`${surah.number}:${number}`);
    });
    assert.equal(text.arabic, ayahs.join("\n"));
    assert.equal(text.translation, "");
  }
  assert.equal(readingTexts.some(text => text.id === "dua-eating"), false);
});

test("prayer-guide surahs are complete exact publisher copies", async () => {
  const { prayerSurahAyahs } = await import("../src/data/prayerAyahs.js");
  for (const [surah, ayahs] of Object.entries(prayerSurahAyahs)) {
    const expected = [...reference.keys()].filter((ref) => ref.startsWith(`${surah}:`));
    assert.equal(ayahs.length, expected.length, `surah ${surah}`);
    for (const ayah of ayahs) assert.equal(ayah.arabic, reference.get(`${surah}:${ayah.number}`));
  }
});

test("knowledge quizzes have actual question-specific answers and sources", () => {
  const quizzes = muslimKnowledgeSections.flatMap(section => section.topics.map(topic => getKnowledgeQuiz(topic.title))).filter(Boolean);
  assert.equal(quizzes.length, 6);
  for (const quiz of quizzes) {
    assert.equal(new Set(quiz.options).size, 3);
    assert.ok(quiz.options.includes(quiz.answer));
    assert.ok(quiz.sourceUrl.startsWith("https://www.dar-alifta.org/"));
  }
});
