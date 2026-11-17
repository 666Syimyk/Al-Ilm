import { arabicLetters, getNextLetterId } from "../data/arabicLetters.js";
import { isBackgroundTheme } from "../data/backgroundThemes.js";
import { canOpenLessonNode, getLessonNodeById, getLessonNodesForLetter, getLetterRewardNodeId, getNodeReward, getNodesByChapter, lessonPathNodes } from "../data/lessonPath.js";

export const storageKeys = {
  user: "user",
  authUsers: "authUsers",
  age: "age",
  mode: "mode",
  selectedCharacter: "selectedCharacter",
  currentLessonNode: "currentLessonNode",
  completedLessonNodes: "completedLessonNodes",
  currentChapter: "currentChapter",
  completedChapters: "completedChapters",
  completedLetters: "completedLetters",
  points: "points",
  streak: "streak",
  level: "level",
  achievements: "achievements",
  currentLesson: "currentLesson",
  currentMission: "currentMission",
  coins: "coins",
  backgroundTheme: "backgroundTheme",
  backgroundCustomImage: "backgroundCustomImage",
  quranProgress: "quranProgress",
  currentQuranLevel: "currentQuranLevel",
  completedQuranLessons: "completedQuranLessons",
  memorizedSurahs: "memorizedSurahs",
  bookmarkedAyahs: "bookmarkedAyahs",
  tajweedProgress: "tajweedProgress",
  readingStreak: "readingStreak",
  sessionActive: "sessionActive",
  completedHarakat: "completedHarakat",
  learnedVocabulary: "learnedVocabulary",
  completedGrammar: "completedGrammar",
  completedReadingTexts: "completedReadingTexts",
  readAyahs: "readAyahs",
  memorizedAyahs: "memorizedAyahs",
  difficultAyahs: "difficultAyahs",
  favoriteSurahs: "favoriteSurahs",
  dailyQuranGoal: "dailyQuranGoal",
  lastOpenedSurah: "lastOpenedSurah",
  quranStudyDate: "quranStudyDate",
  stars: "stars",
  namazProgress: "namazProgress",
  gardenProgress: "gardenProgress",
  profilePreferences: "profilePreferences"
};

const defaultState = {
  completedLetters: [],
  points: 0,
  streak: 0,
  level: 1,
  coins: 0,
  stars: 0,
  achievements: [],
  currentLesson: "alif"
};

const defaultNamazProgress = {
  completedPrayers: [],
  learnedSteps: [],
  practiceCount: 0
};

const defaultGardenProgress = {
  plants: [],
  level: 0,
  waterCount: 0
};

const defaultProfilePreferences = {
  soundEnabled: true,
  showTranslation: true,
  showHints: true,
  arabicTextSize: "large",
  parentDigest: true
};

// Only profiles created before passwords existed may use this code, once, to set a real password.
const LEGACY_ACCESS_CODE = "0000";

const defaultLessonPathState = {
  currentLessonNode: "alif-letter",
  completedLessonNodes: [],
  currentChapter: "chapter-1",
  completedChapters: []
};

const defaultQuranState = {
  quranProgress: {
    currentStageId: "preparation",
    currentStage: "Подготовка",
    currentLesson: "Что такое Коран",
    completedLessons: 0,
    totalLessons: 6,
    progressPercent: 0
  },
  currentQuranLevel: 1,
  completedQuranLessons: [],
  memorizedSurahs: [],
  bookmarkedAyahs: [],
  tajweedProgress: [],
  readingStreak: 0
};

function canUseStorage() {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

const ACCOUNT_PREFIX = "al-ilm:account:";
const LEGACY_OWNER_KEY = "al-ilm:legacy-owner:v1";
const sharedKeys = new Set([storageKeys.user, storageKeys.authUsers, storageKeys.sessionActive]);
const extraAccountKeys = new Set([
  "darkMode", "dailyGoalMinutes", "dailyMission", "quranStreak", "learningStudyDate",
  "letterLessonProgress:v1", "lastLessonsVisit", "allahNamesLearned",
  "islamicRulingsProgress", "namazSurahMemorization", "notificationsEnabled"
]);

function isLegacyAccountKey(key) {
  return !sharedKeys.has(key) && (Object.values(storageKeys).includes(key)
    || extraAccountKeys.has(key) || /^(readToday_|prayers_|prayer|namaz)/.test(key));
}

function accountPrefix(email) {
  return `${ACCOUNT_PREFIX}${encodeURIComponent(normalizeAuthEmail(email))}:`;
}

function currentAccountEmail() {
  try {
    return normalizeAuthEmail(JSON.parse(window.localStorage.getItem(storageKeys.user) || "null")?.email);
  } catch {
    return "";
  }
}

// Keep the original keys as a recovery copy. Only the original account inherits them.
function migrateLegacyProgress(email) {
  if (!email || !canUseStorage()) return;
  try {
    const store = window.localStorage;
    if (store.getItem(LEGACY_OWNER_KEY)) return;
    const prefix = accountPrefix(email);
    Object.keys(store).filter(isLegacyAccountKey).forEach((key) => {
      if (store.getItem(prefix + key) === null) store.setItem(prefix + key, store.getItem(key));
    });
    store.setItem(LEGACY_OWNER_KEY, normalizeAuthEmail(email));
  } catch {
    // Originals remain intact if quota prevents migration; a later access retries.
  }
}

function scopedKey(key) {
  if (sharedKeys.has(key)) return key;
  const email = currentAccountEmail();
  if (!email) return key;
  migrateLegacyProgress(email);
  return accountPrefix(email) + key;
}

function activateUser(user) {
  migrateLegacyProgress(currentAccountEmail() || user.email);
  if (!writeJson(storageKeys.user, user)) throw new Error("storage-unavailable");
  if (typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("backgroundThemeChange"));
    window.dispatchEvent(new CustomEvent("profilePreferencesChange", { detail: getProfilePreferences() }));
  }
}

let lastWriteFailureAt = 0;

// A full or blocked storage must never lose progress silently: the app shows a warning.
function reportWriteFailure(key) {
  const now = Date.now();
  if (now - lastWriteFailureAt < 5000) return;
  lastWriteFailureAt = now;
  try {
    if (typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("storageWriteFailed", { detail: { key } }));
  } catch {
    // Nothing else can be done without storage.
  }
}

function readValue(key) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(scopedKey(key));
  } catch {
    return null;
  }
}

function readJson(key, fallback = null) {
  const raw = readValue(key);
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (fallback && typeof fallback === "object") return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
    return value;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(scopedKey(key), JSON.stringify(value));
    return true;
  } catch {
    // Storage can be unavailable or full; keep the app usable.
    reportWriteFailure(key);
    return false;
  }
}

function readNumber(key, fallback) {
  const value = readValue(key);
  return value === null || value === "" || !Number.isFinite(Number(value)) ? fallback : Number(value);
}

function writeValue(key, value) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(scopedKey(key), String(value));
    return true;
  } catch {
    // Storage can be unavailable or full; keep the app usable.
    reportWriteFailure(key);
    return false;
  }
}

export function getStoredValue(key, fallback = null) {
  return readValue(key) ?? fallback;
}

export function setStoredValue(key, value) {
  writeValue(key, value);
}

export function getStoredJson(key, fallback = null) {
  return readJson(key, fallback);
}

export function setStoredJson(key, value) {
  writeJson(key, value);
}

export function getDailyMissionState() {
  if (!canUseStorage()) return { done: false, date: null };
  const today = new Date().toDateString();
  const saved = readJson("dailyMission", {});
  return { done: saved.date === today, date: saved.date };
}

export function setDailyMissionDone() {
  const today = new Date().toDateString();
  writeJson("dailyMission", { date: today, done: true });
}

export function getUser() {
  return readJson(storageKeys.user);
}

function normalizeAuthEmail(email) {
  return String(email || "").trim().toLocaleLowerCase();
}

function safeUser(user) {
  if (!user) return user;
  const { password, repeatPassword, ...rest } = user;
  return rest;
}

function randomSalt() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function digestText(text) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(text);
    const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

async function hashPassword(password, salt = randomSalt()) {
  const digest = await digestText(`${salt}:${password}`);
  return `${salt}:${digest}`;
}

async function verifyPassword(password, passwordHash, legacyPassword) {
  if (passwordHash?.includes(":")) {
    const [salt, expected] = passwordHash.split(":");
    const digest = await digestText(`${salt}:${password}`);
    return digest === expected;
  }
  return Boolean(legacyPassword) && legacyPassword === password;
}

export function getAuthUsers() {
  const users = readJson(storageKeys.authUsers, []);
  const legacyUser = getUser();
  const list = Array.isArray(users) ? users : [];

  if (legacyUser?.email && !list.some((user) => normalizeAuthEmail(user.email) === normalizeAuthEmail(legacyUser.email))) {
    return [...list, legacyUser];
  }

  return list;
}

export function getLocalAccountByEmail(email) {
  const normalized = normalizeAuthEmail(email);
  return getAuthUsers().find((user) => normalizeAuthEmail(user.email) === normalized) || null;
}

function writeAuthUsers(users) {
  // Unmigrated legacy passwords must remain usable until that account signs in.
  if (!writeJson(storageKeys.authUsers, users.map((user) => user.passwordHash ? safeUser(user) : user))) throw new Error("storage-unavailable");
}

export function setUser(user) {
  const previous = getUser();
  const oldEmail = normalizeAuthEmail(previous?.email);
  const normalized = normalizeAuthEmail(user?.email);
  const currentUser = safeUser({ ...user, email: normalized });
  if (!currentUser.passwordHash && previous?.password) currentUser.password = previous.password;
  const users = getAuthUsers();
  if (oldEmail !== normalized && users.some((item) => normalizeAuthEmail(item.email) === normalized)) {
    throw new Error("email-exists");
  }
  if (oldEmail && normalized !== oldEmail && canUseStorage()) {
    migrateLegacyProgress(oldEmail);
    // Copy rather than remove: the old namespace remains a recovery copy.
    const prefix = accountPrefix(oldEmail);
    Object.keys(window.localStorage).filter((key) => key.startsWith(prefix)).forEach((key) => {
      window.localStorage.setItem(accountPrefix(normalized) + key.slice(prefix.length), window.localStorage.getItem(key));
    });
  }
  writeAuthUsers([...users.filter((item) => ![oldEmail, normalized].includes(normalizeAuthEmail(item.email))), currentUser]);
  activateUser(currentUser);
}

export async function createLocalAccount(profile, password) {
  const email = normalizeAuthEmail(profile.email);
  const users = getAuthUsers();

  if (users.some((user) => normalizeAuthEmail(user.email) === email)) {
    throw new Error("email-exists");
  }

  const user = safeUser({
    ...profile,
    email,
    passwordHash: await hashPassword(password),
    authProvider: "local"
  });

  writeAuthUsers([...users, user]);
  activateUser(user);
  return user;
}

export async function loginLocalAccount(email, password) {
  const normalized = normalizeAuthEmail(email);
  const users = getAuthUsers();
  const user = users.find((item) => normalizeAuthEmail(item.email) === normalized);

  if (!user) throw new Error("not-found");

  const legacyWithoutPassword = !user.passwordHash && !user.password;
  const valid = (legacyWithoutPassword && password === LEGACY_ACCESS_CODE) || await verifyPassword(password, user.passwordHash, user.password);
  if (!valid) throw new Error("wrong-password");

  const passwordHash = user.passwordHash?.includes(":") ? user.passwordHash : await hashPassword(password);
  const migrated = safeUser({
    ...user,
    email: normalized,
    preferredCharacter: user.preferredCharacter || "ahmad",
    passwordHash,
    lastLoginAt: new Date().toISOString()
  });
  const next = users.map((item) => normalizeAuthEmail(item.email) === normalized ? migrated : item);

  writeAuthUsers(next);
  activateUser(migrated);
  return migrated;
}

export async function resetLocalPassword(email, password, currentPassword) {
  const normalized = normalizeAuthEmail(email);
  const users = getAuthUsers();
  const user = users.find((item) => normalizeAuthEmail(item.email) === normalized);

  if (!user) throw new Error("not-found");
  if (!await verifyPassword(currentPassword || "", user.passwordHash, user.password)) throw new Error("wrong-password");

  const updated = safeUser({
    ...user,
    passwordHash: await hashPassword(password),
    updatedAt: new Date().toISOString()
  });
  const next = users.map((item) => normalizeAuthEmail(item.email) === normalized ? updated : item);

  writeAuthUsers(next);
  if (normalizeAuthEmail(getUser()?.email) === normalized) activateUser(updated);
  return updated;
}

function sameText(a, b) {
  return String(a || "").trim().toLocaleLowerCase() === String(b || "").trim().toLocaleLowerCase();
}

// Local profiles have no email delivery. A forgotten password is recovered on this device
// with the details a parent entered at registration (first name and date of birth).
export async function recoverLocalPassword(email, firstName, dateOfBirth, password) {
  const normalized = normalizeAuthEmail(email);
  const users = getAuthUsers();
  const user = users.find((item) => normalizeAuthEmail(item.email) === normalized);

  if (!user) throw new Error("not-found");
  const knownName = user.firstName || user.name;
  if (!knownName || !user.dateOfBirth || !sameText(knownName, firstName) || user.dateOfBirth !== dateOfBirth) {
    throw new Error("details-mismatch");
  }

  const updated = safeUser({
    ...user,
    passwordHash: await hashPassword(password),
    updatedAt: new Date().toISOString()
  });
  writeAuthUsers(users.map((item) => normalizeAuthEmail(item.email) === normalized ? updated : item));
  if (normalizeAuthEmail(getUser()?.email) === normalized) activateUser(updated);
  return updated;
}

const BACKUP_FORMAT = "al-ilm-backup";

// Progress lives only in this browser; a file backup is the only protection against
// cleared site data or a lost device.
export function exportAccountBackup() {
  const user = getUser();
  const email = normalizeAuthEmail(user?.email);
  if (!email || !canUseStorage()) return null;
  migrateLegacyProgress(email);
  const prefix = accountPrefix(email);
  const data = {};
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(prefix) && key.slice(prefix.length) !== storageKeys.backgroundCustomImage)
    .forEach((key) => { data[key.slice(prefix.length)] = window.localStorage.getItem(key); });
  const { passwordHash, ...profile } = safeUser(user);
  return { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), profile, data };
}

export function importAccountBackup(backup) {
  if (!backup || backup.format !== BACKUP_FORMAT || backup.version !== 1 || !backup.data || typeof backup.data !== "object") {
    throw new Error("invalid-backup");
  }
  const email = normalizeAuthEmail(getUser()?.email);
  if (!email || !canUseStorage()) throw new Error("no-account");
  const prefix = accountPrefix(email);
  const entries = Object.entries(backup.data).filter(([key, value]) => typeof value === "string"
    && !sharedKeys.has(key) && key !== storageKeys.backgroundCustomImage && key.length < 200);
  try {
    entries.forEach(([key, value]) => window.localStorage.setItem(prefix + key, value));
  } catch {
    throw new Error("storage-unavailable");
  }
  if (typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("backgroundThemeChange"));
    window.dispatchEvent(new CustomEvent("profilePreferencesChange", { detail: getProfilePreferences() }));
  }
  return entries.length;
}

export function getAge() {
  return readNumber(storageKeys.age, null);
}

export function setAge(age) {
  writeValue(storageKeys.age, age);
  writeValue(storageKeys.mode, Number(age) <= 12 ? "child" : "adult");
}

export function getMode() {
  return readValue(storageKeys.mode);
}

export function getSessionActive() {
  return readValue(storageKeys.sessionActive) === "true";
}

export function setSessionActive(value) {
  writeValue(storageKeys.sessionActive, value ? "true" : "false");
}

export function getDailyGoal() {
  return readNumber("dailyGoalMinutes", 10);
}

export function setDailyGoal(minutes) {
  writeValue("dailyGoalMinutes", minutes);
}

export function getSelectedCharacter() {
  return readValue(storageKeys.selectedCharacter);
}

export function setSelectedCharacter(character) {
  writeValue(storageKeys.selectedCharacter, character);
}

export function getBackgroundTheme() {
  const theme = readValue(storageKeys.backgroundTheme) || "classic";
  return isBackgroundTheme(theme) ? theme : "classic";
}

export function setBackgroundTheme(theme) {
  if (!isBackgroundTheme(theme) || !writeValue(storageKeys.backgroundTheme, theme)) return false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("backgroundThemeChange", { detail: theme }));
  }
  return true;
}

export function getBackgroundCustomImage() {
  return readValue(storageKeys.backgroundCustomImage) || "";
}

export function setBackgroundCustomImage(imageData) {
  if (!writeValue(storageKeys.backgroundCustomImage, imageData)) return false;
  return setBackgroundTheme("custom");
}

export function getProfilePreferences() {
  return {
    ...defaultProfilePreferences,
    ...readJson(storageKeys.profilePreferences, defaultProfilePreferences)
  };
}

export function setProfilePreference(key, value) {
  const next = { ...getProfilePreferences(), [key]: value };
  writeJson(storageKeys.profilePreferences, next);
  if (typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("profilePreferencesChange", { detail: next }));
  return next;
}

export function resetLearningProgress() {
  if (!canUseStorage()) return;

  [
    storageKeys.currentLessonNode,
    storageKeys.completedLessonNodes,
    storageKeys.currentChapter,
    storageKeys.completedChapters,
    storageKeys.completedLetters,
    storageKeys.points,
    storageKeys.streak,
    storageKeys.level,
    storageKeys.achievements,
    storageKeys.currentLesson,
    storageKeys.currentMission,
    storageKeys.coins,
    storageKeys.stars,
    storageKeys.quranProgress,
    storageKeys.currentQuranLevel,
    storageKeys.completedQuranLessons,
    storageKeys.memorizedSurahs,
    storageKeys.bookmarkedAyahs,
    storageKeys.tajweedProgress,
    storageKeys.readingStreak,
    storageKeys.completedHarakat,
    storageKeys.learnedVocabulary,
    storageKeys.completedGrammar,
    storageKeys.completedReadingTexts,
    storageKeys.readAyahs,
    storageKeys.memorizedAyahs,
    storageKeys.difficultAyahs,
    storageKeys.favoriteSurahs,
    storageKeys.lastOpenedSurah,
    storageKeys.quranStudyDate,
    storageKeys.namazProgress,
    storageKeys.gardenProgress,
    "letterLessonProgress:v1",
    "lastLessonsVisit",
    "dailyMission",
    "quranStreak",
    "learningStudyDate",
    "allahNamesLearned",
    "islamicRulingsProgress",
    "namazSurahMemorization"
  ].forEach((key) => {
    try { window.localStorage.removeItem(scopedKey(key)); } catch { /* unavailable */ }
  });

  const prefix = currentAccountEmail() ? accountPrefix(currentAccountEmail()) : "";
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(prefix) && /^(readToday_|prayers_)/.test(key.slice(prefix.length)))
    .forEach((key) => { try { window.localStorage.removeItem(key); } catch { /* unavailable */ } });
}

export function getQuranState() {
  return {
    quranProgress: readJson(storageKeys.quranProgress, defaultQuranState.quranProgress),
    currentQuranLevel: readNumber(storageKeys.currentQuranLevel, defaultQuranState.currentQuranLevel),
    completedQuranLessons: readJson(storageKeys.completedQuranLessons, defaultQuranState.completedQuranLessons),
    memorizedSurahs: readJson(storageKeys.memorizedSurahs, defaultQuranState.memorizedSurahs),
    bookmarkedAyahs: readJson(storageKeys.bookmarkedAyahs, defaultQuranState.bookmarkedAyahs),
    tajweedProgress: readJson(storageKeys.tajweedProgress, defaultQuranState.tajweedProgress),
    readingStreak: readNumber(storageKeys.readingStreak, defaultQuranState.readingStreak)
  };
}

export function setQuranProgress(quranProgress) {
  writeJson(storageKeys.quranProgress, quranProgress);
}

export function completeQuranLesson(lessonId) {
  const state = getQuranState();
  const completedQuranLessons = state.completedQuranLessons.includes(lessonId)
    ? state.completedQuranLessons
    : [...state.completedQuranLessons, lessonId];
  writeJson(storageKeys.completedQuranLessons, completedQuranLessons);
  return completedQuranLessons;
}

export function memorizeSurah(surahId) {
  const state = getQuranState();
  const memorizedSurahs = state.memorizedSurahs.includes(surahId) ? state.memorizedSurahs : [...state.memorizedSurahs, surahId];
  writeJson(storageKeys.memorizedSurahs, memorizedSurahs);
  return memorizedSurahs;
}

export function toggleBookmarkedAyah(bookmarkId) {
  const state = getQuranState();
  const bookmarkedAyahs = state.bookmarkedAyahs.includes(bookmarkId)
    ? state.bookmarkedAyahs.filter((item) => item !== bookmarkId)
    : [...state.bookmarkedAyahs, bookmarkId];
  writeJson(storageKeys.bookmarkedAyahs, bookmarkedAyahs);
  return bookmarkedAyahs;
}

export function getQuranTracking() {
  const today = new Date().toDateString();
  const studyDate = readValue(storageKeys.quranStudyDate);
  const readAyahs = readJson(storageKeys.readAyahs, []);
  const todayKey = `readToday_${today}`;
  const todayRead = readJson(todayKey, []);
  return {
    readAyahs,
    memorizedAyahs: readJson(storageKeys.memorizedAyahs, []),
    difficultAyahs: readJson(storageKeys.difficultAyahs, []),
    favoriteSurahs: readJson(storageKeys.favoriteSurahs, []),
    dailyGoal: readNumber(storageKeys.dailyQuranGoal, 5),
    lastOpenedSurah: readValue(storageKeys.lastOpenedSurah),
    todayReadCount: todayRead.length,
    streakDays: studyDate === today || studyDate === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString() ? readNumber("quranStreak", 0) : 0
  };
}

export function markAyahRead(ayahRef) {
  const today = new Date().toDateString();
  const todayKey = `readToday_${today}`;
  const todayRead = readJson(todayKey, []);
  if (!todayRead.includes(ayahRef)) writeJson(todayKey, [...todayRead, ayahRef]);
  const all = readJson(storageKeys.readAyahs, []);
  if (!all.includes(ayahRef)) writeJson(storageKeys.readAyahs, [...all, ayahRef]);
  // update streak
  const lastDate = readValue(storageKeys.quranStudyDate);
  const streak = readNumber("quranStreak", 0);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toDateString();
  const newStreak = lastDate === yesterday || lastDate === today ? (lastDate === today ? streak : streak + 1) : 1;
  if (canUseStorage()) {
    writeValue(storageKeys.quranStudyDate, today);
    writeValue("quranStreak", newStreak);
  }
  recordStudyDay();
}

export function markAyahMemorized(ayahRef) {
  const list = readJson(storageKeys.memorizedAyahs, []);
  if (!list.includes(ayahRef)) writeJson(storageKeys.memorizedAyahs, [...list, ayahRef]);
}

export function unmarkAyahMemorized(ayahRef) {
  const list = readJson(storageKeys.memorizedAyahs, []);
  writeJson(storageKeys.memorizedAyahs, list.filter((r) => r !== ayahRef));
}

export function markAyahDifficult(ayahRef) {
  const list = readJson(storageKeys.difficultAyahs, []);
  if (!list.includes(ayahRef)) writeJson(storageKeys.difficultAyahs, [...list, ayahRef]);
}

export function unmarkAyahDifficult(ayahRef) {
  const list = readJson(storageKeys.difficultAyahs, []);
  writeJson(storageKeys.difficultAyahs, list.filter((r) => r !== ayahRef));
}

export function toggleFavoriteSurah(surahId) {
  const list = readJson(storageKeys.favoriteSurahs, []);
  const next = list.includes(surahId) ? list.filter((id) => id !== surahId) : [...list, surahId];
  writeJson(storageKeys.favoriteSurahs, next);
  return next;
}

export function setDailyQuranGoal(goal) {
  writeValue(storageKeys.dailyQuranGoal, goal);
}

export function setLastOpenedSurah(surahId) {
  writeValue(storageKeys.lastOpenedSurah, surahId);
}

export function completeTajweedRule(ruleId) {
  const state = getQuranState();
  const isNew = !state.tajweedProgress.includes(ruleId);
  const tajweedProgress = isNew ? [...state.tajweedProgress, ruleId] : state.tajweedProgress;
  writeJson(storageKeys.tajweedProgress, tajweedProgress);
  if (isNew) recordStudyDay();
  return tajweedProgress;
}

export function getProgress() {
  const lastStudy = readValue("learningStudyDate");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const streakIsCurrent = !lastStudy || [new Date().toDateString(), yesterday.toDateString()].includes(lastStudy);
  return {
    completedLetters: readJson(storageKeys.completedLetters, defaultState.completedLetters),
    points: readNumber(storageKeys.points, defaultState.points),
    streak: streakIsCurrent ? readNumber(storageKeys.streak, defaultState.streak) : 0,
    level: Math.max(1, Math.floor(readNumber(storageKeys.points, 0) / 150) + 1),
    coins: readNumber(storageKeys.coins, defaultState.coins),
    stars: readNumber(storageKeys.stars, defaultState.stars),
    achievements: readJson(storageKeys.achievements, defaultState.achievements),
    currentLesson: readString(storageKeys.currentLesson, defaultState.currentLesson),
    completedHarakat: readJson(storageKeys.completedHarakat, []),
    learnedVocabulary: readJson(storageKeys.learnedVocabulary, []),
    completedGrammar: readJson(storageKeys.completedGrammar, []),
    completedReadingTexts: readJson(storageKeys.completedReadingTexts, [])
  };
}

export function getNamazProgress() {
  return readJson(storageKeys.namazProgress, defaultNamazProgress);
}

export function setNamazProgress(data) {
  writeJson(storageKeys.namazProgress, { ...getNamazProgress(), ...data });
}

export function getNamazDayKey(date = new Date()) {
  return `prayers_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
}

export function getDonePrayersForDate(date = new Date()) {
  return readJson(getNamazDayKey(date), []);
}

export function setDonePrayersForDate(donePrayers, date = new Date()) {
  writeJson(getNamazDayKey(date), donePrayers);
}

export function recordNamazDayCompletion(date = new Date(), requiredPrayers = ["Фаджр", "Зухр", "Аср", "Магриб", "Иша"]) {
  const progress = getNamazProgress();
  const done = getDonePrayersForDate(date);
  const day = getNamazDayKey(date);
  const dates = Array.isArray(progress.completedPracticeDates) ? progress.completedPracticeDates : [];
  if (!requiredPrayers.every((name) => done.includes(name)) || dates.includes(day)) return progress;
  const next = { ...progress, completedPracticeDates: [...dates, day], practiceCount: (Number(progress.practiceCount) || 0) + 1 };
  setNamazProgress(next);
  recordStudyDay(date);
  return next;
}

export function recordStudyDay(date = new Date()) {
  const today = date.toDateString();
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const last = readValue("learningStudyDate");
  const saved = readNumber(storageKeys.streak, 0);
  const streak = last === today ? saved : last === yesterday.toDateString() ? saved + 1 : 1;
  writeValue("learningStudyDate", today);
  writeValue(storageKeys.streak, streak);
  if (streak >= 7) {
    const achievements = readJson(storageKeys.achievements, []);
    if (!achievements.includes("strong_streak")) writeJson(storageKeys.achievements, [...achievements, "strong_streak"]);
  }
  return streak;
}

export function hasStudiedToday() {
  return readValue("learningStudyDate") === new Date().toDateString();
}

// The reward needs real work today: a lesson, an ayah, a module lesson or a prayer step.
export function claimDailyMission(reward) {
  if (getDailyMissionState().done || !hasStudiedToday()) return false;
  const amount = Math.max(0, Math.min(50, Number(reward) || 0));
  const progress = getProgress();
  setProgress({ ...progress, points: progress.points + amount, coins: progress.coins + amount });
  setDailyMissionDone();
  return true;
}

export function getGardenProgress() {
  return readJson(storageKeys.gardenProgress, defaultGardenProgress);
}

export function setGardenProgress(data) {
  writeJson(storageKeys.gardenProgress, { ...getGardenProgress(), ...data });
}

export function addStar() {
  const current = readNumber(storageKeys.stars, 0);
  writeValue(storageKeys.stars, current + 1);
  return current + 1;
}

function readString(key, fallback) {
  return readValue(key) || fallback;
}

export function getLessonPathState() {
  // Earlier letter flows stored completed letters without their corresponding path nodes.
  // Preserve that earned progress, but never infer reviews or chapter examinations.
  const completed = new Set(readJson(storageKeys.completedLessonNodes, []));
  for (const letterId of readJson(storageKeys.completedLetters, [])) {
    getLessonNodesForLetter(letterId).forEach((node) => completed.add(node.id));
  }
  const completedLessonNodes = [...completed];
  const current = lessonPathNodes.find((node) => !node.bonus && !completed.has(node.id)) || lessonPathNodes.at(-1);
  return {
    currentLessonNode: current.id,
    completedLessonNodes,
    currentChapter: current.chapter,
    completedChapters: readJson(storageKeys.completedChapters, defaultLessonPathState.completedChapters),
    currentMission: readJson(storageKeys.currentMission, null)
  };
}

export function completeLessonNode(nodeId, options = {}) {
  const lessonState = getLessonPathState();
  const progress = getProgress();
  const node = getLessonNodeById(nodeId);
  if (!nodeId || node.id !== nodeId) {
    return {
      completedLessonNodes: lessonState.completedLessonNodes,
      currentLessonNode: lessonState.currentLessonNode,
      completedChapters: lessonState.completedChapters,
      blocked: true
    };
  }

  if (!canOpenLessonNode(node.id, lessonState) && !lessonState.completedLessonNodes.includes(node.id)) {
    return {
      completedLessonNodes: lessonState.completedLessonNodes,
      currentLessonNode: lessonState.currentLessonNode,
      completedChapters: lessonState.completedChapters,
      blocked: true
    };
  }

  const reward = getNodeReward(node);
  const alreadyCompleted = lessonState.completedLessonNodes.includes(nodeId);
  const completedLessonNodes = lessonState.completedLessonNodes.includes(nodeId)
    ? lessonState.completedLessonNodes
    : [...lessonState.completedLessonNodes, nodeId];
  const nextNode = lessonPathNodes.find((item) => !item.bonus && !completedLessonNodes.includes(item.id)) || lessonPathNodes.at(-1);
  const currentLessonNode = nextNode.id;
  const completedLetterId = node.type === "reward" ? node.letterId : null;
  const completedLetters = completedLetterId && !progress.completedLetters.includes(completedLetterId)
    ? [...progress.completedLetters, completedLetterId]
    : progress.completedLetters;
  const nextPoints = progress.points + (alreadyCompleted ? 0 : reward.points);
  const nextCoins = progress.coins + (alreadyCompleted ? 0 : reward.coins);
  const chapterNodes = getNodesByChapter(node.chapter).filter((chapterNode) => !chapterNode.bonus);
  const chapterIsComplete = chapterNodes.length > 0 && chapterNodes.every((chapterNode) => completedLessonNodes.includes(chapterNode.id));
  const completedChapters = (node.type === "boss" || chapterIsComplete) && !lessonState.completedChapters.includes(node.chapter)
    ? [...lessonState.completedChapters, node.chapter]
    : lessonState.completedChapters;
  const achievements = new Set(progress.achievements);
  const completedGamesCount = completedLessonNodes.filter((id) => getLessonNodeById(id).type === "game").length;

  if (completedLetters.length >= 1) achievements.add("first_steps");
  if (completedLetters.length >= 5) achievements.add("letter_expert");
  if (progress.streak >= 7) achievements.add("strong_streak");
  if (completedLetters.length >= arabicLetters.length) achievements.add("alphabet_master");
  if (completedGamesCount >= 10) achievements.add("game_student");
  if (["quiz", "reward", "boss", "checkpoint"].includes(node.type) && options.perfect === true) achievements.add("no_errors");

  writeJson(storageKeys.completedLessonNodes, completedLessonNodes);
  writeValue(storageKeys.currentLessonNode, currentLessonNode);
  writeValue(storageKeys.currentChapter, nextNode.chapter || node.chapter || defaultLessonPathState.currentChapter);
  writeJson(storageKeys.completedChapters, completedChapters);
  writeJson(storageKeys.currentMission, {
    nodeId: currentLessonNode,
    chapter: nextNode.chapter,
    title: nextNode.title,
    type: nextNode.type
  });
  setProgress({
    ...progress,
    completedLetters,
    points: nextPoints,
    coins: nextCoins,
    level: Math.max(1, Math.floor(nextPoints / 150) + 1),
    achievements: Array.from(achievements),
    currentLesson: nextNode.letterId || progress.currentLesson
  });

  return { completedLessonNodes, currentLessonNode, completedChapters };
}

export function setProgress(progress) {
  const previous = getProgress();
  const hasNewWork = Number(progress.points) > previous.points || ["completedLetters", "completedHarakat", "learnedVocabulary", "completedGrammar", "completedReadingTexts"]
    .some((key) => Array.isArray(progress[key]) && progress[key].some((id) => !previous[key].includes(id)));
  writeJson(storageKeys.completedLetters, progress.completedLetters);
  writeValue(storageKeys.points, progress.points);
  writeValue(storageKeys.streak, progress.streak);
  writeValue(storageKeys.level, Math.max(1, Math.floor((Number(progress.points) || 0) / 150) + 1));
  writeValue(storageKeys.coins, progress.coins);
  writeValue(storageKeys.stars, progress.stars ?? defaultState.stars);
  writeJson(storageKeys.achievements, progress.achievements);
  writeValue(storageKeys.currentLesson, progress.currentLesson);
  if (progress.completedHarakat !== undefined) writeJson(storageKeys.completedHarakat, progress.completedHarakat);
  if (progress.learnedVocabulary !== undefined) writeJson(storageKeys.learnedVocabulary, progress.learnedVocabulary);
  if (progress.completedGrammar !== undefined) writeJson(storageKeys.completedGrammar, progress.completedGrammar);
  if (progress.completedReadingTexts !== undefined) writeJson(storageKeys.completedReadingTexts, progress.completedReadingTexts);
  if (hasNewWork) recordStudyDay();
}

export function getLettersWithStatus() {
  const progress = getProgress();

  return arabicLetters.map((letter) => {
    if (progress.completedLetters.includes(letter.id)) {
      return { ...letter, status: "completed" };
    }
    if (letter.id === (getLessonNodeById(getLessonPathState().currentLessonNode).letterId || progress.currentLesson)) {
      return { ...letter, status: "current" };
    }
    return { ...letter, status: "locked" };
  });
}

export function completeLetter(letterId) {
  const rewardNodeId = getLetterRewardNodeId(letterId);
  if (rewardNodeId) completeLessonNode(rewardNodeId, { completedLetterId: letterId });
  return getProgress();
}

// Signing out must also forget the active profile; otherwise the next child on this device
// would keep writing into the previous child's progress.
export function clearSession() {
  const user = getUser();
  if (user?.email) {
    try { writeAuthUsers(getAuthUsers()); } catch { /* The account list stays as it was. */ }
  }
  writeValue(storageKeys.sessionActive, "false");
  if (canUseStorage()) {
    try { window.localStorage.removeItem(storageKeys.user); } catch { /* unavailable */ }
  }
  if (typeof document !== "undefined") document.body.classList.remove("dark-mode");
  if (typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("backgroundThemeChange"));
    window.dispatchEvent(new CustomEvent("profilePreferencesChange", { detail: getProfilePreferences() }));
  }
}

export function hasActiveProfile() {
  return Boolean(getUser()?.email) && getSessionActive();
}

export function setCurrentQuranLevel(level) {
  writeValue(storageKeys.currentQuranLevel, level);
}

export function setReadingStreak(count) {
  writeValue(storageKeys.readingStreak, count);
}

export function addMemorizedSurah(surahId) {
  return memorizeSurah(surahId);
}

export function removeMemorizedSurah(surahId) {
  const state = getQuranState();
  const memorizedSurahs = state.memorizedSurahs.filter((id) => id !== surahId);
  writeJson(storageKeys.memorizedSurahs, memorizedSurahs);
  return memorizedSurahs;
}

export function setLessonPathState(state) {
  writeValue(storageKeys.currentLessonNode, state.currentLessonNode);
  writeJson(storageKeys.completedLessonNodes, state.completedLessonNodes);
  writeValue(storageKeys.currentChapter, state.currentChapter);
  writeJson(storageKeys.completedChapters, state.completedChapters);
  if (state.currentMission !== undefined) writeJson(storageKeys.currentMission, state.currentMission);
}
