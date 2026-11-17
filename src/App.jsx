import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppBackground from "./components/AppBackground.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import BottomNav from "./components/BottomNav.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { stopAllAudio } from "./utils/audioPlayback.js";
import { getAge, getProfilePreferences, getSelectedCharacter, hasActiveProfile } from "./utils/storage.js";

const AyahLessonScreen = lazy(() => import("./screens/AyahLessonScreen.jsx"));
const AllahNamesScreen = lazy(() => import("./screens/AllahNamesScreen.jsx"));
const BackgroundSelectScreen = lazy(() => import("./screens/BackgroundSelectScreen.jsx"));
const BookmarksScreen = lazy(() => import("./screens/BookmarksScreen.jsx"));
const AgeScreen = lazy(() => import("./screens/AgeScreen.jsx"));
const AlphabetScreen = lazy(() => import("./screens/AlphabetScreen.jsx"));
const CharacterSelectScreen = lazy(() => import("./screens/CharacterSelectScreen.jsx"));
const ChildHomeScreen = lazy(() => import("./screens/ChildHomeScreen.jsx"));
const ChapterChallengeScreen = lazy(() => import("./screens/ChapterChallengeScreen.jsx"));
const LessonsScreen = lazy(() => import("./screens/LessonsScreen.jsx"));
const JuzScreen = lazy(() => import("./screens/JuzScreen.jsx"));
const LetterLessonScreen = lazy(() => import("./screens/LetterLessonScreen.jsx"));
const LoginScreen = lazy(() => import("./screens/LoginScreen.jsx"));
const MiniGameScreen = lazy(() => import("./screens/MiniGameScreen.jsx"));
const NamazScreen = lazy(() => import("./screens/NamazScreen.jsx"));
const NamazProgressScreen = lazy(() => import("./screens/NamazProgressScreen.jsx"));
const PasswordResetScreen = lazy(() => import("./screens/PasswordResetScreen.jsx"));
const ProfileDataScreen = lazy(() => import("./screens/ProfileDataScreen.jsx"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen.jsx"));
const MemorizationScreen = lazy(() => import("./screens/MemorizationScreen.jsx"));
const ProphetsScreen = lazy(() => import("./screens/ProphetsScreen.jsx"));
const QuranLearningPathScreen = lazy(() => import("./screens/QuranLearningPathScreen.jsx"));
const QuranScreen = lazy(() => import("./screens/QuranScreen.jsx"));
const QuranSearchScreen = lazy(() => import("./screens/QuranSearchScreen.jsx"));
const RegisterScreen = lazy(() => import("./screens/RegisterScreen.jsx"));
const RewardScreen = lazy(() => import("./screens/RewardScreen.jsx"));
const SurahDetailScreen = lazy(() => import("./screens/SurahDetailScreen.jsx"));
const SurahListScreen = lazy(() => import("./screens/SurahListScreen.jsx"));
const TajweedScreen = lazy(() => import("./screens/TajweedScreen.jsx"));
const HarakatScreen = lazy(() => import("./screens/HarakatScreen.jsx"));
const VocabularyScreen = lazy(() => import("./screens/VocabularyScreen.jsx"));
const GrammarScreen = lazy(() => import("./screens/GrammarScreen.jsx"));
const ReadingScreen = lazy(() => import("./screens/ReadingScreen.jsx"));
const SyllablesScreen = lazy(() => import("./screens/SyllablesScreen.jsx"));
const WordsPathScreen = lazy(() => import("./screens/WordsPathScreen.jsx"));
const AdultSoonScreen = lazy(() => import("./screens/AdultSoonScreen.jsx"));
const ProgressScreen = lazy(() => import("./screens/ProgressScreen.jsx"));
const WelcomeScreen = lazy(() => import("./screens/WelcomeScreen.jsx"));
const IslamicBasicsScreen = lazy(() => import("./screens/IslamicBasicsScreen.js"));
const IslamicRulingsScreen = lazy(() => import("./screens/IslamicRulingsScreen.js"));
const QuranReadingScreen = lazy(() => import("./screens/QuranReadingScreen.js"));
const TajweedRuleDetailScreen = lazy(() => import("./screens/TajweedRuleDetailScreen.js"));
const SurahMemorizationScreen = lazy(() => import("./screens/SurahMemorizationScreen.js"));
const SourcesScreen = lazy(() => import("./screens/SourcesScreen.jsx"));

const childPaths = ["/home", "/lessons", "/alphabet", "/namaz", "/quran", "/profile", "/progress", "/harakat", "/vocabulary", "/grammar", "/reading", "/islamic-basics", "/islam-basics", "/asmaul-husna"];

// Screens reachable without a signed-in profile.
const publicPaths = ["/welcome", "/register", "/login", "/password-reset", "/sources"];
// Onboarding screens a signed-in profile may open before setup is complete.
const setupPaths = ["/age", "/character", "/adult-soon"];

function resolveStartPath() {
  const age = getAge();
  const character = getSelectedCharacter();

  if (!hasActiveProfile()) return "/welcome";
  if (!age) return "/age";
  if (Number(age) > 12) return "/adult-soon";
  if (!character) return "/character";
  return "/home";
}

// Without a guard, a bookmarked screen opened after sign-out would write progress
// into whichever profile happened to be stored last.
function resolveGuardRedirect(pathname) {
  if (pathname === "/" || publicPaths.includes(pathname)) return null;
  const start = resolveStartPath();
  if (start === "/welcome") return "/welcome";
  if (setupPaths.includes(pathname)) return null;
  // Adults start on /adult-soon but may open every section, including the main home screen.
  if (start === "/adult-soon") return null;
  return start === "/home" ? null : start;
}

function StorageWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener("storageWriteFailed", show);
    return () => window.removeEventListener("storageWriteFailed", show);
  }, []);

  if (!visible) return null;
  return (
    <div className="storage-warning" role="alert">
      <p>Не удалось сохранить прогресс: память браузера заполнена или запрещена. Удалите своё фоновое фото в профиле или разрешите хранение данных для сайта.</p>
      <button type="button" onClick={() => setVisible(false)} aria-label="Закрыть предупреждение">×</button>
    </div>
  );
}

function AudioNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    let timer;
    const show = (event) => {
      setMessage(event.detail || "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMessage(""), 6000);
    };
    window.addEventListener("audioNotice", show);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("audioNotice", show);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="audio-notice" role="status">
      <p>{message}</p>
      <button type="button" onClick={() => setMessage("")} aria-label="Закрыть сообщение">×</button>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const guardRedirect = resolveGuardRedirect(location.pathname);
  const showBottomNav = !guardRedirect && childPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    stopAllAudio();
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    const applyPreferences = () => {
      const preferences = getProfilePreferences();
      document.documentElement.dataset.showHints = String(preferences.showHints);
      document.documentElement.dataset.arabicSize = preferences.arabicTextSize;
    };
    applyPreferences();
    window.addEventListener("profilePreferencesChange", applyPreferences);
    return () => window.removeEventListener("profilePreferencesChange", applyPreferences);
  }, []);

  return (
    <AppBackground>
      <main id="main-content" className={`page-frame ${showBottomNav ? "page-frame--nav" : ""}`}>
        <AppErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<LoadingSpinner />}>
            {guardRedirect ? <Navigate to={guardRedirect} replace /> : (
            <Routes>
            <Route path="/" element={<Navigate to={resolveStartPath()} replace />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/password-reset" element={<PasswordResetScreen />} />
            <Route path="/age" element={<AgeScreen />} />
            <Route path="/adult-soon" element={<AdultSoonScreen />} />
            <Route path="/character" element={<CharacterSelectScreen />} />
            <Route path="/home" element={<ChildHomeScreen />} />
            <Route path="/lessons" element={<LessonsScreen />} />
            <Route path="/lessons/syllables" element={<SyllablesScreen />} />
            <Route path="/lessons/syllables/:lessonId" element={<SyllablesScreen />} />
            <Route path="/lessons/words" element={<WordsPathScreen />} />
            <Route path="/lessons/words/:lessonId" element={<WordsPathScreen />} />
            <Route path="/alphabet" element={<AlphabetScreen />} />
            <Route path="/letter/:letterId" element={<LetterLessonScreen />} />
            <Route path="/game/:gameType/:letterId" element={<MiniGameScreen />} />
            <Route path="/reward/:letterId" element={<RewardScreen />} />
            <Route path="/checkpoint/:chapterId" element={<ChapterChallengeScreen mode="checkpoint" />} />
            <Route path="/boss/:chapterId" element={<ChapterChallengeScreen mode="boss" />} />
            <Route path="/namaz" element={<NamazScreen />} />
            <Route path="/namaz/progress" element={<NamazProgressScreen />} />
            <Route path="/quran" element={<QuranScreen />} />
            <Route path="/quran/path" element={<QuranLearningPathScreen />} />
            <Route path="/quran/juz" element={<JuzScreen />} />
            <Route path="/quran/surahs" element={<SurahListScreen />} />
            <Route path="/quran/surah/:surahId" element={<SurahDetailScreen />} />
            <Route path="/quran/ayah/:surahId/:ayahNumber" element={<AyahLessonScreen />} />
            <Route path="/quran/tajweed" element={<TajweedScreen />} />
            <Route path="/quran/tajweed/:ruleId" element={<TajweedRuleDetailScreen />} />
            <Route path="/quran/reading" element={<QuranReadingScreen />} />
            <Route path="/quran/names" element={<AllahNamesScreen />} />
            <Route path="/asmaul-husna" element={<AllahNamesScreen />} />
            <Route path="/quran/prophets" element={<ProphetsScreen />} />
            <Route path="/quran/memorization" element={<MemorizationScreen />} />
            <Route path="/quran/search" element={<QuranSearchScreen />} />
            <Route path="/quran/bookmarks" element={<BookmarksScreen />} />
            <Route path="/namaz/surahs" element={<SurahMemorizationScreen />} />
            <Route path="/islamic-basics" element={<IslamicBasicsScreen />} />
            <Route path="/islam-basics" element={<IslamicBasicsScreen />} />
            <Route path="/islamic-basics/rulings" element={<IslamicRulingsScreen />} />
            <Route path="/harakat" element={<HarakatScreen />} />
            <Route path="/harakat/:harakatId" element={<HarakatScreen />} />
            <Route path="/vocabulary" element={<VocabularyScreen />} />
            <Route path="/vocabulary/:themeId" element={<VocabularyScreen />} />
            <Route path="/grammar" element={<GrammarScreen />} />
            <Route path="/grammar/:lessonId" element={<GrammarScreen />} />
            <Route path="/reading" element={<ReadingScreen />} />
            <Route path="/reading/:textId" element={<ReadingScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/data" element={<ProfileDataScreen />} />
            <Route path="/sources" element={<SourcesScreen />} />
            <Route path="/backgrounds" element={<BackgroundSelectScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            )}
          </Suspense>
        </AppErrorBoundary>
      </main>
      {showBottomNav ? <BottomNav /> : null}
      <StorageWarning />
      <AudioNotice />
    </AppBackground>
  );
}

export default function App() {
  const basename = import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
}
