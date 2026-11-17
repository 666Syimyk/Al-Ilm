# Al-Ilm

Educational React SPA for Muslim children (ages 4–12) learning Arabic letters, Quran reading, and Islamic prayer. Russian UI. Gamified (Duolingo-style). No backend — localStorage only.

## Open The App

https://666syimyk.github.io/Al-Ilm/

## Local Development

Requires Node 22.15 or newer (Node 24 recommended for this workspace).

```bash
npm install
npm run dev        # localhost:5174
npm run verify     # tests + content validation + production build + bundle check
npm test           # storage, learning, audio, prayer times, content and service worker regressions
npm run validate:content  # Islamic content safety validation
npm run verify:quran     # exact comparison against the pinned Tanzil reference
npm run optimize:images  # after replacing a PNG in src/assets: regenerate WebP and PWA icons
```

## Deploy

GitHub Pages serves the `docs/` folder of `main`. After any change:

```bash
npm run build:pages
```

then commit `docs/` together with the source. `build:pages` fails if the built site contains unverified translations, a locked orientation, oversized images or an unversioned service worker. CI (`.github/workflows/ci.yml`) runs the same checks and fails when `docs/` is older than the source.

## Data Sources

| Content | Source | Status |
|---------|--------|--------|
| Arabic Quran text | [Tanzil Uthmani 1.1](https://tanzil.net/download/) | Exact comparison of all 6,236 ayahs; reference and license retained |
| Russian translation of meanings | No confirmed edition/version with established reuse terms | Hidden; legacy data retained in `archive/reference/quranContent.legacy.js.txt` |
| Audio recitation | [EveryAyah.com](https://everyayah.com/) — Mishary Rashid Alafasy, 128kbps | 36 core MP3 recordings downloaded and publisher MD5 checked; remaining ayahs stream from CDN |
| Word-by-word (tafsir words) | Disabled until verified data available | ✗ Disabled |
| Tajweed rules | Educational reference only | ⚠ Not a substitute for a teacher |
| 99 Names of Allah | Based on hadith (Tirmidhi 3507) — simplified meanings for children | ⚠ Review needed |
| Prophet stories | Based on Quranic references + Ibn Kathir tafsir | ⚠ Summaries, not full tafsir |
| Namaz texts | Authentic hadith (Bukhari, Muslim, Tirmidhi) | ⚠ Transliteration needs review |
| Namaz order | Hanafi school, separate postures for boys and girls | ⚠ Needs review by an imam before public launch |
| Prayer times | adhan library, selectable method, ±30 min per-prayer correction to match the local mosque | ⚠ Users are told to compare with their muftiate |
| Qibla | Great-circle bearing + magnetic declination (WMM 2025) + screen rotation | ⚠ Phone compass accuracy varies |

## Islamic Content Safety

This app teaches religious content to children. We apply strict content safety rules:

- **Quran Arabic is copied unchanged from the pinned Tanzil source**. Educational summaries and transliterations are not certified translations or scholarly rulings.
- **No browser TTS for Quran** — ayah audio uses downloaded EveryAyah recordings, then CDN fallback; no synthesized replacement. Some non-Quran Arabic learning material still uses explicitly labeled browser speech.
- **No fake word-by-word translations** — the word-by-word section shows only verified data or a "coming soon" message
- **Translation labeled as "translation of meanings"** (перевод смыслов), not "translation of the Quran"
- **Tajweed highlights are educational aids**, not a verified recitation check
- **Sources page** is accessible from Profile → Источники данных

Run `npm run validate:content` to check content safety before each deploy.

See [content verification](docs/content-verification.md) for current sources, reproducible checks and reuse limitations, and [responsive QA](docs/responsive-qa.md) for the interface verification scope. Earlier audit reports describe the state before these fixes.

## Local-only profiles

Profiles and progress live in this browser, separated by account. They are not cloud accounts and are not protected against someone with access to browser storage. There is no master password. A forgotten password is reset on the device with the child's registered first name and date of birth. Signing out forgets the active profile, and every learning screen requires a signed-in profile.

Clearing browser data removes progress, so Profile → Мои данные offers a backup file and restore. If the browser refuses to save, the app shows a warning instead of silently losing progress. Prayer reminders require the Namaz screen to stay open and browser permission; closed-app push scheduling is not implemented. Speech checks use the browser's recognition service, which may send audio to Google or Apple; the app tells parents this.
