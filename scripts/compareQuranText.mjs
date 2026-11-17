/** Exact publisher-file comparison; does not infer religious accuracy from Unicode. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const EXPECTED_AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
export const TANZIL_URL = "https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&agree=true";

export function parseTanzilText(text) {
  const ayahs = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\|(\d+)\|(.+)$/u);
    if (!match) continue;
    const surah = Number(match[1]), ayah = Number(match[2]), ref = `${surah}:${ayah}`;
    if (!EXPECTED_AYAH_COUNTS[surah - 1] || ayah < 1 || ayah > EXPECTED_AYAH_COUNTS[surah - 1]) throw new Error(`Invalid reference ${ref}`);
    if (ayahs.has(ref)) throw new Error(`Duplicate reference ${ref}`);
    ayahs.set(ref, match[3]);
  }
  if (ayahs.size !== 6236) throw new Error(`Incomplete reference: ${ayahs.size}/6236 ayahs`);
  return ayahs;
}

export function compareQuran(surahs, reference) {
  if (!(reference instanceof Map) || reference.size !== 6236) throw new Error("Complete 6236-ayah reference required");
  if (!Array.isArray(surahs) || surahs.length !== 114) throw new Error("Complete 114-surah app data required");
  const seen = new Set(), differences = [];
  for (const surah of surahs) {
    if (surah.ayahs?.length !== EXPECTED_AYAH_COUNTS[surah.number - 1]) throw new Error(`Incomplete surah ${surah.number}`);
    for (const ayah of surah.ayahs) {
      const ref = `${surah.number}:${ayah.number}`;
      if (seen.has(ref) || !reference.has(ref)) throw new Error(`Duplicate or unknown app reference ${ref}`);
      seen.add(ref);
      if (ayah.arabic !== reference.get(ref)) differences.push(ref);
    }
  }
  if (seen.size !== reference.size) throw new Error("App/reference coverage mismatch");
  return { checked: seen.size, exactMatches: seen.size - differences.length, differences };
}

async function main() {
  const online = process.argv.includes("--online");
  let report, failed = false;
  try {
    let bytes;
    if (online) {
      const response = await fetch(TANZIL_URL, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`Publisher download failed: HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    } else bytes = await readFile(resolve(root, "src/data/sources/tanzil-uthmani.txt"));
    const text = bytes.toString("utf8");
    if (!text.includes("TERMS OF USE")) throw new Error("Publisher license notice missing");
    const reference = parseTanzilText(text);
    const { quranSurahs, quranTextSource } = await import(pathToFileURL(resolve(root, "src/data/quranContent.js")));
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (!online && sha256 !== quranTextSource.sha256) throw new Error("Pinned publisher file checksum changed");
    const result = compareQuran(quranSurahs, reference);
    failed = result.differences.length > 0;
    report = [
      "# Quran publisher-file comparison", "", `Checked: ${new Date().toISOString()}`, "",
      `Reference: [Tanzil Project, Uthmani 1.1](${TANZIL_URL}) (${online ? "downloaded during this check" : "pinned local publisher download"}).`,
      `SHA-256: ${sha256}.`, "",
      `Ayahs checked: ${result.checked}. Exact matches: ${result.exactMatches}. Differences: ${result.differences.length}.`, "",
      failed ? "**FAILED: unresolved character differences.** No differences are automatically classified as harmless." : "**PASS: all 6,236 exported Arabic texts exactly match the complete reference file.**", "",
      "No diacritics, hamza, whitespace, or basmala are removed for comparison.",
      "This checks faithful copying of this publisher's edition. It does not independently certify religious meaning, pronunciation, translations, teaching notes, or audio.", "",
      "Russian ayah translations and legacy word glosses are not exposed because their edition and provenance have not been established.",
      ...(failed ? ["", "References requiring review:", result.differences.join(", ")] : []), ""
    ].join("\n");
  } catch (error) {
    failed = true;
    report = `# Quran publisher-file comparison\n\n**FAILED / NOT VERIFIED**\n\n${error.message}\n\nNo positive accuracy conclusion can be made from an incomplete or unavailable reference.\n`;
  }
  await writeFile(resolve(root, "QURAN_DIFF_REPORT.md"), report, "utf8");
  console.log(report);
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
