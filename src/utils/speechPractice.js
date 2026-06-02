const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/gu;

export function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("ru")
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
}

export function scoreSpeech(transcript, targets) {
  const heard = normalizeText(transcript);
  const normalizedTargets = targets.map(normalizeText).filter(Boolean);
  if (!heard || !normalizedTargets.length) return 0;

  return normalizedTargets.reduce((best, target) => {
    if (heard.includes(target) || target.includes(heard)) return Math.max(best, 1);
    const distance = levenshtein(heard, target);
    const score = 1 - distance / Math.max(heard.length, target.length, 1);
    return Math.max(best, Math.max(0, score));
  }, 0);
}

export function createSpeechPractice({ lang = "ar-SA", maxAlternatives = 5, onStart, onResult, onError, onEnd }) {
  const Recognition = getSpeechRecognition();
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = maxAlternatives;

  recognition.onstart = onStart;
  recognition.onerror = onError;
  recognition.onend = onEnd;
  recognition.onresult = (event) => {
    const alternatives = Array.from(event.results?.[0] || []).map((result) => result.transcript);
    const fallback = event.results?.[0]?.[0]?.transcript || "";
    onResult(alternatives.length ? alternatives : [fallback]);
  };

  return recognition;
}
