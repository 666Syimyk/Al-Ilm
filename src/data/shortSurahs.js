import { quranSurahs } from "./quranContent.js";
import { getAyahAudioUrl } from "../utils/quranAudio.js";

export const shortSurahIds = [
  "al-fatihah",
  "al-ikhlas",
  "al-falaq",
  "an-nas",
  "al-kawthar",
  "al-asr",
  "al-kafirun"
];

function transliterationFromWords(ayah) {
  if (!ayah?.words?.length) return "";
  return ayah.words.map((word) => word.reading || word.arabic).join(" - ");
}

export const shortSurahs = shortSurahIds
  .map((id) => quranSurahs.find((surah) => surah.id === id))
  .filter(Boolean)
  .map((surah) => ({
    id: surah.id,
    number: surah.number,
    title: surah.title,
    arabicTitle: surah.arabicTitle,
    translation: surah.translation,
    lines: surah.ayahs.map((ayah) => ({
      number: ayah.number,
      arabic: ayah.arabic,
      transliteration: transliterationFromWords(ayah),
      translation: ayah.translation,
      audioUrl: getAyahAudioUrl(surah.number, ayah.number)
    })),
    miniTest: {
      question: `Как лучше учить суру ${surah.title}?`,
      options: ["по строкам и с повторением", "один раз быстро", "без прослушивания"],
      answer: "по строкам и с повторением"
    }
  }));

export function getShortSurahById(id) {
  return shortSurahs.find((surah) => surah.id === id) || shortSurahs[0];
}
