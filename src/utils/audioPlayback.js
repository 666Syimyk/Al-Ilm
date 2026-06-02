const cachedAudio = new Map();
const activeAudio = new Set();

function hasSpeech() {
  return typeof window !== "undefined" && Boolean(window.speechSynthesis);
}

function isUsableAudioUrl(url) {
  return typeof url === "string" && url.trim().length > 0 && url !== "undefined" && url !== "null";
}

export function getPreferredVoice(lang = "ar") {
  if (!hasSpeech()) return null;

  const normalizedLang = lang.toLowerCase();
  const voices = window.speechSynthesis.getVoices?.() || [];
  const matchingVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith(normalizedLang));

  return matchingVoices.find((voice) => /google|microsoft|natural|online/i.test(voice.name))
    || matchingVoices.find((voice) => voice.lang?.toLowerCase() === "ar-sa")
    || matchingVoices[0]
    || null;
}

export function getCachedAudio(url) {
  if (typeof Audio === "undefined" || !isUsableAudioUrl(url)) return null;

  const src = url.trim();
  if (!cachedAudio.has(src)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    try {
      audio.load();
    } catch {
      // Some browsers defer loading until a user gesture; play() will still try later.
    }
    cachedAudio.set(src, audio);
  }

  return cachedAudio.get(src);
}

export function stopAudioElement(audio, { clearHandlers = true } = {}) {
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    // Streams and some mobile browsers can reject seeking; pausing is enough.
  }

  if (clearHandlers) {
    audio.onended = null;
    audio.onerror = null;
    audio.onplaying = null;
  }

  activeAudio.delete(audio);
}

export function stopSpeech() {
  if (hasSpeech()) {
    window.speechSynthesis?.cancel();
  }
}

export function stopAllAudio() {
  stopSpeech();
  Array.from(activeAudio).forEach((audio) => stopAudioElement(audio));
}

export function playCachedAudio(url, {
  playbackRate = 1,
  cancelCurrent = true,
  onPlaying,
  onEnded,
  onError
} = {}) {
  const audio = getCachedAudio(url);
  if (!audio) {
    onError?.();
    return Promise.reject(new Error("Missing audio source"));
  }

  if (cancelCurrent) stopAllAudio();
  else stopSpeech();

  stopAudioElement(audio);
  audio.onended = () => {
    activeAudio.delete(audio);
    onEnded?.();
  };
  audio.onerror = () => {
    activeAudio.delete(audio);
    onError?.();
  };

  try {
    audio.playbackRate = playbackRate;
    audio.currentTime = 0;
  } catch {
    // Metadata may not be ready yet; play() can still start from the beginning.
  }

  activeAudio.add(audio);
  const promise = audio.play();
  if (promise?.then) {
    return promise
      .then(() => {
        onPlaying?.(audio);
        return audio;
      })
      .catch((error) => {
        activeAudio.delete(audio);
        onError?.(error);
        throw error;
      });
  }

  onPlaying?.(audio);
  return Promise.resolve(audio);
}

export function speakText(text, {
  lang = "ar-SA",
  rate = 0.75,
  pitch = 1,
  volume = 1,
  cancelCurrent = true,
  onEnd
} = {}) {
  if (!hasSpeech() || !text) {
    onEnd?.();
    return null;
  }

  try {
    if (cancelCurrent) stopAllAudio();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getPreferredVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch {
    onEnd?.();
    return null;
  }
}
