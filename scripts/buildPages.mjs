// Builds the GitHub Pages site into docs/ (Pages source: main branch, /docs folder).
// Hand-made Markdown in docs/ is kept; every generated file is replaced, so docs/ can
// never again serve an older build than the source.
// Usage: npm run build:pages
import { copyFileSync, cpSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "vite";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const docs = join(root, "docs");

process.env.VITE_BASE = "/Al-Ilm/";
await build({ root, logLevel: "warn" });

for (const entry of readdirSync(docs)) {
  if (!entry.endsWith(".md")) rmSync(join(docs, entry), { recursive: true, force: true });
}
cpSync(dist, docs, { recursive: true });
// GitHub Pages answers unknown paths with 404.html; serving the app shell keeps deep links working.
copyFileSync(join(docs, "index.html"), join(docs, "404.html"));

const check = spawnSync(process.execPath, [join(root, "scripts", "checkBuild.mjs"), docs], { stdio: "inherit" });
process.exit(check.status ?? 1);
