// Checks what users actually download, not the source tree. The 2026 production site
// shipped hidden translations and a phone-blocking overlay while every source check passed.
// Usage: node scripts/checkBuild.mjs [dist|docs]
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve(process.argv[2] || "dist");
const failures = [];
const fail = (message) => failures.push(message);

function walk(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]);
}

if (!existsSync(join(dir, "index.html"))) {
  console.error(`No build found in ${dir}`);
  process.exit(1);
}

const files = walk(dir);
const relative = (file) => file.slice(dir.length + 1).replaceAll("\\", "/");
const index = readFileSync(join(dir, "index.html"), "utf8");

for (const match of index.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const url = match[1];
  if (/^https?:/.test(url)) continue;
  // Pages builds use the /Al-Ilm/ base; local builds use /.
  const path = url.replace(/^\/Al-Ilm\//, "").replace(/^\//, "");
  if (path && !existsSync(join(dir, path))) fail(`index.html references a missing file: ${url}`);
}

for (const file of files.filter((path) => path.endsWith(".js"))) {
  const source = readFileSync(file, "utf8");
  const name = relative(file);
  if (/quranContent/.test(name)) {
    // Surah titles also carry a "translation" (e.g. «Открывающая»); only ayah objects count.
    const translations = source.match(/arabic:\s*[`"'][^`"']*[`"'],\s*translation:\s*[`"'][А-Яа-яЁё]/g)?.length || 0;
    const glosses = source.match(/meaning:\s*[`"'][А-Яа-яЁё]/g)?.length || 0;
    if (translations) fail(`${name}: ${translations} unverified Russian ayah translations are bundled`);
    if (glosses) fail(`${name}: ${glosses} unverified word glosses are bundled`);
  }
  if (source.includes("Поверните телефон горизонтально")) fail(`${name}: the rotate-phone overlay is still rendered`);
  if (/placeholder:\s*[`"']Введите пароль или 0000/.test(source)) fail(`${name}: the 0000 access hint is still shown`);
}

if (files.some((file) => /quranContent\.legacy/.test(file))) fail("the legacy translation archive is published");

const manifestPath = join(dir, "manifest.json");
if (!existsSync(manifestPath)) fail("manifest.json is missing");
else {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8").replace(/^﻿/, ""));
  if (manifest.orientation === "portrait") fail("manifest locks portrait orientation");
  for (const icon of manifest.icons || []) {
    if (!existsSync(join(dir, icon.src))) fail(`manifest icon is missing: ${icon.src}`);
  }
}

const sw = existsSync(join(dir, "sw.js")) ? readFileSync(join(dir, "sw.js"), "utf8") : "";
if (!sw) fail("sw.js is missing");
else if (sw.includes('const CACHE_VERSION = "dev";')) fail("sw.js was not stamped with a build version");

const oversized = files.filter((file) => /\.(png|jpe?g|webp)$/.test(file) && statSync(file).size > 600 * 1024);
for (const file of oversized) fail(`${relative(file)} is ${(statSync(file).size / 1024).toFixed(0)} KB; optimise images with scripts/optimizeImages.mjs`);

const total = files.reduce((sum, file) => sum + statSync(file).size, 0);
console.log(`${relative(dir) || dir}: ${files.length} files, ${(total / 1048576).toFixed(1)} MB`);
if (failures.length) {
  console.error(`\nBuild check FAILED:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Build check passed.");
