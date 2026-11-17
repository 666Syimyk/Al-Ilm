export function getAyahAudioUrl(surahNumber, ayahNumber) {
  return getAyahAudioSources(surahNumber, ayahNumber)[0];
}

import { recordedAyahAudio } from "../data/recordedAudioManifest.js";

export function getAyahAudioSources(surahNumber, ayahNumber) {
  const surah = String(surahNumber).padStart(3, "0");
  const ayah = String(ayahNumber).padStart(3, "0");
  const remote = `https://everyayah.com/data/Alafasy_128kbps/${surah}${ayah}.mp3`;
  const recording = recordedAyahAudio[`${Number(surahNumber)}:${Number(ayahNumber)}`];
  return recording ? [`${import.meta.env?.BASE_URL || "/"}${recording.path}`, remote] : [remote];
}

export function getRecordingSources(url) {
  const match = String(url || "").match(/(\d{3})(\d{3})\.mp3(?:\?.*)?$/);
  return match ? getAyahAudioSources(Number(match[1]), Number(match[2])) : [url];
}
