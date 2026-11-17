import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, BellOff, Check, ChevronRight, Clock3, Compass,
  BookOpen, Droplets, FileText, Headphones, Landmark,
  MapPin, Minus, Navigation, Pause, Play, Plus, Radio, Save,
  Search, Settings, SkipBack, SkipForward
} from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import ahmad from "../assets/characters/ahmad.webp";
import amina from "../assets/characters/amina.webp";
import ahmadPrayerSprite from "../assets/prayer/ahmad-prayer-sprite.webp";
import aminaPrayerSprite from "../assets/prayer/amina-prayer-sprite.webp";
import { buildPrayerGuide, PRAYERS } from "../data/namazGuide.js";
import {
  buildPrayerDataFromCoords, calculateQiblaDirection, geocodeCity,
  getPrayerSettings, getCurrentPrayerTimes, getPrayerReminders, setPrayerSettings, PRAYER_METHODS, ASR_MADHABS,
  PRAYER_ADJUSTMENT_KEYS, MAX_PRAYER_ADJUSTMENT,
  requestPrayerTimes, updateCountdown
} from "../data/prayerTimes.js";
import {
  getDonePrayersForDate,
  getNamazDayKey,
  recordNamazDayCompletion,
  getNamazProgress,
  getSelectedCharacter,
  getStoredJson,
  getStoredValue,
  setDonePrayersForDate,
  setNamazProgress,
  setStoredJson,
  setStoredValue
} from "../utils/storage.js";
import { getCachedAudio, playCachedAudio, playAudioSources, speakText, stopAudioElement, stopSpeech } from "../utils/audioPlayback.js";
import { getRecordingSources } from "../utils/quranAudio.js";
import { getMagneticDeclination, readTrueHeading } from "../utils/compass.js";

const prayerSprites = {
  ahmad: ahmadPrayerSprite,
  amina: aminaPrayerSprite,
};

const prayerPoseClass = {
  standing: "standing",
  standing_folded: "standing-folded",
  takbir: "takbir",
  ruku: "ruku",
  sujud: "sujud",
  sitting: "sitting",
};

// ── SVG иллюстрации позиций ───────────────────────────────────────────────────
function PrayerFigure({ position, character = "ahmad" }) {
  const pose = prayerPoseClass[position] || prayerPoseClass.standing;
  const sprite = prayerSprites[character] || prayerSprites.ahmad;

  if (sprite) {
    return (
      <div
        className={`prayer-figure prayer-figure--sprite prayer-figure--${pose}`}
        role="img"
        aria-label="Поза намаза"
        style={{ "--prayer-sprite": `url(${sprite})` }}
      />
    );
  }

  const c = "#3B82F6";
  const figures = {
    standing: (
      <svg viewBox="0 0 80 180" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="18" r="13" />
        <line x1="40" y1="31" x2="40" y2="100" />
        <line x1="40" y1="55" x2="18" y2="80" /><line x1="40" y1="55" x2="62" y2="80" />
        <line x1="40" y1="100" x2="26" y2="165" /><line x1="40" y1="100" x2="54" y2="165" />
      </svg>
    ),
    standing_folded: (
      <svg viewBox="0 0 80 180" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="18" r="13" />
        <line x1="40" y1="31" x2="40" y2="100" />
        <path d="M18 65 Q40 78 62 65" /><line x1="18" y1="65" x2="26" y2="55" /><line x1="62" y1="65" x2="54" y2="55" />
        <line x1="40" y1="100" x2="26" y2="165" /><line x1="40" y1="100" x2="54" y2="165" />
      </svg>
    ),
    takbir: (
      <svg viewBox="0 0 80 180" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="40" cy="18" r="13" />
        <line x1="40" y1="31" x2="40" y2="100" />
        <line x1="40" y1="50" x2="10" y2="38" /><line x1="40" y1="50" x2="70" y2="38" />
        <line x1="40" y1="100" x2="26" y2="165" /><line x1="40" y1="100" x2="54" y2="165" />
      </svg>
    ),
    ruku: (
      <svg viewBox="0 0 120 120" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="100" cy="22" r="13" />
        <line x1="100" y1="35" x2="20" y2="55" />
        <line x1="20" y1="55" x2="5" y2="55" /><line x1="35" y1="52" x2="35" y2="115" />
        <line x1="100" y1="35" x2="105" y2="50" />
      </svg>
    ),
    sujud: (
      <svg viewBox="0 0 140 100" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="25" r="11" />
        <line x1="12" y1="36" x2="12" y2="80" />
        <line x1="12" y1="80" x2="90" y2="80" />
        <line x1="90" y1="80" x2="110" y2="55" /><line x1="110" y1="80" x2="130" y2="55" />
        <line x1="12" y1="55" x2="30" y2="40" /><line x1="30" y1="40" x2="50" y2="50" />
      </svg>
    ),
    sitting: (
      <svg viewBox="0 0 100 140" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="18" r="13" />
        <line x1="50" y1="31" x2="50" y2="85" />
        <line x1="50" y1="55" x2="25" y2="75" /><line x1="50" y1="55" x2="75" y2="75" />
        <path d="M50 85 Q30 95 15 110" /><path d="M50 85 Q60 95 80 100 Q95 100 95 90" />
      </svg>
    )
  };
  return (
    <div className="prayer-figure">
      {figures[position] || figures.standing}
    </div>
  );
}

// ── Вспомогательные ───────────────────────────────────────────────────────────
const CITY_COORDS = {
  "москва": [55.7558, 37.6173, "Москва"], "казань": [55.7887, 49.1221, "Казань"],
  "алматы": [43.2220, 76.8512, "Алматы"], "астана": [51.1801, 71.4460, "Астана"],
  "ташкент": [41.2995, 69.2401, "Ташкент"], "бишкек": [42.8746, 74.5698, "Бишкек"],
  "ош": [40.5283, 72.7985, "Ош"], "джалал-абад": [40.9333, 72.9833, "Джалал-Абад"], "джалал абад": [40.9333, 72.9833, "Джалал-Абад"],
  "каракол": [42.4907, 78.3936, "Каракол"], "токмок": [42.8419, 75.3015, "Токмок"], "кант": [42.8911, 74.8508, "Кант"],
  "нарын": [41.4287, 75.9911, "Нарын"], "талас": [42.5228, 72.2427, "Талас"], "баткен": [40.0626, 70.8194, "Баткен"],
  "душанбе": [38.5598, 68.7870, "Душанбе"], "уфа": [54.7388, 55.9721, "Уфа"],
  "махачкала": [42.9849, 47.5047, "Махачкала"], "грозный": [43.3170, 45.6986, "Грозный"],
  "стамбул": [41.0082, 28.9784, "Стамбул"], "дубай": [25.2048, 55.2708, "Дубай"],
  "баку": [40.4093, 49.8671, "Баку"], "минск": [53.9045, 27.5615, "Минск"],
  "санкт-петербург": [59.9311, 30.3609, "Санкт-Петербург"],
  "новосибирск": [54.9885, 82.9207, "Новосибирск"]
};

const MECCA = { lat: 21.4225241, lng: 39.8261818 };

const RADIO_STATIONS = [
  {
    id: "quran",
    name: "Коран радио",
    desc: "Спокойная тилява для повторения",
    lang: "арабский",
    streamUrl: "https://radio.mp3islam.com/listen/quran_radio/radio.mp3"
  },
  {
    id: "nasheed",
    name: "Мишари Аль-Афаси",
    desc: "Чтение Корана для спокойного повторения",
    lang: "арабский",
    streamUrl: "https://radio.mp3islam.com/listen/mishary/radio.mp3"
  },
  {
    id: "kids",
    name: "Абдуррахман Ас-Судайс",
    desc: "Коран радио с известной тилавой",
    lang: "арабский",
    streamUrl: "https://radio.mp3islam.com/listen/sudais/radio.mp3"
  }
];

const MOSQUE_PLACES = [
  { city: "Бишкек", name: "Центральная мечеть им. Имама Сарахси", type: "мечеть", address: "ул. Гоголя, Бишкек", lat: 42.8779, lng: 74.6122, open: "ежедневно" },
  { city: "Бишкек", name: "Мечеть Аль-Фарук", type: "мечеть", address: "район Джал, Бишкек", lat: 42.8444, lng: 74.5652, open: "ежедневно" },
  { city: "Москва", name: "Московская Соборная мечеть", type: "мечеть", address: "Выползов пер., 7", lat: 55.7797, lng: 37.6269, open: "ежедневно" },
  { city: "Москва", name: "Историческая мечеть", type: "мечеть", address: "Большая Татарская ул., 28", lat: 55.7394, lng: 37.6297, open: "ежедневно" },
  { city: "Казань", name: "Кул Шариф", type: "мечеть", address: "Казанский Кремль", lat: 55.7987, lng: 49.1053, open: "ежедневно" },
  { city: "Казань", name: "Мечеть Марджани", type: "мечеть", address: "ул. Каюма Насыри, 17", lat: 55.7788, lng: 49.1186, open: "ежедневно" },
  { city: "Алматы", name: "Центральная мечеть Алматы", type: "мечеть", address: "ул. Пушкина, 16", lat: 43.2632, lng: 76.9568, open: "ежедневно" },
  { city: "Ташкент", name: "Минор мечеть", type: "мечеть", address: "Ташкент, Минор", lat: 41.3358, lng: 69.2825, open: "ежедневно" },
  { city: "Душанбе", name: "Центральная соборная мечеть Душанбе", type: "мечеть", address: "Душанбе", lat: 38.5858, lng: 68.7868, open: "ежедневно" },
  { city: "Уфа", name: "Ляля-Тюльпан", type: "мечеть", address: "ул. Комарова, 5", lat: 54.8143, lng: 56.0759, open: "ежедневно" },
  { city: "Махачкала", name: "Центральная Джума-мечеть", type: "мечеть", address: "ул. Дахадаева, 136", lat: 42.9814, lng: 47.5035, open: "ежедневно" },
  { city: "Грозный", name: "Сердце Чечни", type: "мечеть", address: "просп. В. В. Путина", lat: 43.3178, lng: 45.6987, open: "ежедневно" }
];

const FEATURE_CARDS = [
  { id: "wudu", title: "Омовение", desc: "перед намазом", icon: Droplets },
  { id: "radio", title: "Радио", desc: "онлайн эфир", icon: Radio },
  { id: "mosques", title: "Мечети", desc: "справочник и карта", icon: Landmark },
  { id: "kaza", title: "Каза", desc: "счётчик пропущенных", icon: BookOpen },
  { id: "notes", title: "Заметки", desc: "мои записи", icon: FileText }
];

const WUDU_STEPS = [
  { title: "Намерение", text: "В сердце реши: я делаю омовение ради Аллаха." },
  { title: "Бисмиллях", text: "Скажи «Бисмиллях» и начни спокойно." },
  { title: "Кисти рук", text: "Вымой кисти до запястий 3 раза." },
  { title: "Рот", text: "Прополощи рот 3 раза." },
  { title: "Нос", text: "Аккуратно промой нос 3 раза." },
  { title: "Лицо", text: "Вымой всё лицо 3 раза." },
  { title: "Руки до локтей", text: "Сначала правую руку, потом левую — по 3 раза." },
  { title: "Голова и уши", text: "Влажными руками протри голову и уши 1 раз." },
  { title: "Ноги", text: "Вымой ноги до щиколоток: правую, потом левую — по 3 раза." }
];

function calcQibla(lat, lng) {
  return calculateQiblaDirection(lat, lng);
}

function readLocalString(key, fallback = "") {
  return getStoredValue(key, fallback) || fallback;
}

function writeLocalString(key, value) {
  setStoredValue(key, value);
}

function getNotifEnabled() { return readLocalString("notificationsEnabled") === "true"; }

async function showPrayerNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const appIcon = `${import.meta.env.BASE_URL}icons/icon-192.png`;
  const options = { body, icon: appIcon, badge: appIcon, tag: "al-ilm-prayer" };

  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch {
      // fall back to a page notification
    }
  }

  try { new Notification(title, options); } catch { /* Some mobile browsers require an installed PWA. */ }
}

function readLocalJson(key, fallback) {
  return getStoredJson(key, fallback);
}

function writeLocalJson(key, value) {
  setStoredJson(key, value);
}

function toggleDone(name) {
  const done = getDonePrayersForDate();
  const next = done.includes(name) ? done.filter((n) => n !== name) : [...done, name];
  setDonePrayersForDate(next);

  setNamazProgress({ completedPrayers: next });
  recordNamazDayCompletion(new Date(), PRAYERS.map((prayer) => prayer.name));

  return next;
}

function distanceKm(fromLat, fromLng, toLat, toLng) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearbyMosques(data) {
  if (Number.isFinite(data?.lat) && Number.isFinite(data?.lng)) {
    return MOSQUE_PLACES
      .map((place) => ({ ...place, distance: distanceKm(data.lat, data.lng, place.lat, place.lng) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  const city = String(data?.city || "").toLocaleLowerCase("ru");
  const cityMatches = MOSQUE_PLACES.filter((place) => city.includes(place.city.toLocaleLowerCase("ru")));
  return (cityMatches.length ? cityMatches : MOSQUE_PLACES.slice(0, 5)).map((place) => ({ ...place, distance: null }));
}

function getKazaState() {
  return readLocalJson("namazKaza", PRAYERS.reduce((acc, prayer) => ({
    ...acc,
    [prayer.id]: { missed: 0, completed: 0 }
  }), {}));
}

function getPrayerNotes() {
  return readLocalJson("namazNotes", {});
}

// ── ЭКРАН ГИДА — пошаговый намаз ──────────────────────────────────────────────
function PrayerGuideScreen({ prayer, onBack }) {
  const character = getSelectedCharacter() || "ahmad";
  const [gender, setGender] = useState(character === "amina" ? "female" : "male");
  const steps = buildPrayerGuide(prayer, { gender });

  // Строим плейлист: {arabic, audioUrl, stepIdx, ayahIdx}
  const playlist = [];
  steps.forEach((item, stepIdx) => {
    if (item.type === "step") {
      item.items.forEach((ayah, ayahIdx) => {
        if (ayah.arabic) playlist.push({ arabic: ayah.arabic, audioUrl: ayah.audioUrl || null, repeats: ayah.repeat ? 3 : 1, stepIdx, ayahIdx });
      });
    }
  });

  const SPEEDS = [0.5, 0.65, 1, 1.5, 2];
  const SPEED_LABELS = ["0.5x", "0.65x", "1x", "1.5x", "2x"];

  const [audioIdx, setAudioIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1); // default 0.65x
  const isPlayingRef = useRef(false);
  const speedRef = useRef(SPEEDS[1]);
  const scrollRef = useRef(null);
  const audioElRef = useRef(null);
  const runRef = useRef(0);
  const [audioError, setAudioError] = useState("");

  useEffect(() => {
    const urls = [...new Set(playlist.map((item) => item.audioUrl).filter(Boolean))];
    urls.forEach((url) => getCachedAudio(url));
  }, [prayer.id]);

  function cancelAll() {
    runRef.current += 1;
    stopSpeech();
    stopAudioElement(audioElRef.current);
    audioElRef.current = null;
  }

  // Скролл к элементу с data-audio-idx
  function scrollToItem(idx) {
    const el = scrollRef.current?.querySelector(`[data-audio-idx="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Воспроизвести item[idx] и автоматически перейти к следующему
  function playFrom(idx, repeatsRemaining = playlist[idx]?.repeats || 1) {
    if (!isPlayingRef.current || idx >= playlist.length) {
      setPlaying(false);
      isPlayingRef.current = false;
      return;
    }
    setAudioIdx(idx);
    setTimeout(() => scrollToItem(idx), 80);
    cancelAll();
    const run = runRef.current;
    setAudioError("");

    const item = playlist[idx];
    const advance = () => {
      if (run !== runRef.current || !isPlayingRef.current) return;
      if (repeatsRemaining > 1) playFrom(idx, repeatsRemaining - 1);
      else playFrom(idx + 1);
    };
    const fail = () => {
      if (run !== runRef.current) return;
      isPlayingRef.current = false;
      setPlaying(false);
      setAudioError("Не удалось воспроизвести. Проверь интернет и звук в профиле, затем повтори.");
    };

    if (item.audioUrl) {
      // Quran ayahs have audioUrl — use CDN only, no TTS fallback for sacred text
      playAudioSources(getRecordingSources(item.audioUrl), {
        cancelCurrent: false,
        playbackRate: Math.min(speedRef.current, 2),
        onReady: (audio) => { audioElRef.current = audio; },
        onEnded: advance,
        onError: fail,
        onStop: () => { if (run === runRef.current) { isPlayingRef.current = false; setPlaying(false); } }
      });
    } else {
      // Non-Quran dhikr/dua: TTS is acceptable as these are not Quran ayahs
      speakText(item.arabic, { lang: "ar-SA", rate: speedRef.current, onEnd: advance, onError: fail });
    }
  }

  function togglePlay() {
    if (playing) {
      cancelAll();
      isPlayingRef.current = false;
      setPlaying(false);
    } else {
      isPlayingRef.current = true;
      setPlaying(true);
      playFrom(audioIdx);
    }
  }

  function prev() {
    const i = Math.max(0, audioIdx - 1);
    setAudioIdx(i);
    scrollToItem(i);
    if (playing) playFrom(i);
  }

  function next() {
    const i = Math.min(playlist.length - 1, audioIdx + 1);
    setAudioIdx(i);
    scrollToItem(i);
    if (playing) playFrom(i);
  }

  function cycleSpeed() {
    const next = (speedIdx + 1) % SPEEDS.length;
    speedRef.current = SPEEDS[next];
    setSpeedIdx(next);
    if (isPlayingRef.current) {
      playFrom(audioIdx);
    }
  }

  // Нажатие на кнопку ▶ у конкретного аята
  function playOne(globalIdx) {
    isPlayingRef.current = true;
    setPlaying(true);
    playFrom(globalIdx);
  }

  useEffect(() => () => { cancelAll(); isPlayingRef.current = false; }, []);

  // Счётчик globalIdx для каждого аята
  let globalCounter = -1;

  return (
    <div className="guide-screen">
      {/* Хедер */}
      <div className="guide-screen-header">
        <button className="guide-back-icon" type="button" onClick={onBack} aria-label="Назад">
          <ArrowLeft size={22} />
        </button>
        <div className="guide-screen-title">
          <span>{prayer.icon}</span>
          <div>
            <strong>{prayer.name}</strong>
            <span className="guide-screen-sub">{prayer.rakaats} ракаата · {prayer.nameRu}</span>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="guide-content-scroll" ref={scrollRef}>
        <div className="guide-gender-switch" role="group" aria-label="Для кого показывать положения тела">
          <button type="button" className={gender === "male" ? "is-active" : ""} aria-pressed={gender === "male"} onClick={() => setGender("male")}>Для мальчиков</button>
          <button type="button" className={gender === "female" ? "is-active" : ""} aria-pressed={gender === "female"} onClick={() => setGender("female")}>Для девочек</button>
        </div>
        <p className="content-source-note">Порядок фард-намаза по ханафитскому мазхабу, упрощённо для детей. Если ваша семья следует другому мазхабу или имам учит иначе — следуйте ему. Транслитерация приблизительная; голос браузера не проверяет произношение. Аяты звучат в записи Аль-Афаси, арабский текст — <a href="https://tanzil.net" target="_blank" rel="noreferrer">Tanzil</a>.</p>
        {steps.map((item, idx) => {
          if (item.type === "section") {
            return (
              <div key={idx} className="guide-section-header" style={{ background: item.color }}>
                {item.label}
              </div>
            );
          }
          return (
            <div key={idx} className="guide-step-block">
              <PrayerFigure position={item.position} character={gender === "female" ? "amina" : "ahmad"} />
              {item.note && <p className="guide-step-note">{item.note}</p>}
              {item.items.map((ayah, ai) => {
                if (!ayah.arabic) return null;
                globalCounter++;
                const gIdx = globalCounter;
                const isActive = playing && audioIdx === gIdx;
                return (
                  <div
                    key={ai}
                    className={`guide-ayah-block ${isActive ? "is-active" : ""}`}
                    data-audio-idx={gIdx}
                  >
                    <p className="guide-ayah-arabic" dir="rtl">{ayah.arabic}</p>
                    <p className="guide-ayah-translit">
                      {ayah.translit}
                      {ayah.repeat && <span className="guide-ayah-repeat"> {ayah.repeat}</span>}
                    </p>
                    {ayah.translation ? <p className="guide-ayah-translation">{ayah.translation}</p> : null}
                    <button
                      className="guide-ayah-audio"
                      type="button"
                      onClick={() => playOne(gIdx)}
                      aria-label="Прослушать"
                    >
                      ▶
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
        <div style={{ height: 100 }} />
      </div>

      {/* Аудиоплеер */}
      {playlist.length > 0 && (
        <div className="guide-audio-player">
          {audioError && <p role="status" className="audio-unavailable-note">{audioError}</p>}
          <div className="guide-audio-info">
            <span className="guide-audio-index">{audioIdx + 1}/{playlist.length}</span>
            <span className="guide-audio-text" dir="rtl">{playlist[audioIdx]?.arabic?.slice(0, 28)}…</span>
          </div>
          <div className="guide-audio-controls">
            <button className="guide-speed-btn" type="button" onClick={cycleSpeed} aria-label="Скорость">
              {SPEED_LABELS[speedIdx]}
            </button>
            <button type="button" onClick={prev} disabled={audioIdx === 0} aria-label="Предыдущая фраза"><SkipBack size={18} /></button>
            <button className="guide-audio-play" type="button" onClick={togglePlay} aria-label={playing ? "Остановить чтение" : "Начать чтение"}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button type="button" onClick={next} disabled={audioIdx >= playlist.length - 1} aria-label="Следующая фраза"><SkipForward size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── КИБЛА-КОМПАС ──────────────────────────────────────────────────────────────
function QiblaScreen({ data, onBack }) {
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(null);
  const [orientStatus, setOrientStatus] = useState("idle");
  const [geoStatus, setGeoStatus] = useState(data._computed ? "ok" : "pending");
  const [localData, setLocalData] = useState(data);
  const orientationHandlerRef = useRef(null);
  const orientationTimeoutRef = useRef(null);
  // The orientation handler outlives renders; it reads the declination for the latest location.
  const declinationRef = useRef(0);
  useEffect(() => () => {
    clearTimeout(orientationTimeoutRef.current);
    if (orientationHandlerRef.current) {
      window.removeEventListener("deviceorientationabsolute", orientationHandlerRef.current, true);
      window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
    }
  }, []);

  useEffect(() => {
    if (localData._computed && Number.isFinite(localData.lat)) {
      setQibla(calcQibla(localData.lat, localData.lng));
      setGeoStatus("ok");
    }
  }, [localData]);

  function requestGeo() {
    setGeoStatus("loading");
    requestPrayerTimes((d) => { setLocalData(d); setGeoStatus("ok"); }, () => setGeoStatus("denied"));
  }

  async function startCompass() {
    if (!window.DeviceOrientationEvent) { setOrientStatus("unsupported"); return; }
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const p = await DeviceOrientationEvent.requestPermission();
        if (p !== "granted") { setOrientStatus("denied"); return; }
      } catch { setOrientStatus("denied"); return; }
    }
    setOrientStatus("waiting");
    if (orientationHandlerRef.current) {
      window.removeEventListener("deviceorientationabsolute", orientationHandlerRef.current, true);
      window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
    }
    const handler = (e) => {
      const trueHeading = readTrueHeading(e, declinationRef.current);
      if (trueHeading !== null) { setHeading(trueHeading); setOrientStatus("active"); }
    };
    orientationHandlerRef.current = handler;
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    clearTimeout(orientationTimeoutRef.current);
    orientationTimeoutRef.current = setTimeout(() => setOrientStatus((status) => status === "waiting" ? "unsupported" : status), 3000);
  }

  const declination = getMagneticDeclination(localData.lat, localData.lng);
  declinationRef.current = declination;
  const needleAngle = qibla != null && heading != null ? (qibla - heading + 360) % 360 : qibla;
  const distance = Number.isFinite(localData.lat)
    ? Math.round(Math.acos(Math.sin(localData.lat * Math.PI / 180) * Math.sin(MECCA.lat * Math.PI / 180) + Math.cos(localData.lat * Math.PI / 180) * Math.cos(MECCA.lat * Math.PI / 180) * Math.cos((MECCA.lng - localData.lng) * Math.PI / 180)) * 6371)
    : null;

  return (
    <div className="guide-screen">
      <div className="guide-screen-header">
        <button className="guide-back-icon" type="button" onClick={onBack}><ArrowLeft size={22} /></button>
        <div className="guide-screen-title"><Compass size={20} color="#3B82F6" /><div><strong>Кибла</strong><span className="guide-screen-sub">Направление на Мекку</span></div></div>
      </div>
      <div className="guide-content-scroll">
        {geoStatus === "pending" && (
          <GlassCard className="geo-prompt-card"><MapPin size={22} color="var(--green-dark)" /><div><h3>Нужна геолокация</h3><p>Для расчёта направления Киблы</p></div><button className="button button--primary" onClick={requestGeo}>Определить</button></GlassCard>
        )}
        {geoStatus === "loading" && <div className="toast-message">Определяем местоположение...</div>}
        {geoStatus === "denied" && <GlassCard className="geo-prompt-card"><MapPin size={22} color="var(--green-dark)" /><div><h3>Геолокация недоступна</h3><p>Разрешите доступ в браузере</p></div><button className="button button--primary" onClick={requestGeo}>Повторить</button></GlassCard>}

        {qibla == null && geoStatus !== "loading" && (
          <GlassCard className="qibla-compass-card qibla-compass-card--preview">
            <p className="section-kicker">Кибла</p>
            <div className="qibla-compass-wrap">
              <div className="qibla-compass-placeholder-ring" aria-hidden="true">
                <span>С</span><span>В</span><span>Ю</span><span>З</span>
              </div>
              <div className="qibla-needle-wrap qibla-needle-wrap--preview">
                <div className="qibla-needle">
                  <div className="qibla-needle-top" aria-label="Стрелка Киблы"><Navigation size={42} strokeWidth={2.6} /></div>
                  <div className="qibla-needle-line" />
                </div>
              </div>
              <div className="qibla-center"><Compass size={20} color="var(--green-dark)" /></div>
            </div>
            <p className="qibla-compass-hint">Нажми «Определить», и стрелка покажет направление Киблы.</p>
          </GlassCard>
        )}

        {qibla != null && (
          <>
            <GlassCard className="qibla-compass-card">
              <p className="section-kicker">{localData.city} → Мекка</p>
              <div className="qibla-compass-wrap">
                <div className="qibla-compass-ring" style={{ transform: heading != null ? `rotate(${-heading}deg)` : "none" }}>
                  <svg viewBox="0 0 200 200" className="qibla-ring-svg">
                    <circle cx="100" cy="100" r="96" fill="none" stroke="var(--stroke)" strokeWidth="2" />
                    {["С","В","Ю","З"].map((label, i) => {
                      const a = i * 90 * Math.PI / 180;
                      const tx = 100 + 76 * Math.sin(a);
                      const ty = 100 - 76 * Math.cos(a);
                      return <text key={label} x={tx} y={ty + 4} textAnchor="middle" fontSize="12" fontWeight="900" fill={label === "С" ? "#EF4444" : "var(--text-muted)"}>{label}</text>;
                    })}
                    {Array.from({ length: 72 }).map((_, i) => {
                      const a = i * 5 * Math.PI / 180;
                      const r1 = i % 9 === 0 ? 86 : 90;
                      return <line key={i} x1={100 + r1 * Math.sin(a)} y1={100 - r1 * Math.cos(a)} x2={100 + 96 * Math.sin(a)} y2={100 - 96 * Math.cos(a)} stroke="var(--stroke)" strokeWidth={i % 9 === 0 ? 2 : 0.8} />;
                    })}
                  </svg>
                </div>
                <div className="qibla-needle-wrap" style={{ transform: needleAngle != null ? `rotate(${needleAngle}deg)` : "none" }}>
                  <div className="qibla-needle"><div className="qibla-needle-top" aria-label="Стрелка Киблы"><Navigation size={42} strokeWidth={2.6} /></div><div className="qibla-needle-line" /></div>
                </div>
                <div className="qibla-center"><Compass size={20} color="var(--green-dark)" /></div>
              </div>
              <div className="qibla-info-row">
                <div className="qibla-info-item"><p className="section-kicker">Направление</p><strong>{Math.round(qibla)}°</strong></div>
                {distance && <div className="qibla-info-item"><p className="section-kicker">До Мекки</p><strong>{distance.toLocaleString()} км</strong></div>}
                {heading != null && <div className="qibla-info-item"><p className="section-kicker">Компас</p><strong>{Math.round(heading)}°</strong></div>}
              </div>
              {orientStatus !== "active"
                ? <button className="button button--primary" type="button" onClick={startCompass} disabled={orientStatus === "waiting"}><Compass size={16} /> {orientStatus === "waiting" ? "Ожидаю датчик..." : "Включить компас"}</button>
                : <p className="qibla-compass-hint">Поверни устройство — стрелка 🕋 укажет на Мекку</p>
              }
              {orientStatus === "unsupported" && <p className="city-error">Датчик не сообщил направление на север. Число выше — угол от географического севера; проверь направление внешним компасом.</p>}
              {orientStatus === "denied" && <p className="city-error">Доступ к датчику не разрешён. Можно повторить запрос.</p>}
              {orientStatus === "active" && Math.abs(declination) >= 0.5 && <p className="qibla-compass-hint">Учтено магнитное склонение {declination > 0 ? "+" : ""}{declination.toFixed(1)}° для вашего места.</p>}
            </GlassCard>
            <GlassCard className="qibla-tip-card">
              <p className="section-kicker">Как пользоваться</p>
              <ol className="qibla-tip-list">
                <li>Нажми «Включить компас» и разреши доступ</li>
                <li>Положи телефон ровно, экраном вверх, подальше от металла, магнитов и колонок</li>
                <li>Если стрелка прыгает, поводи телефоном «восьмёркой» для калибровки</li>
                <li>Поворачивайся, пока 🕋 не укажет вперёд. Сверься с михрабом ближайшей мечети, если есть возможность</li>
              </ol>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}

// ── ГЛАВНЫЙ СПИСОК НАМАЗОВ ────────────────────────────────────────────────────
function WuduPanel() {
  return (
    <GlassCard className="namaz-feature-panel namaz-wudu-panel">
      <div className="namaz-feature-panel__head">
        <div>
          <p className="section-kicker">Перед намазом</p>
          <h2>Как правильно делать омовение</h2>
          <p>Иди по шагам сверху вниз. Делай спокойно и аккуратно.</p>
        </div>
        <Droplets size={26} aria-hidden="true" />
      </div>

      <div className="namaz-wudu-list">
        {WUDU_STEPS.map((step, index) => (
          <div className="namaz-wudu-step" key={step.title}>
            <span className="namaz-wudu-step__num">{index + 1}</span>
            <span className="namaz-wudu-step__body">
              <strong>{step.title}</strong>
              <small>{step.text}</small>
            </span>
          </div>
        ))}
      </div>

      <div className="namaz-wudu-note">
        <strong>Когда обновить омовение?</strong>
        <span>После туалета, сна, выхода газов или если омовение нарушилось.</span>
      </div>
    </GlassCard>
  );
}

function RadioPanel() {
  const audioRef = useRef(null);
  const [activeStation, setActiveStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radioStatus, setRadioStatus] = useState("Выбери эфир");

  function stopRadio() {
    if (audioRef.current) {
      stopAudioElement(audioRef.current);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveStation(null);
    setRadioStatus("Эфир остановлен");
  }

  async function playStation(station) {
    if (activeStation === station.id && isPlaying) {
      stopRadio();
      return;
    }

    stopRadio();
    setActiveStation(station.id);
    setRadioStatus("Подключаемся к эфиру...");
    await playCachedAudio(station.streamUrl, {
      onReady: (audio) => { audioRef.current = audio; },
      onPlaying: () => { setIsPlaying(true); setRadioStatus(`Сейчас играет: ${station.name}`); },
      onStop: () => { setIsPlaying(false); setRadioStatus("Эфир остановлен"); },
      onError: () => { setRadioStatus("Поток недоступен. Проверь интернет и звук в профиле или выбери другой эфир."); setIsPlaying(false); }
    });
  }

  useEffect(() => () => stopRadio(), []);

  return (
    <GlassCard className="namaz-feature-panel namaz-radio-panel">
      <div className="namaz-feature-panel__head">
        <div>
          <p className="section-kicker">Онлайн радио</p>
          <h2>Эфир для чтения и повторения</h2>
        </div>
        <Headphones size={26} aria-hidden="true" />
      </div>
      <p className="namaz-panel-note">{radioStatus}</p>
      <div className="namaz-radio-list">
        {RADIO_STATIONS.map((station) => {
          const active = activeStation === station.id && isPlaying;
          return (
            <button className={`namaz-radio-card${active ? " is-active" : ""}`} key={station.id} type="button" onClick={() => playStation(station)}>
              <span className="namaz-radio-card__play">{active ? <Pause size={18} /> : <Play size={18} />}</span>
              <span className="namaz-radio-card__copy">
                <strong>{station.name}</strong>
                <small>{station.desc}</small>
              </span>
              <span className="namaz-radio-card__lang">{station.lang}</span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

function MosquesPanel({ data }) {
  const places = getNearbyMosques(data);

  function openMaps(place = null) {
    const query = place
      ? encodeURIComponent(`${place.name} ${place.address}`)
      : encodeURIComponent("mosque near me");
    window.open(`https://www.google.com/maps/search/${query}`, "_blank", "noopener,noreferrer");
  }

  return (
    <GlassCard className="namaz-feature-panel">
      <div className="namaz-feature-panel__head">
        <div>
          <p className="section-kicker">Мечети рядом</p>
          <h2>Места для намаза</h2>
        </div>
        <button className="button button--soft" type="button" onClick={() => openMaps()}>
          <Navigation size={16} aria-hidden="true" />
          Карта
        </button>
      </div>
      <p className="content-source-note">Встроенный справочник выбранных городов. Кнопка «Карта» открывает внешний поиск мечетей.</p>
      <div className="namaz-mosque-list">
        {places.map((place) => (
          <button className="namaz-mosque-card" key={`${place.city}-${place.name}`} type="button" onClick={() => openMaps(place)}>
            <span className="namaz-mosque-card__icon"><Landmark size={19} aria-hidden="true" /></span>
            <span className="namaz-mosque-card__body">
              <strong>{place.name}</strong>
              <small>{place.address}</small>
            </span>
            <span className="namaz-mosque-card__meta">
              {place.distance ? `${place.distance.toFixed(1)} км` : place.city}
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function KazaPanel() {
  const [kaza, setKaza] = useState(getKazaState);

  function updateKaza(prayerId, field, delta) {
    setKaza((current) => {
      const item = current[prayerId] || { missed: 0, completed: 0 };
      const nextItem = { ...item, [field]: Math.max(0, item[field] + delta) };
      const next = { ...current, [prayerId]: nextItem };
      writeLocalJson("namazKaza", next);
      return next;
    });
  }

  const totalMissed = PRAYERS.reduce((sum, prayer) => sum + (kaza[prayer.id]?.missed || 0), 0);
  const totalCompleted = PRAYERS.reduce((sum, prayer) => sum + (kaza[prayer.id]?.completed || 0), 0);
  const left = Math.max(0, totalMissed - totalCompleted);

  return (
    <GlassCard className="namaz-feature-panel">
      <div className="namaz-feature-panel__head">
        <div>
          <p className="section-kicker">Календарь каза</p>
          <h2>Пропущенные намазы</h2>
        </div>
        <span className="namaz-kaza-left">{left} осталось</span>
      </div>
      <div className="namaz-kaza-summary">
        <span>Пропущено: <strong>{totalMissed}</strong></span>
        <span>Возмещено: <strong>{totalCompleted}</strong></span>
      </div>
      <div className="namaz-kaza-list">
        {PRAYERS.map((prayer) => {
          const item = kaza[prayer.id] || { missed: 0, completed: 0 };
          const prayerLeft = Math.max(0, item.missed - item.completed);
          return (
            <div className="namaz-kaza-row" key={prayer.id}>
              <div>
                <strong>{prayer.name}</strong>
                <span>{prayerLeft} осталось</span>
              </div>
              <div className="namaz-kaza-controls">
                <button type="button" onClick={() => updateKaza(prayer.id, "missed", -1)} aria-label="Уменьшить пропущенные"><Minus size={15} /></button>
                <span>{item.missed}</span>
                <button type="button" onClick={() => updateKaza(prayer.id, "missed", 1)} aria-label="Добавить пропущенный"><Plus size={15} /></button>
              </div>
              <div className="namaz-kaza-controls is-done">
                <button type="button" onClick={() => updateKaza(prayer.id, "completed", -1)} aria-label="Уменьшить возмещённые"><Minus size={15} /></button>
                <span>{item.completed}</span>
                <button type="button" onClick={() => updateKaza(prayer.id, "completed", 1)} aria-label="Добавить возмещённый"><Plus size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function NotesPanel({ data }) {
  const [notes, setNotes] = useState(getPrayerNotes);
  const [activePrayer, setActivePrayer] = useState(PRAYERS.find((p) => p.name === data.nextPrayer)?.id || PRAYERS[0].id);
  const today = getNamazDayKey();
  const noteKey = `${today}_${activePrayer}`;
  const [noteText, setNoteText] = useState(notes[noteKey] || "");

  function selectPrayer(prayerId) {
    const nextKey = `${today}_${prayerId}`;
    setActivePrayer(prayerId);
    setNoteText(notes[nextKey] || "");
  }

  function saveNote() {
    const next = { ...notes, [noteKey]: noteText.trim() };
    if (!next[noteKey]) delete next[noteKey];
    writeLocalJson("namazNotes", next);
    setNotes(next);
  }

  const todayNotes = Object.entries(notes)
    .filter(([key, value]) => key.startsWith(today) && value)
    .map(([key, value]) => {
      const prayerId = key.slice(today.length + 1);
      const prayer = PRAYERS.find((p) => p.id === prayerId);
      return { prayer, value };
    });

  return (
    <GlassCard className="namaz-feature-panel">
      <div className="namaz-feature-panel__head">
        <div>
          <p className="section-kicker">Заметки дня</p>
          <h2>Мысли между намазами</h2>
        </div>
        <FileText size={26} aria-hidden="true" />
      </div>
      <div className="namaz-note-tabs">
        {PRAYERS.map((prayer) => (
          <button className={activePrayer === prayer.id ? "is-active" : ""} key={prayer.id} type="button" onClick={() => selectPrayer(prayer.id)}>
            {prayer.name}
          </button>
        ))}
      </div>
      <textarea
        className="namaz-note-input"
        value={noteText}
        onChange={(event) => setNoteText(event.target.value)}
        placeholder="Напиши заметку: что выучить, что повторить, о чём сделать дуа..."
      />
      <button className="button button--primary" type="button" onClick={saveNote}>
        <Save size={16} aria-hidden="true" />
        Сохранить заметку
      </button>
      {todayNotes.length > 0 && (
        <div className="namaz-note-list">
          {todayNotes.map(({ prayer, value }) => (
            <div className="namaz-note-item" key={`${prayer?.id}-${value}`}>
              <strong>{prayer?.name || "Намаз"}</strong>
              <p>{value}</p>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function NamazFeaturePanel({ activeFeature, data }) {
  if (activeFeature === "wudu") return <WuduPanel />;
  if (activeFeature === "radio") return <RadioPanel />;
  if (activeFeature === "mosques") return <MosquesPanel data={data} />;
  if (activeFeature === "kaza") return <KazaPanel />;
  if (activeFeature === "notes") return <NotesPanel key={getNamazDayKey()} data={data} />;
  return null;
}

export default function NamazScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(getCurrentPrayerTimes);
  const [notifEnabled, setNotifEnabled] = useState(getNotifEnabled);
  const [notifMsg, setNotifMsg] = useState("");
  const [geoStatus, setGeoStatus] = useState(data._computed ? "ok" : "pending");
  const [cityInput, setCityInput] = useState("");
  const [cityError, setCityError] = useState("");
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [donePrayers, setDonePrayers] = useState(getDonePrayersForDate);
  const [view, setView] = useState("list"); // list | guide | qibla
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  const [activeFeature, setActiveFeature] = useState("wudu");

  // The panel opens below the grid; bring it into view so the tap visibly does something.
  function openFeature(id) {
    setActiveFeature(id);
    requestAnimationFrame(() => {
      const panel = document.getElementById("namaz-active-feature");
      if (panel && panel.getBoundingClientRect().top > window.innerHeight * 0.55) {
        const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      }
    });
  }
  const [prayerSettings, setPrayerSettingsState] = useState(getPrayerSettings);
  const dayKeyRef = useRef(getNamazDayKey());
  const locationRequestRef = useRef(0);

  // Ask for device location only after the explicit “Моё место” action.
  useEffect(() => () => { locationRequestRef.current += 1; }, []);

  useEffect(() => {
    const refreshLocation = () => setData(getCurrentPrayerTimes());
    const t = setInterval(() => {
      setData((p) => updateCountdown(p));
      const dayKey = getNamazDayKey();
      if (dayKey !== dayKeyRef.current) {
        dayKeyRef.current = dayKey;
        setDonePrayers(getDonePrayersForDate());
      }
    }, 1000);
    window.addEventListener("prayerTimesChange", refreshLocation);
    return () => { clearInterval(t); window.removeEventListener("prayerTimesChange", refreshLocation); };
  }, []);

  useEffect(() => {
    if (!data._computed || !notifEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    const timers = getPrayerReminders(data).map(({ name, at }) =>
      setTimeout(() => showPrayerNotification(`Намаз ${name}`, "Через 5 минут. Подготовьтесь к молитве."), at - Date.now())
    );
    return () => timers.forEach(clearTimeout);
  }, [data._computed, data.city, data.nextPrayerDate, notifEnabled]);

  async function toggleNotif() {
    if (!("Notification" in window)) { setNotifMsg("❌ Не поддерживается"); setTimeout(() => setNotifMsg(""), 3000); return; }
    if (notifEnabled) {
      writeLocalString("notificationsEnabled", "false");
      setNotifEnabled(false);
      setNotifMsg("🔕 Уведомления отключены");
    } else {
      let perm;
      try { perm = await Notification.requestPermission(); } catch { perm = "denied"; }
      if (perm === "granted") {
        writeLocalString("notificationsEnabled", "true");
        setNotifEnabled(true);
        setNotifMsg("🔔 Уведомления включены!");
        showPrayerNotification("Аль-Ильм", "Напоминания о намазе за 5 минут");
      } else {
        setNotifMsg("❌ Разрешение не дано");
      }
    }
    setTimeout(() => setNotifMsg(""), 3000);
  }

  function requestCurrentLocation() {
    const request = ++locationRequestRef.current;
    setGeoStatus("loading");
    setCityError("");
    requestPrayerTimes(
      (d) => {
        if (request !== locationRequestRef.current) return;
        setData(d);
        setGeoStatus("ok");
        setCityInput("");
        setIsCitySearchOpen(false);
      },
      () => { if (request === locationRequestRef.current) setGeoStatus("denied"); },
      { isCurrent: () => request === locationRequestRef.current }
    );
  }

  function updatePrayerSetting(key, value) {
    // Without a saved city the schedule object does not change, so settings live in state.
    setPrayerSettingsState(setPrayerSettings({ [key]: value }));
    setData(getCurrentPrayerTimes());
  }

  function updatePrayerAdjustment(id, minutes) {
    updatePrayerSetting("adjustments", { ...prayerSettings.adjustments, [id]: minutes });
  }

  async function handleCitySearch(e) {
    e.preventDefault();
    const query = cityInput.trim();
    if (!query) {
      setCityError("Введите город или координаты.");
      return;
    }

    setCityError("Ищем город...");
    const request = ++locationRequestRef.current;
    try {
      const place = await geocodeCity(query);
      if (request !== locationRequestRef.current) return;
      setData(buildPrayerDataFromCoords(place.lat, place.lng, place.name, prayerSettings, {
        timeZone: place.timeZone,
        region: place.region,
        country: place.country
      }));
      setGeoStatus("ok");
      setCityInput(place.name);
      setCityError("");
      setIsCitySearchOpen(false);
      return;
    } catch {
      // Fall back to the small built-in list when network geocoding is unavailable.
    }
    if (request !== locationRequestRef.current) return;

    const key = query.toLowerCase();
    const found = CITY_COORDS[key];
    if (found) {
      const [lat, lng, name] = found;
      const timeZone = /бишкек|ош|джалал|каракол|токмок|кант|нарын|талас|баткен/.test(key) ? "Asia/Bishkek"
        : /алматы|астана/.test(key) ? "Asia/Almaty"
          : key === "ташкент" ? "Asia/Tashkent" : key === "душанбе" ? "Asia/Dushanbe"
            : key === "дубай" ? "Asia/Dubai" : key === "баку" ? "Asia/Baku"
              : key === "стамбул" ? "Europe/Istanbul" : key === "минск" ? "Europe/Minsk"
                : key === "новосибирск" ? "Asia/Novosibirsk" : key === "уфа" ? "Asia/Yekaterinburg" : "Europe/Moscow";
      setData(buildPrayerDataFromCoords(lat, lng, name, prayerSettings, { timeZone }));
      setGeoStatus("ok");
      setCityError("");
      setIsCitySearchOpen(false);
    } else {
      setCityError("Город не найден. Введите подробнее, например: Бишкек, Кыргызстан или New York, USA.");
    }
  }

  if (view === "guide" && selectedPrayer) {
    return <PrayerGuideScreen prayer={selectedPrayer} onBack={() => setView("list")} />;
  }

  if (view === "qibla") {
    return <QiblaScreen data={data} onBack={() => setView("list")} />;
  }

  // Вычисляем время окончания (= начало следующего намаза)
  function normalizePrayerName(name) {
    return String(name || "").trim().toLowerCase().replace(/\s+/g, "");
  }

  function getPrayerTimeEntry(name) {
    const target = normalizePrayerName(name);
    return data.times.find((time) => normalizePrayerName(time.name) === target);
  }

  function getPrayerStartTime(name) {
    const entry = getPrayerTimeEntry(name);
    if (entry?.time) return entry.time;
    if (normalizePrayerName(name) === normalizePrayerName(data.nextPrayer) && data.nextPrayerTime) {
      return data.nextPrayerTime;
    }
    return "—";
  }

  function getEndTime(name) {
    const times = data.times;
    const target = normalizePrayerName(name);
    const idx = times.findIndex((t) => normalizePrayerName(t.name) === target);
    if (idx < 0) return "—";
    return times[(idx + 1) % times.length]?.time || "—";
  }

  const fardPrayers = PRAYERS;
  const completedCount = donePrayers.filter((n) => fardPrayers.find((p) => p.name === n)).length;
  const todayLabel = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  return (
    <section className="namaz-dashboard">
      <header className="premium-quran-appbar">
        <div><span>Учись постепенно, шаг за шагом</span><h1>Намаз</h1></div>
        <div className="premium-quran-appbar__actions">
          <button type="button" onClick={() => navigate("/namaz/progress")} aria-label="Прогресс намаза"><Check size={20} aria-hidden="true" /></button>
        </div>
      </header>
      {notifMsg && <div className="toast-message" role="status">{notifMsg}</div>}
      {data.error && <p role="status" className="audio-unavailable-note">{data.error}</p>}

      <div className="namaz-dashboard__layout">
        <aside className="namaz-dashboard__column namaz-dashboard__left">
          <section className="namaz-dashboard__card namaz-dashboard__hero">
            <div>
              <span className="namaz-dashboard__kicker">Учимся вместе</span>
              <h2>Намаз — шаг за шагом</h2>
              <p>Открой подсказки, слушай и повторяй в своём темпе.</p>
            </div>
            <img src={getSelectedCharacter() === "amina" ? amina : ahmad} alt="" />
            <button className="button button--primary" type="button" onClick={() => { setSelectedPrayer(PRAYERS[0]); setView("guide"); }}>
              Начать обучение <ChevronRight size={18} aria-hidden="true" />
            </button>
          </section>

          <section className="namaz-dashboard__card namaz-dashboard__settings">
            <div className="namaz-dashboard__head"><div><span className="namaz-dashboard__kicker">Расчёт времени</span><h2>Метод и Аср</h2></div><Settings size={22} aria-hidden="true" /></div>
            <label><span>Метод</span>
              <select value={prayerSettings.method} onChange={(event) => updatePrayerSetting("method", event.target.value)}>
                {PRAYER_METHODS.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
              </select>
            </label>
            <label><span>Аср</span>
              <select value={prayerSettings.madhab} onChange={(event) => updatePrayerSetting("madhab", event.target.value)}>
                {ASR_MADHABS.map((madhab) => <option key={madhab.id} value={madhab.id}>{madhab.label}</option>)}
              </select>
            </label>
            <p className="namaz-dashboard__note">Расчёт по формуле может отличаться от расписания вашего муфтията или мечети на 5–20 минут. Сверьте время и при необходимости подправьте его ниже.</p>
            <details className="namaz-adjustments">
              <summary>Подстроить под мою мечеть</summary>
              <div className="namaz-adjustments__list">
                {PRAYER_ADJUSTMENT_KEYS.map(({ id, label }) => {
                  const minutes = prayerSettings.adjustments[id];
                  return (
                    <div className="namaz-adjustments__row" key={id}>
                      <span>{label}</span>
                      <button type="button" onClick={() => updatePrayerAdjustment(id, minutes - 1)} disabled={minutes <= -MAX_PRAYER_ADJUSTMENT} aria-label={`${label}: на минуту раньше`}><Minus size={16} aria-hidden="true" /></button>
                      <output aria-live="polite">{minutes > 0 ? `+${minutes}` : minutes} мин</output>
                      <button type="button" onClick={() => updatePrayerAdjustment(id, minutes + 1)} disabled={minutes >= MAX_PRAYER_ADJUSTMENT} aria-label={`${label}: на минуту позже`}><Plus size={16} aria-hidden="true" /></button>
                    </div>
                  );
                })}
              </div>
            </details>
          </section>

          <section className="namaz-dashboard__card namaz-dashboard__reminders">
            <div className="namaz-dashboard__head"><h2>Напоминания</h2><Bell size={22} aria-hidden="true" /></div>
            <p className="namaz-dashboard__note">За 5 минут до намаза. Работают, пока открыт этот экран.</p>
            <button className="button button--soft" type="button" onClick={toggleNotif} aria-pressed={notifEnabled}>
              {notifEnabled ? <BellOff size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
              {notifEnabled ? "Выключить напоминания" : "Включить напоминания"}
            </button>
          </section>
        </aside>

        <div className="namaz-dashboard__column namaz-dashboard__center">
          {data._computed && <section className="namaz-dashboard__card namaz-dashboard__next">
            <span className="namaz-dashboard__icon"><Clock3 size={28} aria-hidden="true" /></span>
            <div><span className="namaz-dashboard__kicker">Следующий намаз</span><h2>{data.nextPrayer}</h2><p className="namaz-dashboard__note">Через <strong className="namaz-dashboard__countdown">{data.countdown}</strong></p></div>
            <strong className="namaz-dashboard__time">{data.nextPrayerTime}</strong>
          </section>}

          <section className="namaz-dashboard__card namaz-dashboard__location">
            <div className="namaz-dashboard__head">
              <div><span className="namaz-dashboard__kicker"><MapPin size={14} aria-hidden="true" /> Город расписания</span><h2>{data._computed ? data.city : "Выбери город"}</h2></div>
              {data._computed && <button className="button button--soft" type="button" onClick={() => setIsCitySearchOpen((value) => !value)} aria-expanded={isCitySearchOpen} aria-controls={isCitySearchOpen ? "namaz-location-form" : undefined}>{isCitySearchOpen ? "Закрыть" : "Изменить город"}</button>}
            </div>
            {(isCitySearchOpen || !data._computed) && <div id="namaz-location-form" className="namaz-dashboard__location-form">
              <form onSubmit={handleCitySearch}>
                <input type="text" value={cityInput} aria-label="Город или координаты для расчёта времени намаза" onChange={(event) => setCityInput(event.target.value)} placeholder="Например, Алматы" autoComplete="off" />
                <button className="button button--primary" type="submit" aria-label="Найти город"><Search size={18} aria-hidden="true" /></button>
              </form>
              <button className="button button--soft" type="button" onClick={requestCurrentLocation} disabled={geoStatus === "loading"}><Navigation size={16} aria-hidden="true" />Моё место</button>
            </div>}
            {cityError && <p className="city-error" role="status">{cityError}</p>}
            {geoStatus === "denied" && <p role="status" className="namaz-dashboard__note">Геолокация недоступна. Выбери город в форме или разреши доступ к местоположению.</p>}
            {geoStatus === "loading" && <p role="status" className="namaz-dashboard__note">Определяем местоположение...</p>}
          </section>

          <section className="namaz-dashboard__card namaz-dashboard__schedule">
            <div className="namaz-dashboard__head">
              <div><span className="namaz-dashboard__kicker">{todayLabel}</span><h2>Намазы сегодня</h2></div>
              <span className="namaz-dashboard__pill" aria-label={`Выполнено ${completedCount} из ${fardPrayers.length}`}>{completedCount} / {fardPrayers.length}</span>
            </div>
            <p className="namaz-dashboard__note">Нажми на намаз, чтобы открыть пошаговый урок.</p>
            <div className="namaz-dashboard__prayers">
              {fardPrayers.map((prayer) => {
                const isNext = data._computed && prayer.name === data.nextPrayer;
                const isDone = donePrayers.includes(prayer.name);
                return <div key={prayer.id} className={`namaz-dashboard__prayer${isNext ? " is-next" : ""}${isDone ? " is-done" : ""}`}>
                  <button className="namaz-dashboard__check" type="button" onClick={() => setDonePrayers(toggleDone(prayer.name))} aria-pressed={isDone} aria-label={`${prayer.name}: ${isDone ? "снять отметку о выполнении" : "отметить выполненным"}`}>
                    {isDone && <Check size={20} aria-hidden="true" />}
                  </button>
                  <button className="namaz-dashboard__prayer-link" type="button" onClick={() => { setSelectedPrayer(prayer); setView("guide"); }} aria-label={`Открыть гид ${prayer.name}`}>
                    <span className="namaz-dashboard__prayer-copy"><strong>{prayer.name}</strong><small>{prayer.nameRu} · {prayer.rakaats} ракаата</small>{data._computed && <small>До {getEndTime(prayer.name)}{isNext ? " · следующий" : ""}</small>}</span>
                    <span className="namaz-dashboard__prayer-time">{getPrayerStartTime(prayer.name)}</span>
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>;
              })}
            </div>
            <button className="button button--soft" type="button" onClick={() => navigate("/namaz/progress")}>Мой прогресс <ChevronRight size={17} aria-hidden="true" /></button>
          </section>

          <section className="namaz-dashboard__card namaz-dashboard__learning">
            <div className="namaz-dashboard__head"><div><span className="namaz-dashboard__kicker">Суры и дуа для намаза</span><h2>Учить по строкам</h2></div><BookOpen size={26} aria-hidden="true" /></div>
            <p>Слушай, повторяй и проверяй себя.</p>
            <div className="namaz-dashboard__tags"><span>Аль-Фатиха</span><span>Аль-Ихлас</span><span>Аль-Фаляк</span><span>Ан-Нас</span><span>Ежедневные дуа</span></div>
            <button className="button button--primary" type="button" onClick={() => navigate("/namaz/surahs")}>Открыть заучивание <ChevronRight size={17} aria-hidden="true" /></button>
          </section>
        </div>

        <aside className="namaz-dashboard__column namaz-dashboard__right">
          <section className="namaz-dashboard__card namaz-dashboard__tools">
            <div className="namaz-dashboard__head"><div><span className="namaz-dashboard__kicker">Всё под рукой</span><h2>Разделы</h2></div><Compass size={22} aria-hidden="true" /></div>
            <div className="namaz-dashboard__tools-grid">
              <button className="namaz-dashboard__tool" type="button" onClick={() => setView("qibla")}><Compass size={22} aria-hidden="true" /><strong>Кибла</strong><small>Компас</small></button>
              {FEATURE_CARDS.map((feature) => {
                const Icon = feature.icon;
                return <button className={`namaz-dashboard__tool${activeFeature === feature.id ? " is-active" : ""}`} key={feature.id} type="button" onClick={() => openFeature(feature.id)} aria-pressed={activeFeature === feature.id} aria-controls="namaz-active-feature">
                  <Icon size={22} aria-hidden="true" /><strong>{feature.title}</strong><small>{feature.desc}</small>
                </button>;
              })}
            </div>
          </section>
          <div id="namaz-active-feature" className="namaz-dashboard__feature"><NamazFeaturePanel activeFeature={activeFeature} data={data} /></div>
        </aside>
      </div>
    </section>
  );
}
