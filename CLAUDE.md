# Al-Ilm — Claude Code Context

Educational React SPA teaching Arabic alphabet, Quran, and Islamic prayer to Muslim children (ages 4–12). Russian UI. Gamified (Duolingo-style). No backend — localStorage only.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 (functional components + hooks only) |
| Router | React Router DOM v6 |
| Build | Vite 5, ES modules (`"type": "module"`) |
| Icons | lucide-react |
| Prayer times | adhan (v4) |
| Audio | Web Speech API (TTS, Arabic) + `new Audio()` (CDN MP3) |
| State | localStorage only — no Redux, no Context, no Zustand |
| CSS | Two files: `global.css` + `responsive.css` (no CSS-in-JS, no Tailwind) |
| Fonts | Nunito (UI) + Noto Naskh Arabic (Arabic text) from Google Fonts |

**Dev:** `npm run dev` → localhost:5173  
**Build:** `npm run build` → verify `✓ built` before done

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
└── styles/
    ├── global.css           # Variables, components, utilities (~9000 lines)
    └── responsive.css       # Breakpoints (980px, 700px)
public/
├── manifest.json            # PWA manifest
└── sw.js                    # Service worker
```

---

## Routing

All screens are `React.lazy()` imported. Routes are in `App.jsx`. BottomNav shows on `childPaths`.

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
getUser()           // { name, email, password } or null
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
// 114 surahs (34 filled with ayahs). Shape:
// { id, number, title, arabicTitle, translation, status, ayahs: [{ number, arabic, translation, words[] }] }
import { quranSurahs, quranSections, getSurahById, getAyahByNumber } from "../data/quranContent.js";
```

### namazGuide.js
```js
// PRAYERS[], buildPrayerGuide(prayer) → flat steps array
// FATIHA_AYAHS + IKHLAS_AYAHS have audioUrl (everyayah.com CDN)
// Other duas: no audioUrl → use Web Speech API fallback
import { PRAYERS, buildPrayerGuide } from "../data/namazGuide.js";
```

### prayerTimes.js
```js
// Uses adhan library + geolocation. Returns { nextPrayer, nextPrayerTime, countdown }
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

### Quran ayah audio (CDN)
```js
function getAudioUrl(surahNum, ayahNum) {
  return `https://everyayah.com/data/Alafasy_128kbps/${String(surahNum).padStart(3,"0")}${String(ayahNum).padStart(3,"0")}.mp3`;
}
```

### Arabic TTS (Web Speech API)
```js
const utt = new SpeechSynthesisUtterance(arabicText);
utt.lang = "ar";
utt.rate = 0.65; // default; use speedRef.current for user-controlled speed
window.speechSynthesis.cancel(); // always cancel before speaking
window.speechSynthesis.speak(utt);
```

### Sequential playback pattern (NamazScreen / SurahDetailScreen)
```js
const isPlayingRef = useRef(false);  // mutable — avoids stale closure in onended
const audioElRef = useRef(null);

function cancelAll() {
  window.speechSynthesis?.cancel();
  if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
}

function playFrom(idx) {
  if (!isPlayingRef.current || idx >= playlist.length) {
    setPlaying(false); isPlayingRef.current = false; return;
  }
  setCurrentIdx(idx);
  cancelAll();
  const item = playlist[idx];
  if (item.audioUrl) {
    const audio = new Audio(item.audioUrl);
    audioElRef.current = audio;
    audio.playbackRate = speedRef.current;
    audio.onended = () => playFrom(idx + 1);
    audio.onerror = () => { audioElRef.current = null; playTTS(item, () => playFrom(idx + 1)); };
    audio.play().catch(() => playTTS(item, () => playFrom(idx + 1)));
  } else {
    playTTS(item, () => playFrom(idx + 1));
  }
}

useEffect(() => () => { cancelAll(); isPlayingRef.current = false; }, []);
```

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
navigate(-1); // go back
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

// Qibla formula (in NamazScreen.jsx)
function calcQibla(lat, lng) { /* returns bearing in degrees 0-360 */ }
// DeviceOrientationEvent for compass heading
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

4. **All surahs exist in quranContent.js** (114 total), but only 34 have `ayahs` filled. Always check `surah.ayahs?.length > 0` before rendering ayahs.

5. **Revelation place lookup**: Not stored in data — use the `REVEAL` object defined in `SurahDetailScreen.jsx` and `SurahListScreen.jsx`.

6. **BottomNav visibility**: Controlled by `childPaths` array in `App.jsx`. Add new paths there when creating sections with nav.

7. **Lazy imports**: Every new screen added to `App.jsx` must be `React.lazy()` — not a static import.

8. **CSS in global.css**: All component styles live here. Group by component with a comment header like `/* ── MyComponent ── */`.

9. **No `window.location.reload()`**: Avoid it. Only QuranScreen goal-change uses it as a shortcut — prefer state updates.

10. **Prayer times**: Real calculation via `adhan` + geolocation. Cached in localStorage. City fallback map is in `NamazScreen.jsx` (`CITY_COORDS`).

---

## PWA

- `public/manifest.json` — app name, icons, theme color `#2E7D5B`, standalone display
- `public/sw.js` — caches static assets
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
- Quran data: 80 surahs still have empty `ayahs: []` (only Juz Amma + Al-Fatiha filled)
- Adult mode: shows "coming soon" — not yet built
- Push notifications for prayer times: architecture exists, real scheduling not implemented
- TraceLetterGame: canvas validation is minimal (no stroke length check)
