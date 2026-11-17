import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Headphones, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { getAyahWords, getSurahById, quranSurahs, translationSource, quranTextSource } from "../data/quranContent.js";
import { getQuranTracking, markAyahRead, markAyahDifficult, markAyahMemorized, memorizeSurah, unmarkAyahDifficult } from "../utils/storage.js";
import { getAyahAudioSources } from "../utils/quranAudio.js";
import { playAudioSources, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";
import { countAyahs } from "../utils/plural.js";
import { goBack } from "../utils/navigation.js";

function RepeatDots({ count, target = 3 }) {
  return (
    <div className="memorization-counter">
      {Array.from({ length: target }, (_, i) => (
        <span key={i} className={i < count ? "is-done" : ""} />
      ))}
    </div>
  );
}

export default function MemorizationScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const requestedSurah = params.get("surah");
  if (requestedSurah && !quranSurahs.some((surah) => surah.id === requestedSurah)) return <section className="content-stack"><p>Сура не найдена.</p><button className="button button--primary" type="button" onClick={() => navigate("/quran/surahs")}>К сурам</button></section>;
  return <MemorizationSession key={params.get("surah") || "default"} />;
}

function MemorizationSession() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const surah = getSurahById(params.get("surah") || quranSurahs.find((s) => s.ayahs?.length > 0)?.id);
  const ayahs = surah?.ayahs || [];

  const [ayahIdx, setAyahIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [repeats, setRepeats] = useState({});
  const [memorizedSet, setMemorizedSet] = useState(() => new Set(ayahs.filter((ayah) => getQuranTracking().memorizedAyahs.includes(`${surah.id}:${ayah.number}`)).map((ayah) => ayah.number)));
  const [difficultSet, setDifficultSet] = useState(() => new Set(ayahs.filter((ayah) => getQuranTracking().difficultAyahs.includes(`${surah.id}:${ayah.number}`)).map((ayah) => ayah.number)));
  const [done, setDone] = useState(false);

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const ayah = ayahs[ayahIdx];
  const words = getAyahWords(ayah);
  const ayahKey = ayah ? `${surah.id}:${ayah.number}` : null;
  const currentRepeats = ayah ? (repeats[ayah.number] || 0) : 0;
  const readyToAdvance = currentRepeats >= 3;
  const total = ayahs.length;
  const memorizedCount = memorizedSet.size;

  function playAudio() {
    if (!ayah) return;
    stopAudio();
    setPlaying(true);
    setAudioError(false);
    playAudioSources(getAyahAudioSources(surah.number, ayah.number), {
      onReady: (audio) => { audioRef.current = audio; },
      onEnded: () => {
        setPlaying(false);
        markAyahRead(ayahKey);
        setRepeats((r) => ({ ...r, [ayah.number]: Math.min(3, (r[ayah.number] || 0) + 1) }));
      },
      onStop: () => setPlaying(false),
      onError: () => {
        audioRef.current = null;
        setPlaying(false);
        setAudioError(true);
      }
    });
  }

  function stopAudio() {
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  useEffect(() => () => stopAudio(), []);

  function handleRepeat() {
    playAudio();
  }

  function handleMemorized() {
    if (!ayahKey) return;
    markAyahMemorized(ayahKey);
    unmarkAyahDifficult(ayahKey);
    setDifficultSet((current) => new Set([...current].filter((number) => number !== ayah.number)));
    const nextMemorized = new Set([...memorizedSet, ayah.number]);
    setMemorizedSet(nextMemorized);
    stopAudio();
    if (ayahIdx < total - 1) {
      setAyahIdx((i) => i + 1);
      setHidden(false);
    } else {
      if (nextMemorized.size >= total) {
        memorizeSurah(surah.id);
      }
      setDone(true);
    }
  }

  function handleDifficult() {
    if (!ayahKey) return;
    markAyahDifficult(ayahKey);
    setDifficultSet((s) => new Set([...s, ayah.number]));
    stopAudio();
    if (ayahIdx < total - 1) {
      setAyahIdx((i) => i + 1);
      setHidden(false);
    }
  }

  function goNext() {
    stopAudio();
    if (ayahIdx < total - 1) {
      setAyahIdx((i) => i + 1);
      setHidden(false);
    }
  }

  function goPrev() {
    stopAudio();
    if (ayahIdx > 0) {
      setAyahIdx((i) => i - 1);
      setHidden(false);
    }
  }

  if (!ayahs.length) {
    return (
      <section className="content-stack quran-inner-screen quran-memorization-screen">
        <GlassCard className="memorization-card">
          <p>Для этой суры аяты будут добавлены позже.</p>
          <button className="button button--soft" type="button" onClick={() => goBack(navigate, "/quran")}>
            <ArrowLeft size={18} /> Назад
          </button>
        </GlassCard>
      </section>
    );
  }

  if (done) {
    return (
      <section className="content-stack quran-inner-screen quran-memorization-screen">
        <div className="memorization-done">
          <div className="memorization-done__star">★</div>
          <h1>{memorizedCount === total ? "Все аяты отмечены как выученные" : "Повторение завершено"}</h1>
          <p className="section-kicker">{surah.title} · {countAyahs(total)}</p>
          <p>Выучено по твоей отметке: {memorizedCount} из {total}. Продолжай повторять с учителем.</p>
          {difficultSet.size > 0 && (
            <p className="success-note">На повторении: {countAyahs(difficultSet.size)}</p>
          )}
          <div className="game-actions">
            <button className="button button--soft" type="button" onClick={() => { setAyahIdx(0); setDone(false); setHidden(false); }}>
              Начать заново
            </button>
            <button className="button button--primary" type="button" onClick={() => goBack(navigate, "/quran")}>
              Готово
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-stack quran-inner-screen quran-memorization-screen">
      {/* Шапка */}
      <div className="memorization-header">
        <button className="guide-back-icon" type="button" onClick={() => goBack(navigate, "/quran")} aria-label="Назад">
          <ArrowLeft size={22} />
        </button>
        <div>
          <strong>{surah.title}</strong>
          <span className="section-kicker">Аят {ayahIdx + 1} из {total}</span>
        </div>
        <span className="memorization-progress-pill">{memorizedCount}/{total} выучено</span>
      </div>

      {/* Прогресс-бар */}
      <div className="memorization-progress-bar">
        <div className="memorization-progress-fill" style={{ width: `${(ayahIdx / total) * 100}%` }} />
      </div>

      {/* Карточка аята */}
      <GlassCard className="memorization-card">
        <div className="memorization-card__ayah-num">
          {memorizedSet.has(ayah.number) && <span className="mem-badge">✓ выучен</span>}
          {difficultSet.has(ayah.number) && <span className="mem-badge mem-badge--hard">сложный</span>}
        </div>

        {!hidden ? (
          <>
            <p className="arabic-line arabic-line--large">{ayah.arabic}</p>
            {ayah.translation && <p className="ayah-translation-line">{ayah.translation}</p>}
            {words.length ? (
              <p className="ayah-translit">{words.map((word) => word.reading || word.arabic).join(" / ")}</p>
            ) : null}
          </>
        ) : (
          <div className="memorization-hidden-state">
            <p className="section-kicker">Аят {ayah.number} скрыт</p>
            <p>Попробуй вспомнить аят по памяти</p>
          </div>
        )}

        <RepeatDots count={currentRepeats} />

        {currentRepeats >= 3 && !hidden && (
          <p className="success-note">Хорошо! Теперь попробуй скрыть текст.</p>
        )}
      </GlassCard>

      {!translationSource.available && <p className="content-source-note">{translationSource.note} <a href={quranTextSource.url} target="_blank" rel="noreferrer">Арабский текст: Tanzil</a></p>}

      {audioError ? (
        <p className="audio-unavailable-note">Аудио временно недоступно. Проверьте интернет или попробуйте позже.</p>
      ) : null}

      {/* Кнопки */}
      <div className="memorization-actions">
        <button className={`button button--soft${playing ? " is-active" : ""}`} type="button" onClick={playing ? stopAudio : playAudio}>
          <Headphones size={18} />
          {playing ? "Стоп" : "Слушать"}
        </button>
        <button className="button button--soft" type="button" onClick={handleRepeat}>
          Повторить {currentRepeats > 0 ? `(${currentRepeats}/3)` : ""}
        </button>
        <button className="button button--soft" type="button" onClick={() => setHidden((v) => !v)}>
          {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
          {hidden ? "Показать" : "Скрыть"}
        </button>
      </div>

      <div className="memorization-verdict">
        <button className="button button--soft memorization-verdict__hard" type="button" onClick={handleDifficult}>
          <ThumbsDown size={18} />
          Сложно
        </button>
        <button className={`button ${readyToAdvance ? "button--primary" : "button--soft"} memorization-verdict__good`} type="button" onClick={handleMemorized}>
          <ThumbsUp size={18} />
          Знаю наизусть
        </button>
      </div>

      {/* Навигация */}
      <div className="memorization-nav">
        <button className="button button--ghost" type="button" onClick={goPrev} disabled={ayahIdx === 0}>
          <ArrowLeft size={18} /> Пред.
        </button>
        <button className="button button--ghost" type="button" onClick={goNext} disabled={ayahIdx >= total - 1}>
          След. <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
