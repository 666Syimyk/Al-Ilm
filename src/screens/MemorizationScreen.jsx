import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Headphones, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { getAyahWords, getSurahById, quranSurahs } from "../data/quranContent.js";
import { markAyahDifficult, markAyahMemorized, memorizeSurah } from "../utils/storage.js";
import { getAyahAudioUrl } from "../utils/quranAudio.js";
import { playCachedAudio, speakText, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";

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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const surah = getSurahById(params.get("surah") || quranSurahs.find((s) => s.ayahs?.length > 0)?.id);
  const ayahs = surah?.ayahs || [];

  const [ayahIdx, setAyahIdx] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [repeats, setRepeats] = useState({});
  const [memorizedSet, setMemorizedSet] = useState(new Set());
  const [difficultSet, setDifficultSet] = useState(new Set());
  const [done, setDone] = useState(false);

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const ayah = ayahs[ayahIdx];
  const words = getAyahWords(ayah);
  const ayahKey = ayah ? `${surah.id}:${ayah.number}` : null;
  const currentRepeats = ayah ? (repeats[ayah.number] || 0) : 0;
  const readyToAdvance = currentRepeats >= 3;
  const total = ayahs.length;
  const memorizedCount = memorizedSet.size;

  function playAudio() {
    if (!ayah) return;
    const url = getAyahAudioUrl(surah.number, ayah.number);
    setPlaying(true);
    playCachedAudio(url, {
      onPlaying: (audio) => { audioRef.current = audio; },
      onEnded: () => setPlaying(false),
      onError: () => {
        audioRef.current = null;
        speakText(ayah.arabic, { lang: "ar-SA", rate: 0.78, onEnd: () => setPlaying(false) });
      }
    }).catch(() => {});
  }

  function stopAudio() {
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  useEffect(() => () => stopAudio(), []);

  function handleRepeat() {
    const next = Math.min(5, currentRepeats + 1);
    setRepeats((r) => ({ ...r, [ayah.number]: next }));
    playAudio();
  }

  function handleMemorized() {
    if (!ayahKey) return;
    markAyahMemorized(ayahKey);
    setMemorizedSet((s) => new Set([...s, ayah.number]));
    stopAudio();
    if (ayahIdx < total - 1) {
      setAyahIdx((i) => i + 1);
      setHidden(false);
    } else {
      if (memorizedCount + 1 >= total) {
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
          <button className="button button--soft" type="button" onClick={() => navigate(-1)}>
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
          <div className="memorization-done__star">в­ђ</div>
          <h1>Сура завершена!</h1>
          <p className="section-kicker">{surah.title} В· {total} аятов</p>
          <p>Ты прошёл все аяты суры. Продолжай повторять каждый день.</p>
          {difficultSet.size > 0 && (
            <p className="success-note">{difficultSet.size} аятов помечено для повторения</p>
          )}
          <div className="game-actions">
            <button className="button button--soft" type="button" onClick={() => { setAyahIdx(0); setDone(false); setHidden(false); }}>
              Начать заново
            </button>
            <button className="button button--primary" type="button" onClick={() => navigate(-1)}>
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
        <button className="guide-back-icon" type="button" onClick={() => navigate(-1)} aria-label="Назад">
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
            <p className="ayah-translation-line">{ayah.translation}</p>
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
        <button className="button button--soft memorization-verdict__hard" type="button" onClick={handleDifficult} disabled={ayahIdx >= total - 1 && memorizedCount === 0}>
          <ThumbsDown size={18} />
          Сложно
        </button>
        <button className={`button ${readyToAdvance ? "button--primary" : "button--soft"} memorization-verdict__good`} type="button" onClick={handleMemorized}>
          <ThumbsUp size={18} />
          Я выучил
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
