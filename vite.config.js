import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the app from /Al-Ilm/. VITE_BASE lets the local Pages build
// (scripts/buildPages.mjs) use the same base as CI.
const base = process.env.VITE_BASE || (process.env.GITHUB_ACTIONS ? "/Al-Ilm/" : "/");

// Stamps public/sw.js with a hash of the emitted bundle so each deploy replaces old caches.
function serviceWorkerVersion() {
  let outDir = "dist";
  const hash = createHash("sha256");
  return {
    name: "al-ilm-sw-version",
    apply: "build",
    configResolved(config) { outDir = config.build.outDir; },
    generateBundle(_, bundle) {
      for (const name of Object.keys(bundle).sort()) hash.update(name);
    },
    closeBundle() {
      const file = join(outDir, "sw.js");
      if (!existsSync(file)) return;
      const source = readFileSync(file, "utf8");
      const version = hash.digest("hex").slice(0, 12);
      writeFileSync(file, source.replace('const CACHE_VERSION = "dev";', `const CACHE_VERSION = "${version}";`));
    }
  };
}

export default defineConfig({
  base,
  plugins: [react(), serviceWorkerVersion()],
  build: {
    chunkSizeWarningLimit: 1500
  },
  server: {
    host: "0.0.0.0",
    port: 5174
  }
});
