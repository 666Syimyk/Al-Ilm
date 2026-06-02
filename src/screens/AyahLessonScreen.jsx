import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Headphones, Repeat2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import VoiceCheckPanel from "../components/VoiceCheckPanel.jsx";
import { getAyahByNumber, getAyahWords, getSurahById } from "../data/quranContent.js";
import { getAyahAudioUrl } from "../utils/quranAudio.js";
import { playCachedAudio, speakText, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";
import { markAyahRead } from "../utils/storage.js";

export default function AyahLessonScreen() {
  const navigate = useNavigate();
  const { surahId, ayahNumber } = useParams();
  const surah = getSurahById(surahId);
  const ayah = getAyahByNumber(surahId, ayahNumber);
  const words = getAyahWords(ayah);
  const nextAyah = surah.ayahs.find((item) => item.number === Number(ayahNumber) + 1);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [voicePassed, setVoicePassed] = useState(false);

  function stopAudio() {
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  function playFallbackVoice() {
    audioRef.current = null;
    setPlaying(true);
    speakText(ayah.arabic, { lang: "ar-SA", rate: 0.78, onEnd: () => setPlaying(false) });
  }

  function playAudio() {
    const url = getAyahAudioUrl(surah.number, ayah.number);
    setPlaying(true);
    playCachedAudio(url, {
      onPlaying: (audio) => { audioRef.current = audio; },
      onEnded: () => setPlaying(false),
      onError: playFallbackVoice
    }).catch(() => {});
  }

  function replayAudio() {
    playAudio();
  }

  useEffect(() => () => stopAudio(), []);

  return (
    <section className="content-stack">
      <Header title={`Аят ${ayah.number}`} subtitle={surah.title} compact>
        <button className="button button--ghost" type="button" onClick={() => navigate(-1)} aria-label="Назад">
          <ArrowLeft size={18} aria-hidden="true" />
          Назад
        </button>
      </Header>

      <GlassCard className="ayah-lesson-card">
        <p className="arabic-line arabic-line--large">{ayah.arabic}</p>
        <p>{ayah.translation}</p>
        <div className="game-actions">
          <button className="button button--soft" type="button" onClick={playAudio} aria-label="Слушать аят">
            <Headphones size={18} aria-hidden="true" />
            {playing ? "Играет..." : "Слушать"}
          </button>
          <button className="button button--soft" type="button" onClick={replayAudio} aria-label="Повторить аят">
            <Repeat2 size={18} aria-hidden="true" />
            Повторить
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => (nextAyah ? navigate(`/quran/ayah/${surah.id}/${nextAyah.number}`) : navigate(`/quran/surah/${surah.id}`))}
          >
            Следующий аят
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <button className="button button--soft" type="button" onClick={() => navigate(`/quran/surah/${surah.id}`)}>
          <BookOpenCheck size={18} aria-hidden="true" />
          Открыть суру
        </button>
      </GlassCard>

      <VoiceCheckPanel
        targets={[ayah.arabic, ...words.map((word) => word.reading || word.arabic)]}
        prompt="Прочитай аят вслух после прослушивания."
        successText="Отлично! Аят прочитан уверенно."
        threshold={0.52}
        onPassed={() => {
          markAyahRead(`${surah.id}:${ayah.number}`);
          setVoicePassed(true);
        }}
      />

      {voicePassed ? (
        <GlassCard className="quran-section-card">
          <p className="success-note">Голосовая проверка пройдена. Аят отмечен как прочитанный.</p>
        </GlassCard>
      ) : null}

      {words.length ? (
        <GlassCard className="quran-section-card">
          <h2>Пословный разбор</h2>
          <div className="word-breakdown-grid">
            {words.map((word, index) => (
              <div className="word-breakdown-card" key={`${word.arabic}-${index}`}>
                <strong>{word.arabic}</strong>
                {word.reading ? <span>{word.reading}</span> : null}
                {word.meaning ? <small>{word.meaning}</small> : null}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </section>
  );
}
