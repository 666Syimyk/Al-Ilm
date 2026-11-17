import { getProfilePreferences } from "./storage.js";

const cachedAudio = new Map();
const activeAudio = new Set();
const audioRuns = new WeakMap();
let speechRun = null;

function hasSpeech() {
  return typeof window !== "undefined" && Boolean(window.speechSynthesis);
}

function isUsableAudioUrl(url) {
  return typeof url === "string" && url.trim() && !["undefined", "null"].includes(url.trim());
}

export function getPreferredVoice(lang = "ar") {
  if (!hasSpeech()) return null;
  const normalized = lang.toLowerCase();
  const base = normalized.split("-")[0];
  const voices = (window.speechSynthesis.getVoices?.() || [])
    .filter((voice) => voice.lang?.toLowerCase().split("-")[0] === base);
  return voices.find((voice) => voice.lang.toLowerCase() === normalized)
    || voices.find((voice) => /google|microsoft|natural|online/i.test(voice.name))
    || voices[0] || null;
}

export function getCachedAudio(url) {
  if (typeof Audio === "undefined" || !isUsableAudioUrl(url)) return null;
  const src = url.trim();
  if (!cachedAudio.has(src)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    cachedAudio.set(src, audio);
  }
  return cachedAudio.get(src);
}

export function stopAudioElement(audio, { clearHandlers = true } = {}) {
  if (!audio) return;
  const run = audioRuns.get(audio);
  if (run && !run.finished) {
    run.finished = true;
    run.cancelled = true;
    run.onStop?.();
  }
  audioRuns.delete(audio);
  activeAudio.delete(audio);
  if (clearHandlers) {
    audio.onended = null;
    audio.onerror = null;
    audio.onplaying = null;
  }
  try { audio.pause(); audio.currentTime = 0; } catch { /* Some streams cannot seek. */ }
}

export function stopSpeech() {
  const run = speechRun;
  speechRun = null;
  if (run) {
    clearTimeout(run.timer);
    run.finished = true;
    run.utterance.onstart = null;
    run.utterance.onend = null;
    run.utterance.onerror = null;
    run.onStop?.();
  }
  if (hasSpeech()) window.speechSynthesis.cancel();
}

export function stopAllAudio() {
  stopSpeech();
  Array.from(activeAudio).forEach((audio) => stopAudioElement(audio));
}

if (typeof window !== "undefined") {
  window.addEventListener?.("profilePreferencesChange", () => {
    if (!getProfilePreferences().soundEnabled) stopAllAudio();
  });
}

// onReady supplies the element synchronously, so a pending play can be stopped.
// A media error and a rejected play() promise settle one run only once.
export function playCachedAudio(url, {
  playbackRate = 1, cancelCurrent = true, onReady, onPlaying, onEnded, onError, onStop
} = {}) {
  if (cancelCurrent) stopAllAudio();
  else stopSpeech();
  if (!getProfilePreferences().soundEnabled) {
    onError?.(new Error("Звук выключен в настройках профиля."));
    return Promise.resolve(null);
  }
  const audio = getCachedAudio(url);
  if (!audio) {
    onError?.(new Error("Missing audio source"));
    return Promise.resolve(null);
  }
  stopAudioElement(audio);
  const run = { finished: false, cancelled: false, onStop };
  audioRuns.set(audio, run);
  const current = () => audioRuns.get(audio) === run && !run.finished;
  const finish = (callback, value) => {
    if (!current()) return;
    run.finished = true;
    activeAudio.delete(audio);
    audioRuns.delete(audio);
    audio.onended = null;
    audio.onerror = null;
    callback?.(value);
  };
  audio.onended = () => finish(onEnded);
  audio.onerror = (event) => finish(onError, event);
  try { audio.playbackRate = playbackRate; audio.currentTime = 0; } catch { /* Metadata may still load. */ }
  activeAudio.add(audio);
  onReady?.(audio);
  if (!current()) return Promise.resolve(null);
  try {
    return Promise.resolve(audio.play()).then(() => {
      if (!current()) return null;
      onPlaying?.(audio);
      return audio;
    }, (error) => {
      if (run.cancelled || audioRuns.get(audio) !== run) return null;
      finish(onError, error);
      return null;
    });
  } catch (error) {
    finish(onError, error);
    return Promise.resolve(null);
  }
}

// Multiple sources are alternatives for one recording, never a playlist.
export function playAudioSources(sources, options = {}) {
  const urls = [...new Set((Array.isArray(sources) ? sources : [sources]).filter(isUsableAudioUrl))];
  let stopped = false;
  let index = 0;
  let audio = null;
  let lastError;
  const stop = () => { stopped = true; stopAudioElement(audio); };
  const next = () => {
    if (stopped) return;
    const url = urls[index++];
    if (!url) { options.onError?.(lastError || new Error("Аудио недоступно.")); return; }
    playCachedAudio(url, {
      ...options,
      onReady: (element) => { audio = element; options.onReady?.(element); },
      onStop: () => { stopped = true; options.onStop?.(); },
      onError: (error) => { lastError = error; if (!stopped) next(); }
    }).catch(() => {});
  };
  next();
  return stop;
}

// Screens that pass no onError would stay silent; App shows these notices instead.
let missingVoiceNoticeShown = false;
function notifyAudio(message) {
  if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("audioNotice", { detail: message }));
  }
}

export function speakText(text, {
  lang = "ar-SA", rate = 0.75, pitch = 1, volume = 1,
  cancelCurrent = true, onStart, onError, onEnd, onStop
} = {}) {
  if (cancelCurrent) stopAllAudio();
  else stopSpeech();
  const reportError = (message) => {
    if (onError) onError(new Error(message));
    else notifyAudio(message);
  };
  if (!getProfilePreferences().soundEnabled) {
    reportError("Звук выключен. Включи его: Профиль → Настройки → Звук.");
    return null;
  }
  if (!hasSpeech() || !text || typeof SpeechSynthesisUtterance === "undefined") {
    reportError("Озвучка недоступна в этом браузере.");
    return null;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getPreferredVoice(lang);
  const voicesLoaded = (window.speechSynthesis.getVoices?.() || []).length > 0;
  if (!voice && voicesLoaded && lang.toLowerCase().startsWith("ar") && !missingVoiceNoticeShown) {
    missingVoiceNoticeShown = true;
    notifyAudio("На этом устройстве нет арабского голоса, поэтому озвучка может молчать или звучать неверно. Арабский голос можно добавить в настройках телефона.");
  }
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  const run = { utterance, finished: false, timer: null, onStop };
  speechRun = run;
  const current = () => speechRun === run && !run.finished;
  const finish = (callback, value) => {
    if (!current()) return;
    run.finished = true;
    speechRun = null;
    callback?.(value);
  };
  utterance.onstart = () => { if (current()) onStart?.(); };
  utterance.onend = () => finish(onEnd);
  utterance.onerror = (event) => finish(onError, event);
  run.timer = setTimeout(() => {
    if (!current()) return;
    try { window.speechSynthesis.resume?.(); window.speechSynthesis.speak(utterance); }
    catch (error) { finish(onError, error); }
  }, cancelCurrent ? 50 : 0);
  return utterance;
}
