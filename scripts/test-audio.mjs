import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

registerHooks({ load(url, context, next) {
  if (/\.(png|jpg|webp|svg)$/.test(url)) return { format: "module", source: 'export default ""', shortCircuit: true };
  return next(url, context);
} });
const values = new Map();
const spoken = [];
globalThis.window = {
  dispatchEvent() {},
  localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) },
  speechSynthesis: { cancel() {}, resume() {}, getVoices: () => [], speak: (utterance) => spoken.push(utterance) }
};
globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
const instances = [];
globalThis.Audio = class {
  constructor(src) { this.src = src; this.currentTime = 0; this.pauses = 0; instances.push(this); }
  pause() { this.pauses++; }
  play() { return new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject; }); }
};
const { playCachedAudio, playAudioSources, speakText, stopAllAudio, stopAudioElement } = await import("../src/utils/audioPlayback.js");
const { scoreSpeech } = await import("../src/utils/speechPractice.js");
const { setProfilePreference } = await import("../src/utils/storage.js");
const { getAyahAudioSources } = await import("../src/utils/quranAudio.js");

test("stopping pending speech prevents a late utterance", async () => {
  speakText("cancelled");
  stopAllAudio();
  await new Promise((resolve) => setTimeout(resolve, 65));
  assert.equal(spoken.length, 0);
});

test("only the latest speech request can start or finish", async () => {
  let completed = 0;
  const first = speakText("first", { onEnd: () => completed++ });
  const oldEnd = first.onend;
  speakText("second");
  oldEnd();
  await new Promise((resolve) => setTimeout(resolve, 65));
  assert.deepEqual(spoken.map((item) => item.text), ["second"]);
  assert.equal(completed, 0);
  stopAllAudio();
});

test("cancelled pending audio never calls stale play or error handlers", async () => {
  let callbacks = 0;
  let ready;
  const pending = playCachedAudio("pending-a.mp3", { onReady: (audio) => { ready = audio; }, onPlaying: () => callbacks++, onError: () => callbacks++ });
  assert.ok(ready);
  stopAudioElement(ready);
  ready.reject(new Error("AbortError"));
  await pending;
  assert.equal(callbacks, 0);
  assert.ok(ready.pauses > 0);
});

test("media error and rejected play settle only once", async () => {
  let errors = 0;
  const pending = playCachedAudio("missing.mp3", { onError: () => errors++ });
  const audio = instances.at(-1);
  audio.onerror(new Error("network"));
  audio.reject(new Error("NotSupportedError"));
  await pending;
  assert.equal(errors, 1);
});

test("replacing one cached element suppresses its previous promise", async () => {
  let old = 0;
  let current = 0;
  const first = playCachedAudio("same.mp3", { onPlaying: () => old++ });
  const audio = instances.at(-1);
  const firstResolve = audio.resolve;
  const second = playCachedAudio("same.mp3", { onPlaying: () => current++ });
  firstResolve();
  audio.resolve();
  await Promise.all([first, second]);
  assert.equal(old, 0);
  assert.equal(current, 1);
  stopAllAudio();
});

test("recording falls back once and advances only on successful end", async () => {
  let errors = 0;
  let ends = 0;
  playAudioSources(["local.mp3", "remote.mp3"], { onEnded: () => ends++, onError: () => errors++ });
  const local = instances.at(-1);
  local.onerror(new Error("missing"));
  const remote = instances.at(-1);
  local.reject(new Error("missing"));
  remote.resolve();
  await Promise.resolve();
  assert.equal(remote.src, "remote.mp3");
  assert.equal(ends, 0);
  remote.onended();
  assert.equal(ends, 1);
  assert.equal(errors, 0);
});

test("profile mute reports an error without starting audio or synthesis", async () => {
  setProfilePreference("soundEnabled", false);
  const before = instances.length;
  let errors = 0;
  await playCachedAudio("muted.mp3", { onError: () => errors++ });
  speakText("muted", { onError: () => errors++ });
  assert.equal(instances.length, before);
  assert.equal(errors, 2);
  setProfilePreference("soundEnabled", true);
});

test("speech requires the whole phrase, while ignoring Arabic vowel marks", () => {
  const target = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  assert.equal(scoreSpeech("ب", [target]), 0);
  assert.equal(scoreSpeech("بسم الله", [target]), 0);
  assert.equal(scoreSpeech("بسم الله الرحمن الرحيم", [target]), 1);
  assert.equal(scoreSpeech("unrelated words", [target]), 0);
});

test("downloaded Quran recording precedes the CDN fallback", () => {
  const urls = getAyahAudioSources(1, 1);
  assert.match(urls[0], /^\/audio\/quran\//);
  assert.equal(urls[1], "https://everyayah.com/data/Alafasy_128kbps/001001.mp3");
});
