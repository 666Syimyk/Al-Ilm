# Al-Ilm — Claude Code Context

Educational React SPA teaching Arabic alphabet, Quran, and Islamic prayer to Muslim children (ages 4–12). Russian UI. Gamified (Duolingo-style). No backend — localStorage only.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 (functional components + hooks only) |
| Router | React Router DOM 7 |
| Build | Vite 8, ES modules (`"type": "module"`), Node ≥ 22.15 |
| Icons | lucide-react |
| Prayer times | adhan (v4); magnetic declination for Qibla: geomagnetism (WMM) |
| Audio | Local/EveryAyah MP3 for Quran (never TTS); Web Speech API only for non-Quran Arabic |
| State | localStorage only — no Redux, no Context, no Zustand |
| CSS | Five files loaded in `main.jsx` order: `global.css`, `theme-polish.css`, `reference-redesign.css`, `mobile-app.css`, `responsive.css` (later wins; new rules go at the end of `responsive.css`) |
| Images | Edit PNG sources in `src/assets`, then `npm run optimize:images`; code imports the generated `.webp` |
| Fonts | Nunito (UI) + Noto Naskh Arabic (Arabic text) from Google Fonts |

**Dev:** `npm run dev` → localhost:5174  
**Verify before done:** `npm run verify` (tests + content validation + build + bundle check)  
**Deploy:** `npm run build:pages`, then commit `docs/` (GitHub Pages serves `docs/`; CI fails if it is stale)

---

## Project Structure

```
src/
├── App.jsx                  # Router, lazy imports, BottomNav logic
├── main.jsx                 # Entry, CSS imports
├── screens/                 # 32 full-page components (lazy-loaded)
├── components/              # 19 reusable UI components
├── games/                   # 5 mini-game components
├── data/                    # 10 data/constants files
├── utils/
│   └── storage.js           # ALL localStorage access — single source of truth
└── styles/                  # five layered files, see Tech Stack
public/
├── manifest.json            # PWA manifest (icons in public/icons)
└── sw.js                    # Service worker; CACHE_VERSION is stamped at build time
scripts/
├── checkBuild.mjs           # Checks the built output users download (dist/ or docs/)
├── buildPages.mjs           # Builds docs/ for GitHub Pages
└── optimizeImages.mjs       # PNG sources → WebP + PWA icons
archive/reference/           # Legacy unlicensed translation, kept out of the site
```

---

## Routing

All screens are `React.lazy()` imported. Routes are in `App.jsx`. BottomNav shows on `childPaths`.

**Route guard:** `resolveGuardRedirect` in `App.jsx` sends every non-public screen to `/welcome` without an active profile, and to `/age`, `/character` or `/adult-soon` until setup is done. Public: `/welcome /register /login /password-reset /sources`. Add a new onboarding screen to `setupPaths`.

```
/welcome → /register → /login → /age → /character → /home
                                      → /adult-soon (age > 12)

/home            ChildHomeScreen
/lessons         LessonsScreen
/alphabet        AlphabetScreen
/letter/:id      LetterLessonScreen
/game/:type/:id  MiniGameScreen
/reward/:id      RewardScreen
/checkpoint/:id  ChapterChallengeScreen (mode="checkpoint")
/boss/:id        ChapterChallengeScreen (mode="boss")

/namaz           NamazScreen

/quran                       QuranScreen
/quran/path                  QuranLearningPathScreen
/quran/surahs                SurahListScreen
/quran/surah/:surahId        SurahDetailScreen
/quran/ayah/:surahId/:num    AyahLessonScreen
/quran/tajweed               TajweedScreen
/quran/memorization          MemorizationScreen (?surah=id)
/quran/search                QuranSearchScreen
/quran/bookmarks             BookmarksScreen

/harakat, /harakat/:id       HarakatScreen
/vocabulary, /vocabulary/:id VocabularyScreen
/grammar, /grammar/:id       GrammarScreen
/reading, /reading/:id       ReadingScreen

/profile                     ProfileScreen
/profile/data                ProfileDataScreen
/backgrounds                 BackgroundSelectScreen
```

**childPaths** (show BottomNav): `/home /lessons /alphabet /namaz /quran /profile /harakat /vocabulary /grammar /reading`

**BottomNav tabs:** Home → /home, Lessons → /lessons, Namaz → /namaz, Quran → /quran, Profile → /profile

---

## State & Storage

**Golden rule: never touch `localStorage` directly. Use `storage.js` functions.**

### Key getters
```js
getUser()           // active profile { name, email, dateOfBirth, passwordHash, ... } or null
hasActiveProfile()  // signed-in profile exists and session is active
getAge()            // number or null
getSelectedCharacter() // "ahmad" | "amina" | null
getSessionActive()  // boolean
getProgress()       // { completedLetters, points, streak, level, coins, achievements, currentLesson, ... }
getLessonPathState() // { currentLessonNode, completedLessonNodes, currentChapter, completedChapters, currentMission }
getQuranState()     // { quranProgress, memorizedSurahs, bookmarkedAyahs, tajweedProgress, readingStreak }
getQuranTracking()  // { readAyahs, memorizedAyahs, difficultAyahs, favoriteSurahs, dailyGoal, todayReadCount, streakDays }
getBackgroundTheme() // theme ID string
```

### Key setters
```js
setUser(user)               setAge(age)               setSelectedCharacter(id)
setSessionActive(bool)      clearSession()
completeLetter(letterId)    completeLessonNode(nodeId, options)
memorizeSurah(surahId)      toggleBookmarkedAyah("surahId:num")
markAyahRead(ref)           markAyahMemorized(ref)    markAyahDifficult(ref)
toggleFavoriteSurah(id)     setDailyQuranGoal(n)      setLastOpenedSurah(id)
setBackgroundTheme(id)      setBackgroundCustomImage(base64)
```

### Accounts (local only, no server)
```js
createLocalAccount(profile, password)   loginLocalAccount(email, password)
resetLocalPassword(email, new, current) recoverLocalPassword(email, firstName, dateOfBirth, new)
clearSession()      // signs out AND removes the active `user`, so writes cannot reach that profile
exportAccountBackup() / importAccountBackup(json)   // file backup in Profile → Мои данные
```
There is no master password. `0000` only lets a pre-password legacy profile set a real password.
Failed writes dispatch `storageWriteFailed`; `App.jsx` shows a warning.

### Ayah reference format
```js
const ref = `${surahId}:${ayah.number}` // e.g. "al-fatihah:1"
```

---

## Data Files

### arabicLetters.js
```js
// 28 letters: { id, letter, nameRu, soundText, dotPlacement, dotGroup, status }
import { arabicLetters, getLetterById, getNextLetterId } from "../data/arabicLetters.js";
```

### quranContent.js
```js
// 114 surahs, all 6236 ayahs from Tanzil Uthmani 1.1 (exact copy). translation and words stay empty:
// no licensed Russian translation yet. Never add one without a versioned licence. Shape:
// { id, number, title, arabicTitle, translation, status, ayahs: [{ number, arabic, translation, words[] }] }
import { quranSurahs, quranSections, getSurahById, getAyahByNumber } from "../data/quranContent.js";
```

### namazGuide.js
```js
// PRAYERS[], buildPrayerGuide(prayer, { gender: "male" | "female" }) → flat steps array
// Hanafi order; posture notes differ for boys and girls (POSTURE_NOTES).
// Quran text comes from prayerAyahs.js (exact Tanzil lines, checked by tests) — not quranContent.js,
// so the prayer screen does not load the whole corpus. Quran ayahs have audioUrl; other duas use TTS.
import { PRAYERS, buildPrayerGuide } from "../data/namazGuide.js";
```

### prayerTimes.js
```js
// Uses adhan library + geolocation. Returns { nextPrayer, nextPrayerTime, countdown }
// Settings: { method, madhab, adjustments: { fajr..isha: ±30 min } } so families match their mosque.
import { prayerTimes, updateCountdown, requestPrayerTimes } from "../data/prayerTimes.js";
```

### Other data files
```
vocabularyData.js  → vocabularyThemes[], getWordsByTheme(themeId)
harakatData.js     → harakatList[], getHarakatById(id)
grammarData.js     → grammarLessons[], getGrammarLessonById(id)
readingTexts.js    → readingTexts[], readingCategories[], getTextById(id)
lessonPath.js      → lessonChapters[], lessonPathNodes[], getLessonNodeById(id)
backgroundThemes.js → backgroundThemes[], getBackgroundThemeById(id)
```

---

## Audio Patterns

Use the helpers in `src/utils/audioPlayback.js` (`playAudioSources`, `speakText`, `stopAllAudio`, `stopSpeech`) — never `new Audio()` or `speechSynthesis` directly.

- **Quran ayahs:** `getAyahAudioSources(surah, ayah)` in `src/utils/quranAudio.js` returns the local MP3 (if downloaded) and the EveryAyah URL. Quran is **never** read by TTS; if a recording fails, show an error.
- **Non-Quran Arabic (dhikr, dua, letters):** `speakText(text, { lang: "ar-SA", rate })`, labelled as browser speech.
- **Sequential playback** (NamazScreen, SurahDetailScreen): keep `isPlayingRef`, `speedRef`, `audioElRef` and a `runRef` counter in refs; callbacks compare `run === runRef.current` so a stale `onended` never advances a newer playlist.
- `App.jsx` calls `stopAllAudio()` on every route change.

**Speed control:** `SPEEDS = [0.5, 0.65, 1, 1.5, 2]`. Use `speedRef.current` (not state) inside closures.

---
## Component Patterns

### Screen structure
```jsx
export default function MyScreen() {
  const navigate = useNavigate();
  // read state at top
  // handlers
  return (
    <section className="content-stack">
      <Header title="..." subtitle="..." compact />
      <GlassCard className="my-card">...</GlassCard>
    </section>
  );
}
```

### GlassCard / GlassPanel
```jsx
// GlassCard wraps GlassPanel with default class "glass-card"
<GlassCard className="my-extra-class">...</GlassCard>

// GlassPanel accepts `as` prop for element type
<GlassPanel as="button" onClick={...}>...</GlassPanel>

// GlassCard as button
<GlassCard as="button" type="button" onClick={...}>...</GlassCard>
```

### Header component
```jsx
<Header title="Коран" subtitle="Учись читать" eyebrow="Al-Ilm" compact>
  {/* optional side slot: CharacterHelper, buttons */}
</Header>
```

### CharacterHelper
```jsx
<CharacterHelper
  character={character}  // "ahmad" | "amina"
  message="Текст подсказки"
  mood="teaching"        // "happy" | "teaching" | "sad" | "encouragement"
  compact               // boolean
/>
```

### Navigation (always programmatic)
```jsx
const navigate = useNavigate();
navigate("/quran/surah/al-fatihah");
goBack(navigate, "/quran/surahs"); // utils/navigation.js — navigate(-1) leaves the site on a shared link
navigate(`/letter/${letterId}`);
```

---

## CSS Conventions

### Variables (always use these, never hardcode colors)
```css
--green: #58CC02          --green-dark: #46A302
--text-deep: #3C3C3C      --text-muted: rgba(60,60,60,0.55)
--gold: #FF9600           --danger: #FF4B4B
--milk: #FFFFFF           --stroke: rgba(0,0,0,0.1)
--shadow: 0 4px 16px rgba(0,0,0,0.1)
--soft-shadow: 0 2px 8px rgba(0,0,0,0.07)
```

### Class naming: BEM + state + modifiers
```css
/* BEM */
.block__element { }
.block__element--modifier { }

/* State (never hardcode in component logic) */
.is-active      .is-done       .is-locked
.is-correct     .is-wrong      .is-current
.is-hidden-text .is-memorized-ayah .is-current-ayah

/* Variants on components */
.button--primary    .button--soft     .button--large   .button--ghost
.glass-card--compact
.arabic-line--large
```

### Layout utilities
```css
.content-stack     /* flex column, gap 20px — use as root on every screen */
.center-screen     /* grid center, min-height calc(100vh - 60px) */
.page-frame        /* max-width 1200px, centered */
.game-actions      /* flex row, gap 10px — for bottom action buttons */
```

### Buttons
```jsx
<button className="button button--primary" type="button" onClick={...}>
  <Icon size={18} aria-hidden="true" />
  Текст
</button>
```

### Arabic text — always RTL
```jsx
<p className="arabic-line">بِسْمِ اللَّهِ</p>           /* standard */
<p className="arabic-line arabic-line--large">...</p>  /* larger display */
```
The `.arabic-line` class sets `direction: rtl; text-align: right; font-family: Noto Naskh Arabic`.

### Progress bar pattern
```jsx
<div className="progress-bar" aria-label={`Прогресс ${pct}%`}>
  <span style={{ width: `${pct}%` }} />
</div>
```

### Responsive breakpoints
- **980px**: 1-column grids, compact padding
- **700px**: 14px page padding, smaller components

---

## Key Data Shapes

### Surah (quranContent.js)
```js
{
  id: "al-fatihah",        // kebab-case string ID
  number: 1,               // Quran surah number
  title: "Аль-Фатиха",    // Russian name
  arabicTitle: "الفاتحة", // Arabic name
  translation: "Открывающая",
  status: "читаю",
  ayahs: [
    {
      number: 1,
      arabic: "بِسْمِ اللَّهِ...",
      translation: "С именем Аллаха...",
      words: [{ arabic, reading, meaning }]
    }
  ]
}
```

### Prayer (namazGuide.js)
```js
{ id: "fajr", name: "Фаджр", nameRu: "утренний", arabic: "الفجر", color: "#3B82F6", rakaats: 2, icon: "🌙" }
```

### Letter (arabicLetters.js)
```js
{ id: "alif", letter: "ا", nameRu: "Алиф", soundText: "أَلِف", dotPlacement: "none", dotGroup: 0, status: "current" }
```

---

## Lesson Path Architecture

5 chapters, 50+ nodes. Node types:
- `letter-sound` → audio lesson
- `letter-writing` → trace exercise
- `letter-game` → mini-game
- `letter-quiz` → comprehension check
- `letter-reward` → XP/coin reward
- `chapter-checkpoint` → chapter quiz
- `chapter-boss` → boss battle

**Progress flow:** `completeLessonNode(nodeId)` handles unlocking next node, awarding XP, checking achievements.

**Achievements unlocked automatically:**
`first_steps`, `letter_expert`, `strong_streak`, `alphabet_master`, `game_student`, `no_errors`

---

## Background Themes

22 themes in `backgroundThemes.js`. ID list:
`classic dawn emerald gold sky rose night pearl forest sunset`  
+ dark variants + `custom` (user image)

Theme change uses custom DOM event (not React state):
```js
window.dispatchEvent(new CustomEvent("backgroundThemeChange"));
```

`AppBackground.jsx` listens to this event and re-reads from storage.

---

## Qibla & Prayer Times

```js
// Prayer times: adhan library + geolocation
requestPrayerTimes() // async, uses navigator.geolocation + adhan
updateCountdown()    // call on interval (every second)

// Qibla bearing (true north): calculateQiblaDirection(lat, lng) in prayerTimes.js
// Compass: src/utils/compass.js — readTrueHeading(event, declination) adds the
// magnetic declination (WMM) and the screen rotation; phone sensors report magnetic north.
```

---

## Naming Rules

| What | Convention | Example |
|------|-----------|---------|
| Screen files | PascalCase + Screen | `AyahLessonScreen.jsx` |
| Component files | PascalCase | `GlassCard.jsx` |
| Game files | PascalCase + Game | `FindLetterGame.jsx` |
| Data files | camelCase | `arabicLetters.js`, `quranContent.js` |
| CSS classes | kebab-case BEM | `.ayah-detail-card__header` |
| Storage getters | `get` + PascalCase | `getQuranState()` |
| Storage setters | `set` + PascalCase | `setLastOpenedSurah()` |
| Storage completers | `complete` + PascalCase | `completeLessonNode()` |
| Storage togglers | `toggle` + PascalCase | `toggleFavoriteSurah()` |
| Storage markers | `mark` + PascalCase | `markAyahRead()` |
| Route params | camelCase | `:surahId`, `:letterId`, `:ayahNumber` |
| IDs in data | kebab-case | `"al-fatihah"`, `"alif"`, `"fajr"` |
| State booleans | is/has prefix | `isPlaying`, `hasContent`, `isFavorite` |
| Callback props | on prefix | `onBack`, `onComplete`, `onNodeClick` |

---

## Common Gotchas

1. **Stale closures in audio**: Always use `useRef` for values read inside `onended`/`onerror` callbacks — never read state directly. See `isPlayingRef`, `speedRef`, `audioElRef` pattern.

2. **Background theme**: Triggers `window.dispatchEvent(new CustomEvent("backgroundThemeChange"))` — not React re-render. `AppBackground` listens to this.

3. **Surah IDs are strings**: `"al-fatihah"`, not numbers. Route param is `:surahId`. Convert with `getSurahById(surahId)`.

4. **All 114 surahs have ayahs** from Tanzil, but `translation` and `words` are empty on purpose. Never render a translation or word gloss without a licensed, versioned source; `npm run build` fails if one is bundled.

5. **Revelation place lookup**: Not stored in data — use the `REVEAL` object defined in `SurahDetailScreen.jsx` and `SurahListScreen.jsx`.

6. **BottomNav visibility**: Controlled by `childPaths` array in `App.jsx`. Add new paths there when creating sections with nav.

7. **Lazy imports**: Every new screen added to `App.jsx` must be `React.lazy()` — not a static import.

8. **CSS layering**: Five stylesheets with thousands of `!important` rules; later files win. Put new component styles at the end of `responsive.css` under a `/* ── MyComponent ── */` header and scope them with `#root .app-shell`.

9. **No `window.location.reload()`**: Avoid it. Only QuranScreen goal-change uses it as a shortcut — prefer state updates.

10. **Prayer times**: Real calculation via `adhan` + geolocation. Cached in localStorage. City fallback map is in `NamazScreen.jsx` (`CITY_COORDS`). Settings are React state in NamazScreen: without a saved city the schedule object does not change, so it cannot trigger a re-render.

11. **Production is `docs/`**: users get whatever is committed there. After any change run `npm run build:pages` and commit `docs/`; `scripts/checkBuild.mjs` inspects the built files, not the source.

12. **Religious content**: the namaz order is Hanafi with separate boys/girls postures. Mark anything not reviewed by a scholar `needsReview: true` and `verified: false` in its metadata.

13. **Russian counts**: write numbers with `plural()` / `countAyahs()` from `utils/plural.js` ("3 аята", not "3 аятов"). Address the child with «ты», in gender-neutral phrasing ("Урок пройден", not "Ты прошёл").

14. **No dark theme, one language**: the dark theme was removed because most screens were unreadable in it; Russian is the only UI language, so there is no language setting.

---

## PWA

- `public/manifest.json` — icons in `public/icons` (192, 512, maskable), any orientation (never lock portrait/landscape)
- `public/sw.js` — network-first pages, stale-while-revalidate assets; `CACHE_VERSION` is replaced at build time
- Meta tags in `index.html` for iOS

---

## What's Done ✓ / In Progress / Pending

**Done:**
- Arabic alphabet learning (28 letters, 5 chapters, 50+ lesson nodes)
- Gamification (XP, coins, streaks, achievements, level system)
- Quran section (SurahList + Detail + Memorization + AyahLesson + Search + Bookmarks + Tajweed)
- Namaz guide (5 prayers, step-by-step with audio, qibla, prayer times)
- Language modules (Harakat, Vocabulary, Grammar, Reading)
- Auth (Register, Login, Password Reset)
- Background themes (22 themes + custom image)
- PWA (manifest + service worker)
- Real audio for Quran (everyayah.com CDN, Alafasy recitation)
- Speed control (0.5x / 0.65x / 1x / 1.5x / 2x) for prayer audio

**Pending / Partial:**
- Licensed Russian translation of meanings (none bundled)
- Scholar review of the namaz guide, transliteration, 99 names and prophet stories
- Adult mode: shows "coming soon" — not yet built
- Push notifications for prayer times: reminders work only while the Namaz screen is open
- No server: progress is per browser; file backup/restore in Profile → Мои данные
