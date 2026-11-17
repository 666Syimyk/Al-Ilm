import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { lessonPathNodes, getLessonNodeForGame, getLessonNodeStatus } from "../src/data/lessonPath.js";

const storageUrl = new URL("../src/utils/storage.js", import.meta.url);
// Browser themes import PNGs. Only this unrelated asset validator is stubbed;
// every storage/progression function below runs from the current production source.
const source = (await readFile(storageUrl, "utf8"))
  .replace(/^import .*backgroundThemes.*;$/m, "const isBackgroundTheme = () => true;")
  .replaceAll('"../data/arabicLetters.js"', JSON.stringify(new URL("../src/data/arabicLetters.js", import.meta.url).href))
  .replaceAll('"../data/lessonPath.js"', JSON.stringify(new URL("../src/data/lessonPath.js", import.meta.url).href));
let instance = 0;

async function setup(initial = {}) {
  const values = new Map(Object.entries(initial).map(([key, value]) => [key, String(value)]));
  const events = [];
  const backend = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
  const localStorage = new Proxy(backend, {
    ownKeys: () => [...values.keys()],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
  });
  globalThis.window = { localStorage, dispatchEvent(event) { events.push(event); return true; } };
  const storage = await import(`data:text/javascript;base64,${Buffer.from(source + `\n// instance ${instance++}`).toString("base64")}`);
  return { storage, values, events };
}

function completeChapterOne(storage) {
  for (const node of lessonPathNodes.filter((item) => item.chapter === "chapter-1" && !item.bonus)) {
    assert.equal(storage.completeLessonNode(node.id).blocked, undefined, node.id);
  }
}

test("unknown and locked nodes cannot award progress", async () => {
  const { storage: s } = await setup();
  assert.equal(s.completeLessonNode("missing").blocked, true);
  assert.equal(s.completeLessonNode("ba-letter").blocked, true);
  assert.equal(s.getProgress().points, 0);
});

test("chapter review resolves its own node and replay never rewinds the frontier", async () => {
  const { storage: s } = await setup();
  completeChapterOne(s);
  assert.equal(s.getLessonPathState().currentLessonNode, "dotted-review");
  assert.equal(getLessonNodeForGame("ba", "dots", s.getLessonPathState()), "dotted-review");
  assert.equal(getLessonNodeForGame("ba", "dots", s.getLessonPathState(), "dotted-review"), "dotted-review");
  assert.equal(getLessonNodeForGame("ba", "dots", s.getLessonPathState(), "alif-letter"), undefined);
  const points = s.getProgress().points;
  s.completeLessonNode("ba-dots");
  assert.equal(s.getProgress().points, points);
  assert.equal(s.getLessonPathState().currentLessonNode, "dotted-review");
  s.completeLessonNode("dotted-review");
  assert.equal(s.getLessonPathState().currentLessonNode, "ha-letter");
});

test("every mandatory node can be completed in order; awards are idempotent", async () => {
  const { storage: s } = await setup();
  for (const node of lessonPathNodes.filter((item) => !item.bonus)) {
    assert.equal(getLessonNodeStatus(node.id, s.getLessonPathState()), "current", node.id);
    assert.equal(s.completeLessonNode(node.id).blocked, undefined);
  }
  assert.equal(s.getProgress().completedLetters.length, 28);
  assert.equal(s.getLessonPathState().completedChapters.length, 8);
  const points = s.getProgress().points;
  s.completeLessonNode("alif-reward");
  assert.equal(s.getProgress().points, points);
  assert.equal(s.getLessonPathState().currentLessonNode, "quran-start");
});

test("letter reward grants points once, and old earned letters bridge without re-awarding", async () => {
  const { storage: s } = await setup();
  for (const id of ["alif-letter", "alif-sound", "alif-find"]) s.completeLessonNode(id);
  s.completeLetter("alif");
  assert.equal(s.getProgress().points, 40);
  s.completeLetter("alif");
  assert.equal(s.getProgress().points, 40);
  const { storage: migrated } = await setup({ completedLetters: '["alif"]', points: "40" });
  assert.equal(migrated.getLessonPathState().currentLessonNode, "ba-letter");
  migrated.completeLetter("alif");
  assert.equal(migrated.getProgress().points, 40);
});

test("legacy progress migrates to its owner, remains backed up, and new accounts start separately", async () => {
  const { storage: s, values } = await setup({
    user: JSON.stringify({ name: "Legacy", email: "legacy@example.test", password: "old-pass" }),
    completedLetters: '["alif"]', points: "40", age: "8", selectedCharacter: "amina"
  });
  await s.createLocalAccount({ name: "New", email: "new@example.test" }, "new-pass");
  assert.equal(s.getProgress().points, 0);
  assert.equal(s.getAge(), null);
  assert.equal(s.getSelectedCharacter(), null);
  assert.equal(values.get("points"), "40", "original data remains a recovery copy");
  await s.loginLocalAccount("legacy@example.test", "old-pass");
  assert.equal(s.getProgress().points, 40);
  assert.equal(s.getAge(), 8);
  assert.equal(s.getSelectedCharacter(), "amina");
  assert.ok(s.getUser().passwordHash);
  assert.equal(s.getUser().password, undefined);
});

test("0000 neither bypasses a password nor creates a profile for an unknown email", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "private@example.test" }, "secret-pass");
  await assert.rejects(() => s.loginLocalAccount("private@example.test", "0000"), /wrong-password/);
  await assert.rejects(() => s.loginLocalAccount("demo@example.test", "0000"), /not-found/);
  assert.equal(s.getLocalAccountByEmail("demo@example.test"), null);
  await s.loginLocalAccount("private@example.test", "secret-pass");
});

test("sign-out forgets the active profile, so later writes cannot reach it", async () => {
  const { storage: s, values } = await setup();
  await s.createLocalAccount({ email: "a@example.test", name: "A" }, "pass-a");
  s.setSessionActive(true);
  s.completeLessonNode("alif-letter");
  assert.equal(s.hasActiveProfile(), true);
  s.clearSession();
  assert.equal(s.hasActiveProfile(), false);
  assert.equal(s.getUser(), null);
  s.setProgress({ ...s.getProgress(), points: 999 });
  assert.notEqual(values.get(`al-ilm:account:${encodeURIComponent("a@example.test")}:points`), "999");
  await s.loginLocalAccount("a@example.test", "pass-a");
  assert.equal(s.getProgress().points, 5);
});

test("a forgotten password is recovered only with the registered name and birth date", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "kid@example.test", firstName: "Амина", dateOfBirth: "2018-03-04" }, "old-pass");
  await assert.rejects(() => s.recoverLocalPassword("kid@example.test", "Амина", "2018-03-05", "new-pass"), /details-mismatch/);
  await assert.rejects(() => s.recoverLocalPassword("kid@example.test", "Ахмад", "2018-03-04", "new-pass"), /details-mismatch/);
  await s.recoverLocalPassword("kid@example.test", " амина ", "2018-03-04", "new-pass");
  await assert.rejects(() => s.loginLocalAccount("kid@example.test", "old-pass"), /wrong-password/);
  await s.loginLocalAccount("kid@example.test", "new-pass");
});

test("a backup restores progress into another profile and omits credentials", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "a@example.test", name: "A" }, "pass-a");
  s.completeLessonNode("alif-letter");
  const backup = JSON.parse(JSON.stringify(s.exportAccountBackup()));
  assert.equal(backup.profile.passwordHash, undefined);
  assert.equal(backup.data.points, "5");
  await s.createLocalAccount({ email: "b@example.test", name: "B" }, "pass-b");
  assert.equal(s.getProgress().points, 0);
  assert.ok(s.importAccountBackup(backup) > 0);
  assert.equal(s.getProgress().points, 5);
  assert.throws(() => s.importAccountBackup({ format: "other" }), /invalid-backup/);
});

test("a failed write is announced to the interface", async () => {
  const { storage: s, events } = await setup();
  window.localStorage = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem() {} };
  s.setDailyGoal(15);
  assert.ok(events.some((event) => event.type === "storageWriteFailed"));
});

test("a credential-less legacy profile can explicitly migrate with its old access code", async () => {
  const { storage: s } = await setup({ user: JSON.stringify({ email: "legacy@example.test", name: "Legacy" }), points: "25" });
  await s.loginLocalAccount("legacy@example.test", "0000");
  assert.ok(s.getUser().passwordHash);
  assert.equal(s.getProgress().points, 25);
});

test("failed storage writes report failure instead of a saved background or account", async () => {
  const { storage: s } = await setup();
  window.localStorage = { getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem() {} };
  assert.equal(s.setBackgroundCustomImage("data:image/png;base64,test"), false);
  await assert.rejects(() => s.createLocalAccount({ email: "a@example.test" }, "pass-a"), /storage-unavailable/);
});

test("trace evaluator rejects a straight line and wrong dots but accepts a bowl with one dot", async () => {
  const jsx = await readFile(new URL("../src/games/TraceLetterGame.jsx", import.meta.url), "utf8");
  const functions = jsx.slice(jsx.indexOf("const MIN_STROKE_LENGTH"), jsx.indexOf("export default function TraceLetterGame"));
  const evaluate = new Function(`${functions}; return evaluateTrace;`)();
  const line = [[{ x: 100, y: 100 }, { x: 200, y: 100 }], [{ x: 150, y: 150 }]];
  assert.equal(evaluate({ id: "ba" }, line, 100).passed, false);
  const bowl = [{ x: 100, y: 70 }, { x: 150, y: 150 }, { x: 250, y: 155 }, { x: 300, y: 70 }];
  const dot = [{ x: 200, y: 220 }];
  assert.equal(evaluate({ id: "ba" }, [bowl, dot], 294).passed, true);
  assert.equal(evaluate({ id: "ba" }, [bowl, dot, [{ x: 230, y: 220 }]], 294).passed, false);
});

test("email collisions preserve both accounts; valid rename preserves learning", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "a@example.test", name: "A" }, "pass-a");
  s.completeLessonNode("alif-letter");
  await s.createLocalAccount({ email: "b@example.test", name: "B" }, "pass-b");
  await s.loginLocalAccount("a@example.test", "pass-a");
  assert.throws(() => s.setUser({ ...s.getUser(), email: "b@example.test" }), /email-exists/);
  assert.equal(s.getUser().email, "a@example.test");
  s.setUser({ ...s.getUser(), email: "renamed@example.test" });
  assert.equal(s.getProgress().points, 5);
  await s.loginLocalAccount("b@example.test", "pass-b");
  assert.equal(s.getProgress().points, 0);
  await s.loginLocalAccount("renamed@example.test", "pass-a");
  assert.equal(s.getProgress().points, 5);
});

test("account activation announces that account's preferences and background", async () => {
  const { storage: s, events } = await setup();
  await s.createLocalAccount({ email: "a@example.test" }, "pass-a");
  assert.deepEqual(events.map((event) => event.type), ["backgroundThemeChange", "profilePreferencesChange"]);
  s.setProfilePreference("showHints", false);
  s.setProfilePreference("arabicTextSize", "normal");
  events.length = 0;

  await s.createLocalAccount({ email: "b@example.test" }, "pass-b");
  assert.deepEqual(events.map((event) => event.type), ["backgroundThemeChange", "profilePreferencesChange"]);
  assert.equal(events[1].detail.showHints, true);
  assert.equal(events[1].detail.arabicTextSize, "large");
  events.length = 0;

  await s.loginLocalAccount("a@example.test", "pass-a");
  assert.deepEqual(events.map((event) => event.type), ["backgroundThemeChange", "profilePreferencesChange"]);
  assert.equal(events[1].detail.showHints, false);
  assert.equal(events[1].detail.arabicTextSize, "normal");
  assert.deepEqual(events[1].detail, s.getProfilePreferences());
});

test("reset covers all learned data only for the current account", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "a@example.test" }, "pass-a");
  s.completeLessonNode("alif-letter");
  await s.createLocalAccount({ email: "b@example.test" }, "pass-b");
  for (const key of ["allahNamesLearned", "islamicRulingsProgress", "namazSurahMemorization"]) s.setStoredJson(key, ["example"]);
  s.setDonePrayersForDate(["Фаджр"]);
  s.resetLearningProgress();
  assert.deepEqual(s.getDonePrayersForDate(), []);
  assert.deepEqual(s.getStoredJson("allahNamesLearned", []), []);
  await s.loginLocalAccount("a@example.test", "pass-a");
  assert.equal(s.getProgress().points, 5);
});

test("malformed storage values use safe defaults", async () => {
  const { storage: s } = await setup({ completedLetters: "null", completedLessonNodes: "{}", points: "oops", namazProgress: "null" });
  assert.deepEqual(s.getProgress().completedLetters, []);
  assert.deepEqual(s.getLessonPathState().completedLessonNodes, []);
  assert.equal(s.getProgress().points, 0);
  assert.deepEqual(s.getNamazProgress().completedPrayers, []);
});

test("daily mission and prayer-day rewards are unique; levels follow points", async () => {
  const { storage: s } = await setup();
  assert.equal(s.claimDailyMission(15), false, "nothing studied today yet");
  s.recordStudyDay();
  assert.equal(s.claimDailyMission(15), true);
  assert.equal(s.claimDailyMission(15), false);
  assert.equal(s.getProgress().points, 15);
  assert.equal(s.getProgress().streak, 1);
  s.setNamazProgress({ practiceCount: 4 });
  s.setDonePrayersForDate(["Фаджр", "Зухр", "Аср", "Магриб", "Иша"]);
  assert.equal(s.recordNamazDayCompletion().practiceCount, 5);
  assert.equal(s.recordNamazDayCompletion().practiceCount, 5);
  s.setProgress({ ...s.getProgress(), points: 300 });
  assert.equal(s.getProgress().level, 3);
});

test("password change requires proof of the current local password", async () => {
  const { storage: s } = await setup();
  await s.createLocalAccount({ email: "private@example.test" }, "old-pass");
  await assert.rejects(() => s.resetLocalPassword("private@example.test", "new-pass"), /wrong-password/);
  await s.resetLocalPassword("private@example.test", "new-pass", "old-pass");
  await assert.rejects(() => s.loginLocalAccount("private@example.test", "old-pass"), /wrong-password/);
  await s.loginLocalAccount("private@example.test", "new-pass");
});
