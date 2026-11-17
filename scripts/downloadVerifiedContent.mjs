/** Download source assets unchanged. Run manually; never runs during the build. */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTanzilText } from "./compareQuranText.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(root, "src/data/sources");
const publicDir = resolve(root, "public/audio/quran/alafasy");
const textUrl = "https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt-2&agree=true";
const audioBase = "https://everyayah.com/data/Alafasy_128kbps/";
const checksumUrl = `${audioBase}000_checksum.md5`;
const hash = (bytes, algorithm = "sha256") => createHash(algorithm).update(bytes).digest("hex");

async function download(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(sourceDir, { recursive: true });
await mkdir(publicDir, { recursive: true });
const downloadedAt = new Date().toISOString();
const raw = await download(textUrl);
const text = raw.toString("utf8");
const ayahs = Object.fromEntries(parseTanzilText(text));
if (!text.includes("TERMS OF USE")) throw new Error("Tanzil copyright notice missing");
const notice = text.slice(text.indexOf("#  Tanzil Quran Text"));
if (!notice.includes("Tanzil Quran Text") || !notice.includes("TERMS OF USE")) throw new Error("Full Tanzil notice missing");
const corpus = {
  source: "Tanzil Project", edition: "Uthmani", version: "1.1",
  sourceUrl: textUrl, sourcePage: "https://tanzil.net/download/",
  licenseUrl: "https://tanzil.net/docs/Text_License", downloadedAt,
  sha256: hash(raw), copyrightNotice: notice, ayahs
};
await writeFile(resolve(sourceDir, "tanzil-uthmani.txt"), raw);
await writeFile(resolve(sourceDir, "tanzil-uthmani.json"), `${JSON.stringify(corpus, null, 2)}\n`);
console.log(`Tanzil: ${Object.keys(ayahs).length} unchanged ayah texts`);

const checksums = await download(checksumUrl);
const expectedMd5 = new Map(checksums.toString("utf8").split(/\r?\n/).flatMap(line => {
  const match = line.match(/^([a-f\d]{32})\s+\*?(\d{6}\.mp3)$/i);
  return match ? [[match[2], match[1].toLowerCase()]] : [];
}));
const requests = [[1, 7], [112, 4], [113, 5], [114, 6], [108, 3], [103, 3], [109, 6]]
  .flatMap(([surah, count]) => Array.from({ length: count }, (_, i) => [surah, i + 1]));
requests.push([17, 24], [20, 114]);
const files = {};
for (const [surah, ayah] of requests) {
  const filename = `${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
  const expected = expectedMd5.get(filename);
  if (!expected) throw new Error(`No publisher checksum for ${filename}`);
  const path = `audio/quran/alafasy/${filename}`;
  const target = resolve(publicDir, filename);
  let bytes = await readFile(target).catch(() => null);
  if (!bytes || hash(bytes, "md5") !== expected) bytes = await download(`${audioBase}${filename}`);
  if (hash(bytes, "md5") !== expected) throw new Error(`Publisher checksum mismatch: ${filename}`);
  if (bytes.length < 1000 || !(bytes.subarray(0, 3).toString() === "ID3" || bytes[0] === 0xff)) {
    throw new Error(`Invalid MP3 header: ${filename}`);
  }
  await writeFile(target, bytes);
  files[`${surah}:${ayah}`] = { path, sourceUrl: `${audioBase}${filename}`, downloadedAt, bytes: bytes.length, sha256: hash(bytes), publisherMd5: expected };
}
const manifest = {
  provider: "EveryAyah", reciter: "Mishary Rashid Alafasy", format: "MP3 128 kbps",
  sourcePage: "https://everyayah.com/recitations_ayat.html", checksumUrl, downloadedAt,
  license: "Public download links; no explicit redistribution license located. Not a claim of public-domain or commercial reuse rights.",
  files
};
await writeFile(resolve(sourceDir, "recorded-audio.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`EveryAyah: ${Object.keys(files).length} MP3s, ${Object.values(files).reduce((n, f) => n + f.bytes, 0)} bytes; publisher MD5 matched`);
