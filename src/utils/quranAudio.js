export function getAyahAudioUrl(surahNumber, ayahNumber) {
  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");
  return `https://everyayah.com/data/Alafasy_128kbps/${surah}${ayah}.mp3`;
}
