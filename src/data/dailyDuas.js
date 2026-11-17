export const dailyDuas = [
  {
    id: "before-eating",
    title: "Перед едой",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Бисмиллях",
    translation: "С именем Аллаха.",
    hint: "Скажи перед первым кусочком и ешь правой рукой.",
    source: "Сахих аль-Бухари №5376: упоминание имени Аллаха перед едой и еда правой рукой.",
    verified: false,
    needsReview: false
  },
  {
    id: "after-eating",
    title: "После еды",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Аль-хамду лиллях",
    translation: "Хвала Аллаху.",
    hint: "Поблагодари Аллаха за еду и здоровье.",
    source: "Начало восхваления после еды. Сахих аль-Бухари №5458; здесь показана только краткая фраза.",
    verified: false,
    needsReview: true
  },
  {
    id: "before-sleep",
    title: "Перед сном",
    arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    transliteration: "Аллахумма бисмика амуту ва ахья",
    translation: "С Твоим именем, о Аллах, я умираю и оживаю.",
    hint: "Прочитай спокойно перед сном.",
    source: "Сахих аль-Бухари №6314. Арабская фраза сверена со страницей источника; русский учебный текст требует редакционной проверки.",
    verified: false,
    needsReview: false
  },
  {
    id: "after-waking",
    title: "После пробуждения",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا",
    transliteration: "Аль-хамду лилляхиллязи ахьяна",
    translation: "Хвала Аллаху, Который оживил нас.",
    hint: "Начни день с благодарности.",
    source: "Начало фразы после пробуждения из Сахих аль-Бухари №6314. Полная фраза приведена по ссылке на источник.",
    verified: false,
    needsReview: true
  },
  {
    id: "leaving-home",
    title: "Перед выходом из дома",
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ",
    transliteration: "Бисмиллях, таваккальту аляллах",
    translation: "С именем Аллаха, я полагаюсь на Аллаха.",
    hint: "Попроси защиты и хорошего пути.",
    source: "Тирмизи №3426. На странице источника приведены разные оценки передачи; приложение не выносит собственного решения о её достоверности.",
    verified: false,
    needsReview: true
  },
  {
    id: "parents",
    title: "За родителей",
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Раббирхамхума кама раббаяни сагира",
    translation: "Господь мой, помилуй их, как они растили меня маленьким.",
    hint: "Делай это дуа за маму и папу.",
    source: "Коран 17:24 (Сура Аль-Исра, аят 24). Это аят Корана — не дуа из хадиса.",
    verified: false,
    needsReview: false
  },
  {
    id: "study",
    title: "Перед учёбой",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Рабби зидни ильма",
    translation: "Господь мой, прибавь мне знания.",
    hint: "Скажи перед уроком и старайся внимательно.",
    source: "Коран 20:114 (Сура Та-Ха, аят 114). Это аят Корана — не дуа из хадиса.",
    verified: false,
    needsReview: false
  }
];

export function getDailyDuaById(id) {
  return dailyDuas.find((dua) => dua.id === id) || dailyDuas[0];
}

// Quran excerpts are shown as complete, publisher-sourced ayahs so the visible
// text exactly matches the recorded full-ayah audio (never a synthetic voice).
import { getAyahByNumber } from "./quranContent.js";
import { getAyahAudioUrl } from "../utils/quranAudio.js";

const duaReferences = {
  "before-eating": "https://sunnah.com/bukhari:5376",
  "after-eating": "https://sunnah.com/bukhari:5458",
  "before-sleep": "https://sunnah.com/bukhari:6314",
  "after-waking": "https://sunnah.com/bukhari:6314",
  "leaving-home": "https://sunnah.com/tirmidhi:3426"
};

for (const dua of dailyDuas) {
  dua.verified = false;
  dua.needsReview = true;
  dua.sourceUrl = duaReferences[dua.id] || "https://tanzil.net/";
  dua.sourceNote = "Учебная запись; перевод и транслитерация требуют проверки учителем.";
  if (["after-eating", "after-waking", "leaving-home"].includes(dua.id)) {
    dua.sourceNote = "Показана сокращённая фраза, а не полный текст дуа. Перевод и транслитерация требуют проверки.";
  }
  const ref = dua.id === "parents" ? [17, 24] : dua.id === "study" ? [20, 114] : null;
  if (ref) {
    const ayah = getAyahByNumber(String(ref[0]), ref[1]);
    dua.arabic = ayah.arabic;
    dua.transliteration = "";
    dua.translation = "";
    dua.quranRef = `${ref[0]}:${ref[1]}`;
    dua.isQuran = true;
    dua.source = `Коран ${dua.quranRef} · Tanzil Project, Uthmani 1.1`;
    dua.sourceUrl = `https://tanzil.net/#${dua.quranRef}`;
    dua.sourceNote = "Полный аят из издания Tanzil; запись Аль-Афаси с EveryAyah.";
    dua.audioUrl = getAyahAudioUrl(...ref);
    dua.audioLabel = "Слушать полный аят";
    dua.audioNote = `Полный аят ${dua.quranRef}; просьба содержится в его тексте.`;
  }
}

// Do not offer an unreviewed, shortened narration with disputed grading as a
// memorization target. The original record remains above for editorial recovery.
const unreviewedDuaIndex = dailyDuas.findIndex((dua) => dua.id === "leaving-home");
if (unreviewedDuaIndex !== -1) dailyDuas.splice(unreviewedDuaIndex, 1);
