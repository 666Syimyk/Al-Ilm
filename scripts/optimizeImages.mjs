// Converts the PNG design sources in src/assets to WebP files that the app imports,
// and renders the PWA icons. The PNGs stay as editable originals and are not bundled.
// Run after replacing any image: node scripts/optimizeImages.mjs
import { readdirSync, statSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const assets = join(root, "src", "assets");

const profiles = {
  backgrounds: { quality: 78 },
  characters: { quality: 86, alphaQuality: 90, width: 768 },
  prayer: { quality: 88, alphaQuality: 92 },
  brand: { quality: 88, width: 512 }
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
}

let before = 0;
let after = 0;
for (const file of walk(assets).filter((path) => path.endsWith(".png"))) {
  const group = Object.keys(profiles).find((name) => file.includes(`${name}`));
  const { width, ...options } = profiles[group] || { quality: 82 };
  const target = file.replace(/\.png$/, ".webp");
  let image = sharp(file);
  if (width) image = image.resize({ width, withoutEnlargement: true });
  await image.webp({ ...options, effort: 6 }).toFile(target);
  before += statSync(file).size;
  after += statSync(target).size;
  console.log(`${target.slice(root.length)}  ${(statSync(target).size / 1024).toFixed(0)} KB`);
}

const logo = join(assets, "brand", "al-ilm-logo.png");
const iconsDir = join(root, "public", "icons");
mkdirSync(iconsDir, { recursive: true });
for (const size of [192, 512]) {
  await sharp(logo).resize(size, size).png({ compressionLevel: 9, palette: true }).toFile(join(iconsDir, `icon-${size}.png`));
}
// Maskable icons need the artwork inside the central safe zone (80%).
await sharp(logo).resize(410, 410).extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#006F3D" })
  .png({ compressionLevel: 9, palette: true }).toFile(join(iconsDir, "icon-maskable-512.png"));
await sharp(logo).resize(180, 180).png({ compressionLevel: 9, palette: true }).toFile(join(iconsDir, "apple-touch-icon.png"));
await sharp(logo).resize(48, 48).png({ compressionLevel: 9 }).toFile(join(iconsDir, "favicon-48.png"));

console.log(`\nPNG ${(before / 1048576).toFixed(1)} MB -> WebP ${(after / 1048576).toFixed(1)} MB`);
