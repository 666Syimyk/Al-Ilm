/**
 * Islamic Content Validator for Al-Ilm
 *
 * Imports quranContent.js directly to catch runtime errors (missing functions,
 * wrong exports) as well as structural data problems.
 *
 * Run with: npm run validate:content
 * Exits 1 if any ERROR is found. Warnings are informational.
 */

import { readFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { createHash } from "node:crypto";
import { compareQuran, parseTanzilText } from "./compareQuranText.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let errors = [];
let warnings = [];

function error(msg) { errors.push(msg); console.error(`  ERROR: ${msg}`); }
function warn(msg)  { warnings.push(msg); console.warn(`  WARN:  ${msg}`); }
function pass(msg)  { console.log(`  OK:    ${msg}`); }

// ── Reference ayah counts per surah (index = surah number) ───────────────────
const SURAH_AYAH_COUNTS = [
  0, // placeholder — index 1 = surah 1
  7,286,200,176,120,165,206,75,129,109,
  123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,
  34,30,73,54,45,83,182,88,75,85,
  54,53,89,59,37,35,38,29,18,45,
  60,49,62,55,78,96,29,22,24,13,
  14,11,11,18,12,12,30,52,52,44,
  28,28,20,56,40,31,50,40,46,42,
  29,19,36,25,22,17,19,26,30,20,
  15,21,11,8,8,19,5,8,8,11,
  11,8,3,9,5,4,7,3,6,3,
  5,4,5,6  // 111 al-masad=5, 112 al-ikhlas=4, 113 al-falaq=5, 114 an-nas=6
];
const EXPECTED_TOTAL_AYAHS = SURAH_AYAH_COUNTS.slice(1).reduce((a, b) => a + b, 0); // 6236

console.log("\n=== Al-Ilm Islamic Content Validator ===\n");

// ── 1. Source-level checks (regex on raw text) ────────────────────────────────
console.log("1. Source-level checks on quranContent.js...");

const quranSrc = readFileSync(join(root, "src/data/quranContent.js"), "utf8");

// Must NOT contain buildAyahWords
if (/buildAyahWords/.test(quranSrc)) {
  error("buildAyahWords still referenced in quranContent.js — remove all usages");
} else {
  pass("buildAyahWords is fully removed");
}

// Must NOT contain fake word placeholders
if (/`слово\s*\$\{|meaning:\s*`слово|"слово \d+"/i.test(quranSrc)) {
  error("Fake 'слово N' word placeholder found in quranContent.js");
} else {
  pass("No fake 'слово N' placeholders");
}

// Must NOT contain broken encoding
const brokenPatterns = [
  { re: /в•ђ/,          label: "broken box-drawing chars в•ђ" },
  { re: /вРай\b/,       label: "missing space: вРай" },
  { re: /иЗуль/,        label: "missing space: иЗуль" },
  { re: /СѓСЂРѕРєРѕРІ/, label: "Cyrillic mojibake СѓСЂ..." },
];
for (const { re, label } of brokenPatterns) {
  if (re.test(quranSrc)) error(`Broken encoding in quranContent.js: ${label}`);
  else pass(`No broken encoding: ${label}`);
}

// ── 2. Runtime import — catches ReferenceError / SyntaxError ─────────────────
console.log("\n2. Runtime import of quranContent.js...");

let quranSurahs, getAyahWords;
try {
  const mod = await import(
    pathToFileURL(join(root, "src/data/quranContent.js")).href
  );
  quranSurahs = mod.quranSurahs;
  getAyahWords = mod.getAyahWords;
  pass("quranContent.js imported successfully (no ReferenceError)");
} catch (err) {
  error(`quranContent.js import FAILED: ${err.message}`);
  // Fatal — cannot continue structural checks
  console.error("\nValidation FAILED — fix the import error first.\n");
  process.exit(1);
}

// ── 3. Structural checks on quranSurahs ──────────────────────────────────────
console.log("\n3. Structural checks on quranSurahs...");

if (!Array.isArray(quranSurahs)) {
  error("quranSurahs is not an array");
} else {
  pass(`quranSurahs is an array`);

  // Surah count
  if (quranSurahs.length === 114) {
    pass("quranSurahs.length === 114");
  } else {
    error(`quranSurahs.length === ${quranSurahs.length} (expected 114)`);
  }

  // Duplicate IDs / numbers
  const ids = quranSurahs.map((s) => s.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) error(`Duplicate surah IDs: ${dupIds.join(", ")}`);
  else pass("No duplicate surah IDs");

  const nums = quranSurahs.map((s) => s.number);
  const dupNums = nums.filter((n, i) => nums.indexOf(n) !== i);
  if (dupNums.length) error(`Duplicate surah numbers: ${dupNums.join(", ")}`);
  else pass("No duplicate surah numbers");

  // Total ayah count
  const totalAyahs = quranSurahs.reduce((sum, s) => sum + (s.ayahs?.length || 0), 0);
  if (totalAyahs === EXPECTED_TOTAL_AYAHS) {
    pass(`Total ayahs === ${EXPECTED_TOTAL_AYAHS}`);
  } else if (totalAyahs === 0) {
    warn("No filled ayahs found — all surahs have empty ayahs arrays (expected for partial data)");
  } else {
    warn(`Total filled ayahs: ${totalAyahs} (full Quran = ${EXPECTED_TOTAL_AYAHS}; partial data is OK)`);
  }

  // Per-surah ayah count check (for surahs that have ayahs)
  let surahCountErrors = 0;
  for (const surah of quranSurahs) {
    const expected = SURAH_AYAH_COUNTS[surah.number];
    const actual = surah.ayahs?.length || 0;
    if (actual > 0 && expected && actual !== expected) {
      error(`Surah ${surah.number} (${surah.id}): expected ${expected} ayahs, found ${actual}`);
      surahCountErrors++;
    }
  }
  if (surahCountErrors === 0) pass("All filled surahs have correct ayah counts");

  // No empty arabic text
  let emptyArabic = 0;
  for (const surah of quranSurahs) {
    for (const ayah of (surah.ayahs || [])) {
      if (!ayah.arabic || String(ayah.arabic).trim() === "") {
        error(`Empty arabic text: surah ${surah.id} ayah ${ayah.number}`);
        emptyArabic++;
        if (emptyArabic >= 5) { error("...too many empty arabic fields, stopping enumeration"); break; }
      }
    }
    if (emptyArabic >= 5) break;
  }
  if (emptyArabic === 0) pass("No ayahs with empty arabic text");
}

// ── 4. getAyahWords() behaviour ───────────────────────────────────────────────
console.log("\n4. Checking getAyahWords() behaviour...");

if (typeof getAyahWords !== "function") {
  error("getAyahWords is not exported from quranContent.js");
} else {
  pass("getAyahWords is exported");

  // With undefined / null / empty ayah → must return []
  for (const input of [undefined, null, {}, { words: [] }, { words: null }]) {
    const result = getAyahWords(input);
    if (!Array.isArray(result) || result.length !== 0) {
      error(`getAyahWords(${JSON.stringify(input)}) should return [] but returned ${JSON.stringify(result)}`);
    }
  }
  pass("getAyahWords returns [] for empty/missing words");

  // With arabic-only ayah (no words) → must NOT auto-generate "слово N"
  const mockAyah = { arabic: "بِسْمِ اللَّهِ", words: [] };
  const fakeResult = getAyahWords(mockAyah);
  if (fakeResult.length > 0) {
    const hasFake = fakeResult.some((w) => /слово/i.test(String(w.meaning || "")));
    if (hasFake) error("getAyahWords still generates fake 'слово N' meanings");
    else error("getAyahWords generates words from arabic text (should return [] when words is empty)");
  } else {
    pass("getAyahWords does NOT auto-generate words when words: [] — returns []");
  }

  // Plausible words without explicit provenance must not pass as verified.
  const ayahWithWords = {
    arabic: "بِسْمِ اللَّهِ",
    words: [{ arabic: "بِسْمِ", reading: "бисми", meaning: "с именем" }]
  };
  const realResult = getAyahWords(ayahWithWords);
  if (realResult.length === 0) {
    pass("getAyahWords hides word glosses without verified source metadata");
  } else {
    error("getAyahWords exposes unverified word glosses");
  }
}

// ── 5. Checks on other files ──────────────────────────────────────────────────
console.log("\n5. Checking other data files...");

const otherFiles = [
  "src/data/namazGuide.js",
  "src/data/tajweedRules.js",
  "src/data/readingTexts.js",
  "src/screens/QuranReadingScreen.js",
  "src/screens/NamazScreen.jsx",
];
for (const rel of otherFiles) {
  const src = readFileSync(join(root, rel), "utf8");
  let ok = true;
  if (/в•ђ/.test(src))             { error(`Broken box-drawing in ${rel}`); ok = false; }
  if (/СѓСЂРѕРєРѕРІ/.test(src))    { error(`Cyrillic mojibake in ${rel}`); ok = false; }
  if (ok) pass(`No encoding issues: ${rel}`);
}

// TTS safety in Quran screens
const ttsChecks = [
  { path: "src/screens/AyahLessonScreen.jsx",  pattern: /speakText\s*\(\s*ayah\.arabic/ },
  { path: "src/screens/MemorizationScreen.jsx", pattern: /speakText\s*\(\s*ayah\.arabic/ },
  { path: "src/screens/SurahDetailScreen.jsx",  pattern: /speakText\s*\(\s*ayah\.arabic/ },
];
for (const { path: rel, pattern } of ttsChecks) {
  const src = readFileSync(join(root, rel), "utf8");
  if (pattern.test(src)) error(`TTS used for Quran ayahs in ${rel}`);
  else pass(`TTS not used for Quran ayahs: ${rel}`);
}

// readingTexts note fix
const readingSrc = readFileSync(join(root, "src/data/readingTexts.js"), "utf8");
if (/note:\s*["']Первый аят суры Аль-Фатиха["']/.test(readingSrc)) {
  error("readingTexts.js: alhamdulillah still mislabelled as 'Первый аят'");
} else {
  pass("readingTexts.js alhamdulillah label is correct");
}

// namazGuide transliteration
const namazSrc = readFileSync(join(root, "src/data/namazGuide.js"), "utf8");
if (namazSrc.includes("Мааляки")) error("namazGuide.js: 'Мааляки' should be 'Маалики'");
else pass("namazGuide.js transliteration Маалики is correct");

// Audio URL format in quranAudio.js
const audioSrc = readFileSync(join(root, "src/utils/quranAudio.js"), "utf8");
const padCount = (audioSrc.match(/padStart\(3/g) || []).length;
if (padCount >= 2 && audioSrc.includes("everyayah.com")) {
  pass("quranAudio.js: 3-digit SSS+AAA.mp3 format (EveryAyah)");
} else {
  warn("quranAudio.js: verify SSS+AAA.mp3 format is correct");
}

// ── 6. Stage 2: Source metadata, TTS safety, UI safety ───────────────────────
console.log("\n6. Stage 2 checks: source metadata, TTS safety, UI safety...");

// 6a. translationSource exported from quranContent.js
{
  const mod = await import(pathToFileURL(join(root, "src/data/quranContent.js")).href + "?v2");
  if (mod.translationSource) {
    if (!mod.translationSource.verified && mod.translationSource.needsReview) {
      pass("translationSource exported and marked needsReview (correct for unconfirmed translation)");
    } else if (mod.translationSource.verified && !mod.translationSource.source) {
      error("translationSource: verified=true but no source — must provide source before verifying");
    } else {
      pass("translationSource exported from quranContent.js");
    }
  } else {
    error("translationSource not exported from quranContent.js — add source metadata");
  }
}

// 6b. namazSourceMetadata exported from namazGuide.js
{
  const namazMod = await import(pathToFileURL(join(root, "src/data/namazGuide.js")).href + "?v2").catch(() => null);
  if (namazMod && namazMod.namazSourceMetadata) {
    pass("namazSourceMetadata exported from namazGuide.js");
  } else {
    error("namazSourceMetadata not exported from namazGuide.js — add source metadata object");
  }
}

// 6c. allahNamesSource exported from allahNames.js
{
  const allahMod = await import(pathToFileURL(join(root, "src/data/allahNames.js")).href + "?v2").catch(() => null);
  if (allahMod && allahMod.allahNamesSource) {
    pass("allahNamesSource exported from allahNames.js");
  } else {
    error("allahNamesSource not exported from allahNames.js — add source metadata object");
  }
}

// 6d. prophetStoriesDisclaimer exported from prophetsData.js
{
  const prophetMod = await import(pathToFileURL(join(root, "src/data/prophetsData.js")).href + "?v2").catch(() => null);
  if (prophetMod && prophetMod.prophetStoriesDisclaimer) {
    if (prophetMod.prophetStoriesDisclaimer.isSummary === true) {
      pass("prophetStoriesDisclaimer exported with isSummary:true from prophetsData.js");
    } else {
      error("prophetStoriesDisclaimer.isSummary must be true in prophetsData.js");
    }
  } else {
    error("prophetStoriesDisclaimer not exported from prophetsData.js — add disclaimer object");
  }
}

// 6e. All dailyDuas have source fields; verified:true requires source
{
  const duasMod = await import(pathToFileURL(join(root, "src/data/dailyDuas.js")).href + "?v2").catch(() => null);
  if (!duasMod) {
    error("src/data/dailyDuas.js could not be imported");
  } else {
    const duas = duasMod.dailyDuas || duasMod.default;
    if (!Array.isArray(duas)) {
      warn("dailyDuas.js: expected array export 'dailyDuas' — skipping field checks");
    } else {
      let duasOk = true;
      for (const dua of duas) {
        if (!dua.source) {
          error(`dailyDuas.js: dua "${dua.id || dua.title}" has no source field`);
          duasOk = false;
        }
        if (dua.verified === true && !dua.source) {
          error(`dailyDuas.js: dua "${dua.id}" has verified:true but no source`);
          duasOk = false;
        }
      }
      if (duasOk) pass(`All ${duas.length} dailyDuas have source fields`);
    }
  }
}

// 6f. No "перевод Корана" in UI Quran screens (must say "перевод смыслов")
{
  const quranScreens = [
    "src/screens/SurahDetailScreen.jsx",
    "src/screens/AyahLessonScreen.jsx",
    "src/screens/MemorizationScreen.jsx",
    "src/screens/QuranSearchScreen.jsx",
    "src/screens/ReadingScreen.jsx",
  ];
  const badPhrase = /перевод\s+Корана/i;
  let translationLabelOk = true;
  for (const rel of quranScreens) {
    let src;
    try { src = readFileSync(join(root, rel), "utf8"); } catch { continue; }
    if (badPhrase.test(src)) {
      error(`"перевод Корана" found in ${rel} — must use "перевод смыслов"`);
      translationLabelOk = false;
    }
  }
  if (translationLabelOk) pass('No "перевод Корана" label in Quran screens (correct: "перевод смыслов")');
}

// 6g. ReadingScreen blocks TTS for quran category
{
  const readingScreenSrc = readFileSync(join(root, "src/screens/ReadingScreen.jsx"), "utf8");
  if (/category\s*===\s*["']quran["']/.test(readingScreenSrc)) {
    pass("ReadingScreen.jsx: TTS blocked for quran category");
  } else {
    error("ReadingScreen.jsx: no TTS block for category==='quran' found — Quran ayahs may be read via browser TTS");
  }
}

// 6h. AyahLessonScreen shows placeholder when words is empty (not silently hidden)
{
  const ayahScreenSrc = readFileSync(join(root, "src/screens/AyahLessonScreen.jsx"), "utf8");
  if (/готовится/.test(ayahScreenSrc)) {
    pass("AyahLessonScreen.jsx: shows 'готовится' placeholder for empty word-by-word");
  } else {
    error("AyahLessonScreen.jsx: no 'готовится' placeholder for empty words — user may see no word-by-word section at all");
  }
}

// 6i. NamazScreen does not call speakText with Arabic step text directly
{
  const namazScreenSrc = readFileSync(join(root, "src/screens/NamazScreen.jsx"), "utf8");
  if (/function\s+speak\s*\(\s*text\s*\)\s*\{[\s\S]*?speakText/.test(namazScreenSrc)) {
    error("NamazScreen.jsx: dead speak() wrapper still present — remove it");
  } else {
    pass("NamazScreen.jsx: no unwrapped speakText for Arabic namaz steps");
  }
}

// Exact source fidelity and downloaded audio integrity; not a theological audit.
console.log("\n7. Publisher corpus and recorded audio integrity...");
try {
  const raw = readFileSync(join(root, "src/data/sources/tanzil-uthmani.txt"));
  const corpus = JSON.parse(readFileSync(join(root, "src/data/sources/tanzil-uthmani.json"), "utf8"));
  if (createHash("sha256").update(raw).digest("hex") !== corpus.sha256) error("Tanzil raw file checksum mismatch");
  if (!corpus.copyrightNotice.includes("TERMS OF USE")) error("Tanzil notice missing");
  const result = compareQuran(quranSurahs, parseTanzilText(raw.toString("utf8")));
  if (result.differences.length) error(`Arabic differs from publisher file: ${result.differences.join(", ")}`);
  else pass("6236 exported Arabic ayahs exactly match the complete publisher file");
  if (quranSurahs.some(s => s.ayahs.some(a => a.translation || a.words?.length))) error("Unverified legacy Quran translation or word gloss exposed");
  else pass("Unverified legacy translations and word glosses are not exposed");
  const manifest = JSON.parse(readFileSync(join(root, "src/data/sources/recorded-audio.json"), "utf8"));
  const requiredRefs = [[1, 7], [112, 4], [113, 5], [114, 6], [108, 3], [103, 3], [109, 6]].flatMap(([surah, count]) => Array.from({ length: count }, (_, i) => `${surah}:${i + 1}`)).concat(["17:24", "20:114"]);
  if (requiredRefs.some(ref => !manifest.files[ref])) throw new Error("Core recorded ayah audio is incomplete");
  for (const [ref, item] of Object.entries(manifest.files)) {
    if (!/^audio\/quran\/alafasy\/\d{6}\.mp3$/.test(item.path)) throw new Error(`Unsafe asset path: ${item.path}`);
    const filename = `${ref.split(":").map(number => number.padStart(3, "0")).join("")}.mp3`;
    if (!item.path.endsWith(filename) || item.sourceUrl !== `https://everyayah.com/data/Alafasy_128kbps/${filename}`) throw new Error(`Recorded asset reference mismatch: ${ref}`);
    const bytes = readFileSync(join(root, "public", item.path));
    if (createHash("sha256").update(bytes).digest("hex") !== item.sha256 || createHash("md5").update(bytes).digest("hex") !== item.publisherMd5) throw new Error(`Recorded asset checksum mismatch: ${ref}`);
  }
  pass(`${Object.keys(manifest.files).length} local MP3s checked against saved hashes and publisher MD5`);
} catch (cause) { error(cause.message); }

console.log("\nScope: structure, exact publisher copying, metadata and file integrity only. Religious interpretation, pronunciation, and legacy teaching notes are not certified by these checks.");

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(42));
console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.error("\nValidation FAILED — fix errors above.\n");
  process.exit(1);
} else if (warnings.length > 0) {
  console.log("\nValidation PASSED with warnings — review above.\n");
} else {
  console.log("\nValidation PASSED. All checks clean.\n");
}
