export const surahRevealPlaces = {
  1: "Мекка",
  2: "Медина", 3: "Медина", 4: "Медина", 5: "Медина",
  6: "Мекка", 7: "Мекка", 8: "Медина", 9: "Медина",
  10: "Мекка", 11: "Мекка", 12: "Мекка", 13: "Медина", 14: "Мекка",
  15: "Мекка", 16: "Мекка", 17: "Мекка", 18: "Мекка", 19: "Мекка",
  20: "Мекка", 21: "Мекка", 22: "Медина", 23: "Мекка", 24: "Медина",
  25: "Мекка", 26: "Мекка", 27: "Мекка", 28: "Мекка", 29: "Мекка",
  30: "Мекка", 31: "Мекка", 32: "Мекка", 33: "Медина", 34: "Мекка",
  35: "Мекка", 36: "Мекка", 37: "Мекка", 38: "Мекка", 39: "Мекка",
  40: "Мекка", 41: "Мекка", 42: "Мекка", 43: "Мекка", 44: "Мекка",
  45: "Мекка", 46: "Мекка", 47: "Медина", 48: "Медина", 49: "Медина",
  50: "Мекка", 51: "Мекка", 52: "Мекка", 53: "Мекка", 54: "Мекка",
  55: "Медина", 56: "Мекка", 57: "Медина", 58: "Медина", 59: "Медина",
  60: "Медина", 61: "Медина", 62: "Медина", 63: "Медина", 64: "Медина",
  65: "Медина", 66: "Медина", 67: "Мекка", 68: "Мекка", 69: "Мекка",
  70: "Мекка", 71: "Мекка", 72: "Мекка", 73: "Мекка", 74: "Мекка",
  75: "Мекка", 76: "Медина", 77: "Мекка",
  78: "Мекка", 79: "Мекка", 80: "Мекка", 81: "Мекка", 82: "Мекка",
  83: "Мекка", 84: "Мекка", 85: "Мекка", 86: "Мекка", 87: "Мекка",
  88: "Мекка", 89: "Мекка", 90: "Мекка", 91: "Мекка", 92: "Мекка",
  93: "Мекка", 94: "Мекка", 95: "Мекка", 96: "Мекка", 97: "Мекка",
  98: "Медина", 99: "Медина", 100: "Мекка", 101: "Мекка",
  102: "Мекка", 103: "Мекка", 104: "Мекка", 105: "Мекка", 106: "Мекка",
  107: "Мекка", 108: "Мекка", 109: "Мекка", 110: "Медина", 111: "Мекка",
  112: "Мекка", 113: "Мекка", 114: "Мекка"
};

export const beginnerSurahNumbers = new Set([1, 114, 113, 112, 111, 110, 109, 108, 107]);

export const juzStarts = [
  { juz: 1, surah: 1, ayah: 1 },
  { juz: 2, surah: 2, ayah: 142 },
  { juz: 3, surah: 2, ayah: 253 },
  { juz: 4, surah: 3, ayah: 93 },
  { juz: 5, surah: 4, ayah: 24 },
  { juz: 6, surah: 4, ayah: 148 },
  { juz: 7, surah: 5, ayah: 82 },
  { juz: 8, surah: 6, ayah: 111 },
  { juz: 9, surah: 7, ayah: 88 },
  { juz: 10, surah: 8, ayah: 41 },
  { juz: 11, surah: 9, ayah: 93 },
  { juz: 12, surah: 11, ayah: 6 },
  { juz: 13, surah: 12, ayah: 53 },
  { juz: 14, surah: 15, ayah: 1 },
  { juz: 15, surah: 17, ayah: 1 },
  { juz: 16, surah: 18, ayah: 75 },
  { juz: 17, surah: 21, ayah: 1 },
  { juz: 18, surah: 23, ayah: 1 },
  { juz: 19, surah: 25, ayah: 21 },
  { juz: 20, surah: 27, ayah: 56 },
  { juz: 21, surah: 29, ayah: 46 },
  { juz: 22, surah: 33, ayah: 31 },
  { juz: 23, surah: 36, ayah: 28 },
  { juz: 24, surah: 39, ayah: 32 },
  { juz: 25, surah: 41, ayah: 47 },
  { juz: 26, surah: 46, ayah: 1 },
  { juz: 27, surah: 51, ayah: 31 },
  { juz: 28, surah: 58, ayah: 1 },
  { juz: 29, surah: 67, ayah: 1 },
  { juz: 30, surah: 78, ayah: 1 }
];

export function getSurahReveal(surahNumber) {
  return surahRevealPlaces[surahNumber] || "Мекка";
}

export function getJuzForAyah(surahNumber, ayahNumber) {
  let current = 1;
  for (const start of juzStarts) {
    if (surahNumber > start.surah || (surahNumber === start.surah && ayahNumber >= start.ayah)) {
      current = start.juz;
    } else {
      break;
    }
  }
  return current;
}

export function getJuzRanges(surahs) {
  return juzStarts.map((start, index) => {
    const next = juzStarts[index + 1];
    const startSurah = surahs.find((surah) => surah.number === start.surah);
    let end = next
      ? { surah: next.surah, ayah: next.ayah - 1 }
      : { surah: 114, ayah: surahs.find((surah) => surah.number === 114)?.ayahs.length || 6 };

    if (end.ayah < 1) {
      const previousSurah = surahs.find((surah) => surah.number === end.surah - 1);
      end = { surah: end.surah - 1, ayah: previousSurah?.ayahs.length || 1 };
    }

    const endSurah = surahs.find((surah) => surah.number === end.surah);

    const ayahCount = surahs.reduce((count, surah) => {
      if (surah.number < start.surah || surah.number > end.surah) return count;
      const from = surah.number === start.surah ? start.ayah : 1;
      const to = surah.number === end.surah ? end.ayah : surah.ayahs.length;
      return count + Math.max(0, to - from + 1);
    }, 0);

    return {
      juz: start.juz,
      start,
      end,
      ayahCount,
      startSurah,
      endSurah
    };
  });
}
