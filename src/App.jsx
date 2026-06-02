import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppBackground from "./components/AppBackground.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import BottomNav from "./components/BottomNav.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import { stopAllAudio } from "./utils/audioPlayback.js";
import { getAge, getSelectedCharacter, getSessionActive, getUser } from "./utils/storage.js";

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

const childPaths = ["/home", "/lessons", "/alphabet", "/namaz", "/quran", "/profile", "/progress", "/harakat", "/vocabulary", "/grammar", "/reading", "/islamic-basics", "/islam-basics", "/asmaul-husna"];

function resolveStartPath() {
  const user = getUser();
  const sessionActive = getSessionActive();
  const age = getAge();
  const character = getSelectedCharacter();

  if (!user || !sessionActive) return "/welcome";
  if (!age) return "/age";
  if (Number(age) > 12) return "/adult-soon";
  if (!character) return "/character";
  return "/home";
}

function AppRoutes() {
  const location = useLocation();
  const showBottomNav = childPaths.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    stopAllAudio();
  }, [location.pathname]);

  return (
    <AppBackground>
      <main className={`page-frame ${showBottomNav ? "page-frame--nav" : ""}`}>
        <AppErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/backgrounds" element={<BackgroundSelectScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </main>
      {showBottomNav ? <BottomNav /> : null}
      <div className="orientation-hint" role="status" aria-live="polite">
        <div className="orientation-hint__icon" aria-hidden="true">
          <span />
        </div>
        <h2>Поверните телефон горизонтально</h2>
        <p>Так уроки будут удобнее проходить</p>
      </div>
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
