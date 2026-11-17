import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, Headphones, Repeat2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import Header from "../components/Header.jsx";
import VoiceCheckPanel from "../components/VoiceCheckPanel.jsx";
import { getAyahByNumber, getAyahWords, getSurahById, quranSurahs, quranTextSource, translationSource } from "../data/quranContent.js";
import { getAyahAudioSources } from "../utils/quranAudio.js";
import { playAudioSources, stopAllAudio, stopAudioElement } from "../utils/audioPlayback.js";
import { markAyahRead } from "../utils/storage.js";
import { goBack } from "../utils/navigation.js";

export default function AyahLessonScreen() {
  const { surahId, ayahNumber } = useParams();
  const navigate = useNavigate();
  const surah = quranSurahs.find((item) => item.id === surahId);
  if (!surah?.ayahs.some((item) => item.number === Number(ayahNumber))) {
    return <section className="content-stack"><p>Аят не найден.</p><button className="button button--primary" type="button" onClick={() => navigate("/quran/surahs")}>К сурам</button></section>;
  }
  return <AyahLessonSession key={`${surahId}:${ayahNumber}`} />;
}

function AyahLessonSession() {
  const navigate = useNavigate();
  const { surahId, ayahNumber } = useParams();
  const surah = getSurahById(surahId);
  const ayah = getAyahByNumber(surahId, ayahNumber);
  const words = getAyahWords(ayah);
  const nextAyah = surah.ayahs.find((item) => item.number === Number(ayahNumber) + 1);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [voicePassed, setVoicePassed] = useState(false);

  function stopAudio() {
    stopAllAudio();
    stopAudioElement(audioRef.current);
    audioRef.current = null;
    setPlaying(false);
  }

  function playAudio() {
    stopAudio();
    setPlaying(true);
    setAudioError(false);
    playAudioSources(getAyahAudioSources(surah.number, ayah.number), {
      onReady: (audio) => { audioRef.current = audio; },
      onEnded: () => { setPlaying(false); markAyahRead(`${surah.id}:${ayah.number}`); },
      onStop: () => setPlaying(false),
      onError: () => {
        audioRef.current = null;
        setPlaying(false);
        setAudioError(true);
      }
    });
  }

  function replayAudio() {
    playAudio();
  }

  useEffect(() => () => stopAudio(), []);

  return (
    <section className="content-stack">
      <Header title={`Аят ${ayah.number}`} subtitle={surah.title} compact>
        <button className="button button--ghost" type="button" onClick={() => goBack(navigate, "/quran/surahs")} aria-label="Назад">
          <ArrowLeft size={18} aria-hidden="true" />
          Назад
        </button>
      </Header>

      <GlassCard className="ayah-lesson-card">
        <p className="arabic-line arabic-line--large">{ayah.arabic}</p>
        <p className="content-source-note">{ayah.translation ? "Перевод смыслов:" : translationSource.note}</p>
        {ayah.translation && <p>{ayah.translation}</p>}
        <p className="content-source-note"><a href={quranTextSource.url} target="_blank" rel="noreferrer">Арабский текст: Tanzil</a></p>
        {audioError ? (
          <p className="audio-unavailable-note">Аудио временно недоступно. Проверьте интернет или попробуйте позже.</p>
        ) : null}
        <div className="game-actions">
          <button className="button button--soft" type="button" onClick={playing ? stopAudio : playAudio} aria-label={playing ? "Остановить аят" : "Слушать аят"}>
            <Headphones size={18} aria-hidden="true" />
            {playing ? "Стоп" : "Слушать"}
          </button>
          <button className="button button--soft" type="button" onClick={playAudio} aria-label="Повторить аят">
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
        targets={[ayah.arabic]}
        prompt="Прочитай аят вслух после прослушивания."
        successText="Распознанный текст совпал с аятом. Произношение проверь с учителем."
        threshold={0.9}
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

      <GlassCard className="quran-section-card">
        <h2>Пословный разбор</h2>
        {words.length ? (
          <>
            <p className="content-source-note">Транслитерация приблизительная. Требует проверки знающим учителем.</p>
            <div className="word-breakdown-grid">
              {words.map((word, index) => (
                <div className="word-breakdown-card" key={`${word.arabic}-${index}`}>
                  <strong>{word.arabic}</strong>
                  {word.reading ? <span>{word.reading}</span> : null}
                  {word.meaning ? <small>{word.meaning}</small> : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="content-source-note">Пословный разбор готовится и будет добавлен после проверки знающим специалистом.</p>
        )}
      </GlassCard>
    </section>
  );
}
