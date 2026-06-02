import { arabicLetters, getNextLetterId } from "../data/arabicLetters.js";
import { isBackgroundTheme } from "../data/backgroundThemes.js";
import { canOpenLessonNode, getChapterById, getLessonNodeById, getLetterRewardNodeId, getNextLessonNodeId, getNodeReward, getNodesByChapter } from "../data/lessonPath.js";

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

export const DEFAULT_ACCESS_PASSWORD = "0000";

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

function readValue(key) {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readJson(key, fallback = null) {
  const raw = readValue(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full; keep the app usable.
  }
}

function readNumber(key, fallback) {
  const value = readValue(key);
  return value === null || value === "" ? fallback : Number(value);
}

function writeValue(key, value) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage can be unavailable or full; keep the app usable.
  }
}

export function getDarkMode() {
  return readValue("darkMode") === "true";
}

export function setDarkMode(enabled) {
  writeValue("darkMode", enabled);
  document.body.classList.toggle("dark-mode", enabled);
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

function getDefaultChildBirthDate() {
  const today = new Date();
  const year = today.getFullYear() - 8;
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultAccessProfile(email) {
  const normalized = normalizeAuthEmail(email);

  return {
    name: "Ученик",
    firstName: "Ученик",
    lastName: "Al-Ilm",
    fullName: "Ученик Al-Ilm",
    dateOfBirth: getDefaultChildBirthDate(),
    email: normalized,
    preferredCharacter: "ahmad",
    createdAt: new Date().toISOString(),
    authProvider: "local-access-code"
  };
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
  writeJson(storageKeys.authUsers, users.map(safeUser));
}

export function setUser(user) {
  const currentUser = safeUser(user);
  writeJson(storageKeys.user, currentUser);

  if (currentUser?.email) {
    const normalized = normalizeAuthEmail(currentUser.email);
    const users = getAuthUsers();
    const exists = users.some((item) => normalizeAuthEmail(item.email) === normalized);
    const next = exists
      ? users.map((item) => normalizeAuthEmail(item.email) === normalized ? { ...item, ...currentUser } : item)
      : [...users, currentUser];
    writeAuthUsers(next);
  }
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
  writeJson(storageKeys.user, user);
  return user;
}

export async function loginLocalAccount(email, password) {
  const normalized = normalizeAuthEmail(email);
  const users = getAuthUsers();
  const user = users.find((item) => normalizeAuthEmail(item.email) === normalized);
  const isDefaultAccess = password === DEFAULT_ACCESS_PASSWORD;

  if (!user) {
    if (isDefaultAccess) {
      return createLocalAccount(createDefaultAccessProfile(normalized), DEFAULT_ACCESS_PASSWORD);
    }

    throw new Error("not-found");
  }

  const valid = isDefaultAccess || await verifyPassword(password, user.passwordHash, user.password);
  if (!valid) throw new Error("wrong-password");

  const passwordHash = user.passwordHash?.includes(":") ? user.passwordHash : await hashPassword(password);
  const migrated = safeUser({
    ...user,
    email: normalized,
    dateOfBirth: isDefaultAccess && !user.dateOfBirth ? getDefaultChildBirthDate() : user.dateOfBirth,
    preferredCharacter: user.preferredCharacter || "ahmad",
    passwordHash,
    lastLoginAt: new Date().toISOString()
  });
  const next = users.map((item) => normalizeAuthEmail(item.email) === normalized ? migrated : item);

  writeAuthUsers(next);
  writeJson(storageKeys.user, migrated);
  return migrated;
}

export async function resetLocalPassword(email, password) {
  const normalized = normalizeAuthEmail(email);
  const users = getAuthUsers();
  const user = users.find((item) => normalizeAuthEmail(item.email) === normalized);

  if (!user) throw new Error("not-found");

  const updated = safeUser({
    ...user,
    passwordHash: await hashPassword(password),
    updatedAt: new Date().toISOString()
  });
  const next = users.map((item) => normalizeAuthEmail(item.email) === normalized ? updated : item);

  writeAuthUsers(next);
  writeJson(storageKeys.user, updated);
  return updated;
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
  if (!isBackgroundTheme(theme)) return;
  writeValue(storageKeys.backgroundTheme, theme);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("backgroundThemeChange", { detail: theme }));
  }
}

export function getBackgroundCustomImage() {
  return readValue(storageKeys.backgroundCustomImage) || "";
}

export function setBackgroundCustomImage(imageData) {
  writeValue(storageKeys.backgroundCustomImage, imageData);
  setBackgroundTheme("custom");
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
    "quranStreak"
  ].forEach((key) => window.localStorage.removeItem(key));

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith("readToday_"))
    .forEach((key) => window.localStorage.removeItem(key));
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
    streakDays: studyDate === today ? readNumber("quranStreak", 0) : 0
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
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newStreak = lastDate === yesterday || lastDate === today ? (lastDate === today ? streak : streak + 1) : 1;
  if (canUseStorage()) {
    writeValue(storageKeys.quranStudyDate, today);
    writeValue("quranStreak", newStreak);
  }
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
  const tajweedProgress = state.tajweedProgress.includes(ruleId) ? state.tajweedProgress : [...state.tajweedProgress, ruleId];
  writeJson(storageKeys.tajweedProgress, tajweedProgress);
  return tajweedProgress;
}

export function getProgress() {
  return {
    completedLetters: readJson(storageKeys.completedLetters, defaultState.completedLetters),
    points: readNumber(storageKeys.points, defaultState.points),
    streak: readNumber(storageKeys.streak, defaultState.streak),
    level: readNumber(storageKeys.level, defaultState.level),
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
  return {
    currentLessonNode: readString(storageKeys.currentLessonNode, defaultLessonPathState.currentLessonNode),
    completedLessonNodes: readJson(storageKeys.completedLessonNodes, defaultLessonPathState.completedLessonNodes),
    currentChapter: readString(storageKeys.currentChapter, defaultLessonPathState.currentChapter),
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

  const nextNodeId = getNextLessonNodeId(nodeId);
  const nextNode = getLessonNodeById(nextNodeId);
  const reward = getNodeReward(node);
  const alreadyCompleted = lessonState.completedLessonNodes.includes(nodeId);
  const completedLessonNodes = lessonState.completedLessonNodes.includes(nodeId)
    ? lessonState.completedLessonNodes
    : [...lessonState.completedLessonNodes, nodeId];
  const currentLessonNode = nextNodeId;
  const completedLetterId = options.completedLetterId || (node.type === "reward" ? node.letterId : null);
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
  if (node.type === "quiz") achievements.add("no_errors");

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
  writeJson(storageKeys.completedLetters, progress.completedLetters);
  writeValue(storageKeys.points, progress.points);
  writeValue(storageKeys.streak, progress.streak);
  writeValue(storageKeys.level, progress.level);
  writeValue(storageKeys.coins, progress.coins);
  writeValue(storageKeys.stars, progress.stars ?? defaultState.stars);
  writeJson(storageKeys.achievements, progress.achievements);
  writeValue(storageKeys.currentLesson, progress.currentLesson);
  if (progress.completedHarakat !== undefined) writeJson(storageKeys.completedHarakat, progress.completedHarakat);
  if (progress.learnedVocabulary !== undefined) writeJson(storageKeys.learnedVocabulary, progress.learnedVocabulary);
  if (progress.completedGrammar !== undefined) writeJson(storageKeys.completedGrammar, progress.completedGrammar);
  if (progress.completedReadingTexts !== undefined) writeJson(storageKeys.completedReadingTexts, progress.completedReadingTexts);
}

export function getLettersWithStatus() {
  const progress = getProgress();

  return arabicLetters.map((letter) => {
    if (progress.completedLetters.includes(letter.id)) {
      return { ...letter, status: "completed" };
    }
    if (letter.id === progress.currentLesson) {
      return { ...letter, status: "current" };
    }
    return { ...letter, status: "locked" };
  });
}

export function completeLetter(letterId) {
  const progress = getProgress();
  const rewardNodeId = getLetterRewardNodeId(letterId);
  if (rewardNodeId && !canOpenLessonNode(rewardNodeId, getLessonPathState())) {
    return progress;
  }

  const alreadyCompleted = progress.completedLetters.includes(letterId);
  const completedLetters = alreadyCompleted ? progress.completedLetters : [...progress.completedLetters, letterId];
  const achievements = new Set(progress.achievements);
  const currentIndex = arabicLetters.findIndex((letter) => letter.id === letterId);
  const nextLetter =
    arabicLetters.find((letter, index) => index > currentIndex && !completedLetters.includes(letter.id)) ||
    arabicLetters.find((letter) => !completedLetters.includes(letter.id));

  achievements.add("young_student");
  if (completedLetters.length >= 3) achievements.add("letter_expert");
  if (progress.streak >= 5) achievements.add("strong_streak");
  if (completedLetters.length >= arabicLetters.length) achievements.add("alphabet_master");

  const nextState = {
    ...progress,
    completedLetters,
    points: progress.points,
    coins: progress.coins,
    level: Math.max(1, Math.floor(progress.points / 150) + 1),
    achievements: Array.from(achievements),
    currentLesson: nextLetter?.id || getNextLetterId(letterId)
  };

  setProgress(nextState);
  if (rewardNodeId) completeLessonNode(rewardNodeId, { completedLetterId: letterId });
  return getProgress();
}

export function clearSession() {
  writeValue(storageKeys.sessionActive, "false");
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
