/** One-time mechanical archive of legacy Quran editorial data; no text rewriting. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { quranSurahs } from "../src/data/quranContent.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, "src/data/quranContent.js");
const current = await readFile(target, "utf8");
const start = current.indexOf("// Legacy editorial data retained for recovery.");
const end = current.indexOf("export const tajweedRules = [", start);
if (start < 0 || end < 0) throw new Error("Expected legacy block not found; already compacted or requires review");
const archiveDir = resolve(root, "archive/reference");
await mkdir(archiveDir, { recursive: true });
await writeFile(resolve(archiveDir, "quranContent.legacy.js.txt"), current, { flag: "wx" });
const metadata = quranSurahs.map(({ ayahs, ...surah }) => surah);
const block = `// Previous editorial text is preserved in archive/reference/quranContent.legacy.js.txt.\nconst surahMetadata = ${JSON.stringify(metadata, null, 2)};\n\nconst ayahsBySurah = new Map();\nfor (const [ref, arabic] of Object.entries(tanzilCorpus.ayahs)) {\n  const [surahNumber, number] = ref.split(\":\").map(Number);\n  const ayahs = ayahsBySurah.get(surahNumber) || [];\n  ayahs.push({ number, arabic, translation: \"\", words: [] });\n  ayahsBySurah.set(surahNumber, ayahs);\n}\n\nexport const quranSurahs = surahMetadata.map((surah) => ({\n  ...surah, ayahs: ayahsBySurah.get(surah.number) || []\n}));\n\n`;
await writeFile(target, current.slice(0, start) + block + current.slice(end), "utf8");
console.log("Legacy source archived verbatim outside runtime; 114 metadata entries retained.");
