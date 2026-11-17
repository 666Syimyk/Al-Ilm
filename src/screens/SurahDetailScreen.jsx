import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, Heart, HeartOff, Headphones, Pause, Play, Repeat2, Star } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { getAyahWords, getSurahById, quranSurahs, quranTextSource, translationSource } from "../data/quranContent.js";
import { getJuzForAyah, getSurahReveal } from "../data/quranNavigation.js";
import {
  getProfilePreferences, getQuranState, getQuranTracking, markAyahRead, markAyahMemorized,
  memorizeSurah, setLastOpenedSurah, toggleBookmarkedAyah, toggleFavoriteSurah
} from "../utils/storage.js";
import { getAyahAudioSources } from "../utils/quranAudio.js";
import { playAudioSources, stopAudioElement, stopSpeech } from "../utils/audioPlayback.js";
import { countAyahs } from "../utils/plural.js";
import { goBack } from "../utils/navigation.js";

const DISPLAY_MODES = [
  { key: "arabic", label: "Арабский" },
  { key: "translation", label: "Перевод смыслов" },
  { key: "transliteration", label: "Чтение" },
  { key: "full", label: "Полный" },
  { key: "tajweed", label: "Таджвид" }
];

const FONT_SIZES = [
  { key: "normal", label: "А" },
  { key: "large", label: "А+" },
  { key: "xlarge", label: "А++" }
];

const REPEAT_COUNTS = [1, 3, 5];
const orderedSurahs = [...quranSurahs].sort((a, b) => a.number - b.number);

function ayahRef(surahId, num) { return `${surahId}:${num}`; }

const tajweedPatterns = [
  { type: "ghunnah", label: "Гунна", explanation: "Носовое звучание, которое читается мягко и протяжно.", pattern: /[نم]ّ/u },
  { type: "qalqalah", label: "Калькаля", explanation: "Лёгкий отскок звука у букв ق ط ب ج د с сукуном.", pattern: /[قطبجد]ْ/u },
  { type: "madd", label: "Мадд", explanation: "Длинное протяжение гласного звука.", pattern: /[اآوىي][ٰٓ]?/u }
];

function findNextTajweed(text, startIndex) {
  let next = null;
  for (const rule of tajweedPatterns) {
    const slice = text.slice(startIndex);
    const match = slice.match(rule.pattern);
    if (!match || match.index === undefined) continue;
    const absoluteIndex = startIndex + match.index;
    if (!next || absoluteIndex < next.index) {
      next = { type: rule.type, label: rule.label, explanation: rule.explanation, index: absoluteIndex, text: match[0] };
    }
  }
  return next;
}

function renderArabicWithTajweed(text, enabled, onRuleClick) {
  if (!enabled) return text;

  const parts = [];
  let cursor = 0;
  while (cursor < text.length) {
    const next = findNextTajweed(text, cursor);
    if (!next) {
      parts.push(text.slice(cursor));
      break;
    }
    if (next.index > cursor) parts.push(text.slice(cursor, next.index));
    parts.push(
      <button
        className={`tajweed-mark tajweed-mark--${next.type}`}
        key={`${next.type}-${next.index}`}
        type="button"
        onClick={() => onRuleClick?.(next)}
        aria-label={`${next.label}: ${next.explanation}`}
      >
        {next.text}
      </button>
    );
    cursor = next.index + next.text.length;
  }
  return parts;
}

function AyahCard({
  ayah,
  surahId,
  mode,
  fontSize,
  showTajweed,
  isBookmarked,
  isMemorized,
  isRead,
  isCurrent,
  isHighlighted,
  onPlay,
  onRead,
  onRef
}) {
  const ref = ayahRef(surahId, ayah.number);
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);
  const [localMem, setLocalMem] = useState(isMemorized);
  const [localRead, setLocalRead] = useState(isRead);
  useEffect(() => setLocalRead(isRead), [isRead]);
  useEffect(() => setLocalMem(isMemorized), [isMemorized]);
  const [ruleHint, setRuleHint] = useState(null);
  const words = getAyahWords(ayah);
  const tajweedMode = mode === "tajweed";

  function handleBookmark(e) {
    e.stopPropagation();
    toggleBookmarkedAyah(ref);
    setLocalBookmark((v) => !v);
  }

  function handleMem(e) {
    e.stopPropagation();
    markAyahMemorized(ref);
    setLocalMem(true);
  }

  function handleRead(e) {
    e.stopPropagation();
    onRead(ref);
    setLocalRead(true);
  }

  return (
    <div className={`ayah-detail-card${(isCurrent || isHighlighted) ? " is-current-ayah" : ""}${localMem ? " is-memorized-ayah" : ""}${localRead ? " is-read-ayah" : ""}`} ref={onRef}>
      <div className="ayah-detail-card__header">
        <span className="ayah-detail-card__num">{ayah.number}</span>
        <div className="ayah-detail-card__actions">
          <button className="ayah-icon-btn" type="button" onClick={() => onPlay(ayah.number - 1)} aria-label="Слушать аят">
            <Headphones size={16} />
          </button>
          <button className={`ayah-icon-btn${localBookmark ? " is-active" : ""}`} type="button" onClick={handleBookmark} aria-label="Закладка">
            {localBookmark ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
          <button className={`ayah-icon-btn${localRead ? " is-active" : ""}`} type="button" onClick={handleRead} aria-label="Прочитано">
            <CheckCircle2 size={16} />
          </button>
          <button className={`ayah-icon-btn${localMem ? " is-active" : ""}`} type="button" onClick={handleMem} aria-label="Знаю наизусть">
            <Star size={16} />
          </button>
        </div>
      </div>

      {(mode === "arabic" || mode === "transliteration" || mode === "full" || tajweedMode) && (
        <p className={`arabic-line arabic-line--large arabic-line--${fontSize}`}>
          {renderArabicWithTajweed(ayah.arabic, showTajweed || tajweedMode, setRuleHint)}
        </p>
      )}
      {ruleHint ? (
        <p className="tajweed-inline-hint">
          <strong>{ruleHint.label}</strong>
          {ruleHint.explanation}
        </p>
      ) : null}
      {(mode === "transliteration" || mode === "full" || tajweedMode) && words.length ? (
        <p className="ayah-translit">
          {words.map((word) => word.reading || word.arabic).join(" - ")}
        </p>
      ) : null}
      {(mode === "translation" || mode === "full" || tajweedMode) && (
        <p className="ayah-translation-line">{ayah.translation}</p>
      )}

      {mode === "full" && words.length ? (
        <div className="word-breakdown-mini">
          {words.map((word, index) => (
            <span key={`${word.arabic}-${index}`} className="word-chip">
              <strong>{word.arabic}</strong>
              {word.meaning ? <small>{word.meaning}</small> : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="ayah-memory-actions">
        <button className="button button--soft" type="button" onClick={() => onPlay(ayah.number - 1)}>
          <Repeat2 size={16} aria-hidden="true" />
          Повторить аят
        </button>
        <button className="button button--soft" type="button" onClick={handleMem} disabled={localMem}>
          <Star size={16} aria-hidden="true" />
          {localMem ? "Выучено" : "Знаю наизусть"}
        </button>
      </div>
    </div>
  );
}

export default function SurahDetailScreen() {
  const { surahId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  if (!quranSurahs.some((surah) => surah.id === surahId)) return <section className="content-stack"><p>Сура не найдена.</p><button className="button button--primary" type="button" onClick={() => navigate("/quran/surahs")}>К сурам</button></section>;
  return <SurahDetailSession key={`${surahId}:${params.get("ayah") || ""}`} />;
}

function SurahDetailSession() {
  const navigate = useNavigate();
  const { surahId: routeSurahId } = useParams();
  const [searchParams] = useSearchParams();
  const surah = getSurahById(routeSurahId);
  const surahId = surah.id;

  useEffect(() => { setLastOpenedSurah(surahId); }, [surahId]);

  const targetAyah = Number(searchParams.get("ayah"));
  const [highlightIdx] = useState(targetAyah > 0 ? targetAyah - 1 : -1);

  const tracking = getQuranTracking();
  const quranState = getQuranState();
  const profilePreferences = getProfilePreferences();
  const bookmarked = quranState.bookmarkedAyahs;
  const memorizedAyahs = tracking.memorizedAyahs;
  const isFavorite = tracking.favoriteSurahs.includes(surahId);
  const [favorite, setFavorite] = useState(isFavorite);

  const [displayMode, setDisplayMode] = useState(profilePreferences.showTranslation ? "full" : "arabic");
  const [fontSize, setFontSize] = useState(profilePreferences.arabicTextSize || "normal");
  const [showTajweed, setShowTajweed] = useState(false);
  const [jumpAyah, setJumpAyah] = useState(targetAyah > 0 ? String(targetAyah) : "");
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [, refreshProgress] = useState(0);
  const [surahMemorized, setSurahMemorized] = useState(quranState.memorizedSurahs.includes(surahId));

  const audioElRef = useRef(null);
  const runRef = useRef(0);
  const isPlayingRef = useRef(false);
  const playModeRef = useRef("sequence");
  const repeatLeftRef = useRef(1);
  const repeatCountRef = useRef(repeatCount);
  const cardRefs = useRef([]);
  const scrollRef = useRef(null);

  const ayahs = surah.ayahs || [];
  const reveal = getSurahReveal(surah.number);
  const currentJuz = ayahs[currentIdx] ? getJuzForAyah(surah.number, ayahs[currentIdx].number) : getJuzForAyah(surah.number, 1);
  const surahIndex = orderedSurahs.findIndex((item) => item.number === surah.number);
  const previousSurah = orderedSurahs[surahIndex - 1];
  const nextSurah = orderedSurahs[surahIndex + 1];
  const memorizedCount = ayahs.filter((a) => memorizedAyahs.includes(ayahRef(surahId, a.number))).length;
  const readCount = ayahs.filter((a) => tracking.readAyahs.includes(ayahRef(surahId, a.number))).length;
  const progressPct = ayahs.length ? Math.round((memorizedCount / ayahs.length) * 100) : 0;
  const readPct = ayahs.length ? Math.round((readCount / ayahs.length) * 100) : 0;
  const effectiveTajweed = showTajweed || displayMode === "tajweed";

  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);

  const jumpOptions = useMemo(() => ayahs.map((ayah) => ayah.number), [ayahs]);

  function scrollToCard(idx) {
    const el = cardRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cancelAudio({ keepPlaying = false } = {}) {
    runRef.current += 1;
    stopSpeech();
    stopAudioElement(audioElRef.current);
    audioElRef.current = null;
    if (!keepPlaying) {
      isPlayingRef.current = false;
      setPlaying(false);
    }
  }

  function playFrom(idx) {
    if (!profilePreferences.soundEnabled) {
      setPlaying(false);
      isPlayingRef.current = false;
      setAudioError("Звук выключен. Включи его: Профиль → Настройки → Звук.");
      return;
    }
    if (!isPlayingRef.current || idx >= ayahs.length) {
      setPlaying(false);
      isPlayingRef.current = false;
      return;
    }
    setCurrentIdx(idx);
    setTimeout(() => scrollToCard(idx), 80);

    const ayah = ayahs[idx];
    cancelAudio({ keepPlaying: true });
    const run = runRef.current;
    setAudioError("");

    const finishAyah = () => {
      if (run !== runRef.current || !isPlayingRef.current) return;
      markAyahRead(ayahRef(surahId, ayah.number));
      refreshProgress((n) => n + 1);
      if (repeatLeftRef.current > 1) {
        repeatLeftRef.current -= 1;
        playFrom(idx);
        return;
      }
      if (playModeRef.current === "sequence") {
        repeatLeftRef.current = repeatCountRef.current;
        playFrom(idx + 1);
        return;
      }
      isPlayingRef.current = false;
      setPlaying(false);
    };

    playAudioSources(getAyahAudioSources(surah.number, ayah.number), {
      cancelCurrent: false,
      onReady: (audio) => { audioElRef.current = audio; },
      onEnded: finishAyah,
      onError: () => {
        if (run !== runRef.current) return;
        cancelAudio();
        setAudioError("Запись не загрузилась. Проверь интернет и звук в профиле, затем повтори. Аят не отмечен как прослушанный.");
      },
      onStop: () => { if (run === runRef.current) { isPlayingRef.current = false; setPlaying(false); } }
    });
  }

  function togglePlay() {
    if (playing) {
      cancelAudio();
    } else {
      isPlayingRef.current = true;
      playModeRef.current = "sequence";
      repeatLeftRef.current = repeatCountRef.current;
      setPlaying(true);
      playFrom(currentIdx);
    }
  }

  function playOne(idx) {
    cancelAudio({ keepPlaying: true });
    isPlayingRef.current = true;
    playModeRef.current = "single";
    repeatLeftRef.current = repeatCountRef.current;
    setPlaying(true);
    playFrom(idx);
  }

  function handleRead(ref) {
    markAyahRead(ref);
    refreshProgress((n) => n + 1);
  }

  function handleJump(event) {
    event.preventDefault();
    const number = Number(jumpAyah);
    const idx = ayahs.findIndex((ayah) => ayah.number === number);
    if (idx >= 0) {
      cancelAudio();
      setCurrentIdx(idx);
      scrollToCard(idx);
    }
  }

  function handleFavorite() {
    toggleFavoriteSurah(surahId);
    setFavorite((v) => !v);
  }

  function handleMemorizeSurah() {
    ayahs.forEach((ayah) => markAyahMemorized(ayahRef(surahId, ayah.number)));
    memorizeSurah(surahId);
    setSurahMemorized(true);
  }

  useEffect(() => () => { cancelAudio(); isPlayingRef.current = false; }, []);

  useEffect(() => {
    if (highlightIdx >= 0) {
      setTimeout(() => cardRefs.current[highlightIdx]?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [highlightIdx]);

  if (!ayahs.length) {
    return (
      <section className="content-stack quran-inner-screen surah-detail-screen">
        <div className="surah-detail-topbar">
          <button className="guide-back-icon" type="button" onClick={() => goBack(navigate, "/quran/surahs")} aria-label="Назад">
            <ArrowLeft size={22} />
          </button>
          <div className="surah-detail-topbar__title">
            <span className="arabic-line">{surah.arabicTitle}</span>
            <span>{surah.title}</span>
          </div>
        </div>
        <GlassCard className="quran-warning-card">
          <h2>Аяты скоро появятся</h2>
          <p>Пока можно добавить суру в избранное и вернуться позже.</p>
          <button className="button button--soft" type="button" onClick={handleFavorite}>
            {favorite ? <HeartOff size={18} /> : <Heart size={18} />}
            {favorite ? "Убрать из избранного" : "В избранное"}
          </button>
        </GlassCard>
      </section>
    );
  }

  return (
    <section className="content-stack quran-inner-screen surah-detail-screen" ref={scrollRef}>
      {/* Шапка */}
      <div className="surah-detail-topbar">
        <button className="guide-back-icon" type="button" onClick={() => goBack(navigate, "/quran/surahs")} aria-label="Назад">
          <ArrowLeft size={22} />
        </button>
        <div className="surah-detail-topbar__title">
          <span className="arabic-line">{surah.arabicTitle}</span>
          <h1 className="surah-detail-topbar__heading">{surah.title}</h1>
          <span>{surah.translation}</span>
        </div>
        {previousSurah && (
          <button className="ayah-icon-btn" type="button" onClick={() => navigate(`/quran/surah/${previousSurah.id}`)} aria-label="Предыдущая сура">
            <ArrowLeft size={18} />
          </button>
        )}
        {nextSurah && (
          <button className="ayah-icon-btn" type="button" onClick={() => navigate(`/quran/surah/${nextSurah.id}`)} aria-label="Следующая сура">
            <ArrowRight size={18} />
          </button>
        )}
        <button className={`ayah-icon-btn${favorite ? " is-active" : ""}`} type="button" onClick={handleFavorite} aria-label="Избранное">
          {favorite ? <Heart size={20} fill="currentColor" /> : <Heart size={20} />}
        </button>
      </div>

      {/* Инфо-карточка */}
      <GlassCard className="surah-info-card">
        {audioError && <p role="status" className="audio-unavailable-note">{audioError}</p>}
        {!translationSource.available && <p className="content-source-note">{translationSource.note}</p>}
        <p className="content-source-note"><a href={quranTextSource.url} target="_blank" rel="noreferrer">Арабский текст: Tanzil</a> · <a href={quranTextSource.licenseUrl} target="_blank" rel="noreferrer">Условия использования</a></p>
        <div className="surah-info-meta">
          <span className="surah-meta-pill">{surah.number} сура</span>
          <span className="surah-meta-pill">{currentJuz} джуз</span>
          <span className="surah-meta-pill">{reveal}</span>
          <span className="surah-meta-pill">{countAyahs(ayahs.length)}</span>
          {surahMemorized && <span className="surah-meta-pill surah-meta-pill--green">Выучено ✓</span>}
        </div>

        {(progressPct > 0 || readPct > 0) && (
          <div className="surah-progress-stack">
            <div className="surah-memorize-progress">
              <span>Прочитано: {readCount}/{ayahs.length}</span>
              <div className="progress-bar">
                <span style={{ width: `${readPct}%` }} />
              </div>
            </div>
            <div className="surah-memorize-progress">
              <span>Заучено: {memorizedCount}/{ayahs.length}</span>
              <div className="progress-bar">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        )}

        <form className="surah-jump-form" onSubmit={handleJump}>
          <label htmlFor="ayah-jump">Перейти к аяту</label>
          <select id="ayah-jump" value={jumpAyah} onChange={(event) => setJumpAyah(event.target.value)}>
            <option value="">Аят</option>
            {jumpOptions.map((number) => (
              <option key={number} value={number}>{number}</option>
            ))}
          </select>
          <button className="button button--soft" type="submit" disabled={!jumpAyah}>Открыть</button>
        </form>

        <div className="surah-reader-controls">
          <div className="surah-control-group" aria-label="Размер арабского текста">
            {FONT_SIZES.map((size) => (
              <button
                className={`surah-control-chip${fontSize === size.key ? " is-active" : ""}`}
                key={size.key}
                type="button"
                onClick={() => setFontSize(size.key)}
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className="surah-control-group" aria-label="Количество повторов">
            {REPEAT_COUNTS.map((count) => (
              <button
                className={`surah-control-chip${repeatCount === count ? " is-active" : ""}`}
                key={count}
                type="button"
                onClick={() => setRepeatCount(count)}
              >
                {count}x
              </button>
            ))}
          </div>
          <button
            className={`surah-control-chip${showTajweed ? " is-active" : ""}`}
            type="button"
            onClick={() => setShowTajweed((value) => !value)}
          >
            Таджвид
          </button>
        </div>

        {effectiveTajweed && (
          <>
            <div className="tajweed-legend" aria-label="Легенда подсветки таджвида">
              <span><i className="tajweed-dot tajweed-dot--madd" /> мадд</span>
              <span><i className="tajweed-dot tajweed-dot--ghunnah" /> гунна</span>
              <span><i className="tajweed-dot tajweed-dot--qalqalah" /> калькаля</span>
            </div>
            <p className="tajweed-disclaimer">Подсветка — вспомогательные подсказки для начинающих. Правила таджвида требуют проверки у кари или знающего учителя.</p>
          </>
        )}

        <div className="surah-detail-actions">
          {previousSurah && (
            <button className="button button--soft" type="button" onClick={() => navigate(`/quran/surah/${previousSurah.id}`)}>
              <ArrowLeft size={18} />
              Предыдущая
            </button>
          )}
          <button className={`button ${playing ? "button--soft" : "button--primary"}`} type="button" onClick={togglePlay}>
            {playing ? <Pause size={18} /> : <Play size={18} />}
            {playing ? "Пауза" : "Слушать всё"}
          </button>
          <button className="button button--soft" type="button" onClick={() => navigate(`/quran/memorization?surah=${surah.id}`)}>
            <Repeat2 size={18} />
            Заучить
          </button>
          {!surahMemorized && (
            <button className="button button--soft" type="button" onClick={handleMemorizeSurah}>
              <Star size={18} />
              Отметить выученным
            </button>
          )}
          {nextSurah && (
            <button className="button button--soft" type="button" onClick={() => navigate(`/quran/surah/${nextSurah.id}`)}>
              Следующая
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Режим отображения */}
      <div className="display-mode-tabs">
        {DISPLAY_MODES.filter((mode) => mode.key !== "translation" || translationSource.available).map((m) => (
          <button
            key={m.key}
            className={`display-mode-tab${displayMode === m.key ? " is-active" : ""}`}
            type="button"
            onClick={() => setDisplayMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Аяты */}
      <div className="ayah-detail-list">
        {ayahs.map((ayah, idx) => (
          <AyahCard
            key={ayah.number}
            ayah={ayah}
            surahId={surahId}
            mode={displayMode}
            fontSize={fontSize}
            showTajweed={effectiveTajweed}
            isBookmarked={bookmarked.includes(ayahRef(surahId, ayah.number))}
            isMemorized={memorizedAyahs.includes(ayahRef(surahId, ayah.number))}
            isRead={tracking.readAyahs.includes(ayahRef(surahId, ayah.number))}
            isCurrent={currentIdx === idx && playing}
            isHighlighted={highlightIdx === idx}
            onPlay={playOne}
            onRead={handleRead}
            onRef={(el) => { cardRefs.current[idx] = el; }}
          />
        ))}
      </div>
    </section>
  );
}
