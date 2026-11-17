import { Coordinates, CalculationMethod, HighLatitudeRule, Madhab, PrayerTimes, Prayer, Qibla } from "adhan";

import { getStoredJson, getStoredValue, setStoredJson, setStoredValue } from "../utils/storage.js";

const PRAYER_NAMES_RU = {
  [Prayer.Fajr]: "Фаджр",
  [Prayer.Sunrise]: "Восход",
  [Prayer.Dhuhr]: "Зухр",
  [Prayer.Asr]: "Аср",
  [Prayer.Maghrib]: "Магриб",
  [Prayer.Isha]: "Иша",
  none: "Фаджр"
};

const STORAGE_KEY_COORDS = "prayerCoords";
const STORAGE_KEY_DATE = "prayerCoordsDate";
const STORAGE_KEY_CITY = "prayerCity";
const STORAGE_KEY_TIMEZONE = "prayerTimezone";
const STORAGE_KEY_REGION = "prayerRegion";
const STORAGE_KEY_SETTINGS = "prayerSettings";

export const PRAYER_METHODS = [
  { id: "mwl", label: "Всемирная исламская лига (MWL)" },
  { id: "moonsighting", label: "Комитет наблюдения луны (северные широты)" },
  { id: "turkey", label: "Диянет (Турция)" },
  { id: "egyptian", label: "Египет" },
  { id: "karachi", label: "Карачи (Пакистан)" },
  { id: "umm_al_qura", label: "Умм аль-Кура (Мекка)" },
  { id: "dubai", label: "Дубай" },
  { id: "kuwait", label: "Кувейт" },
  { id: "qatar", label: "Катар" },
  { id: "north_america", label: "Северная Америка (ISNA)" }
];

// Local muftiates publish their own timetables. Per-prayer minute offsets let a family
// match the schedule of their mosque instead of trusting a generic method.
export const PRAYER_ADJUSTMENT_KEYS = [
  { id: "fajr", label: "Фаджр" },
  { id: "sunrise", label: "Восход" },
  { id: "dhuhr", label: "Зухр" },
  { id: "asr", label: "Аср" },
  { id: "maghrib", label: "Магриб" },
  { id: "isha", label: "Иша" }
];
export const MAX_PRAYER_ADJUSTMENT = 30;

export const ASR_MADHABS = [
  { id: "shafi", label: "Шафии, Малики, Ханбали" },
  { id: "hanafi", label: "Ханафи" }
];

const DEFAULT_SETTINGS = {
  method: "mwl",
  madhab: "hanafi",
  adjustments: {}
};

const METHOD_BUILDERS = {
  mwl: () => CalculationMethod.MuslimWorldLeague(),
  moonsighting: () => CalculationMethod.MoonsightingCommittee(),
  turkey: () => CalculationMethod.Turkey(),
  egyptian: () => CalculationMethod.Egyptian(),
  karachi: () => CalculationMethod.Karachi(),
  umm_al_qura: () => CalculationMethod.UmmAlQura(),
  dubai: () => CalculationMethod.Dubai(),
  kuwait: () => CalculationMethod.Kuwait(),
  qatar: () => CalculationMethod.Qatar(),
  north_america: () => CalculationMethod.NorthAmerica()
};

function sanitizeAdjustments(value) {
  const source = value && typeof value === "object" ? value : {};
  return Object.fromEntries(PRAYER_ADJUSTMENT_KEYS.map(({ id }) => {
    const minutes = Math.round(Number(source[id]) || 0);
    return [id, Math.max(-MAX_PRAYER_ADJUSTMENT, Math.min(MAX_PRAYER_ADJUSTMENT, minutes))];
  }));
}

function pad(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function formatTime(date, timeZone = getBrowserTimeZone()) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone
    }).format(date);
  } catch {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}

function formatCountdown(ms) {
  if (ms < 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function loadCachedCoords() {
  const parsed = getStoredJson(STORAGE_KEY_COORDS);
  if (!isValidCoordinate(parsed?.lat, parsed?.lng)) return null;
  return parsed;
}

function readStorage(key, fallback = null) {
  return getStoredValue(key, fallback) || fallback;
}

function writeStorage(key, value) {
  setStoredValue(key, value);
}

function saveCoords(lat, lng, city, timeZone = getBrowserTimeZone(), region = "") {
  setStoredJson(STORAGE_KEY_COORDS, { lat, lng, timeZone, region });
  writeStorage(STORAGE_KEY_DATE, getTodayDateString());
  if (city) writeStorage(STORAGE_KEY_CITY, city);
  if (timeZone) writeStorage(STORAGE_KEY_TIMEZONE, timeZone);
  if (region) writeStorage(STORAGE_KEY_REGION, region);
  if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent("prayerTimesChange"));
  }
}

export function getPrayerSettings() {
  const stored = getStoredJson(STORAGE_KEY_SETTINGS, {}) || {};
  return {
    method: PRAYER_METHODS.some((item) => item.id === stored.method) ? stored.method : DEFAULT_SETTINGS.method,
    madhab: ASR_MADHABS.some((item) => item.id === stored.madhab) ? stored.madhab : DEFAULT_SETTINGS.madhab,
    adjustments: sanitizeAdjustments(stored.adjustments)
  };
}

export function setPrayerSettings(settings) {
  const next = { ...getPrayerSettings(), ...settings };
  next.adjustments = sanitizeAdjustments(next.adjustments);
  setStoredJson(STORAGE_KEY_SETTINGS, next);
  if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("prayerTimesChange"));
  return getPrayerSettings();
}

function buildParams(settings = getPrayerSettings(), coords = null) {
  const build = METHOD_BUILDERS[settings.method] || METHOD_BUILDERS.mwl;
  const params = build();
  params.madhab = settings.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  if (coords) params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  // Methods such as Dubai keep their own methodAdjustments; the family's correction is added on top.
  params.adjustments = sanitizeAdjustments(settings.adjustments);
  return params;
}

function isValidCoordinate(lat, lng) {
  if (lat === null || lat === undefined || lat === "" || lng === null || lng === undefined || lng === "") return false;
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}

function getDateInTimeZone(timeZone, baseDate = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(baseDate).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
    return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  } catch {
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  }
}

function buildPrayerEntries(times, timeZone) {
  return [
    { name: PRAYER_NAMES_RU[Prayer.Fajr], time: formatTime(times.fajr, timeZone), key: Prayer.Fajr, date: times.fajr },
    { name: PRAYER_NAMES_RU[Prayer.Sunrise], time: formatTime(times.sunrise, timeZone), key: Prayer.Sunrise, date: times.sunrise },
    { name: PRAYER_NAMES_RU[Prayer.Dhuhr], time: formatTime(times.dhuhr, timeZone), key: Prayer.Dhuhr, date: times.dhuhr },
    { name: PRAYER_NAMES_RU[Prayer.Asr], time: formatTime(times.asr, timeZone), key: Prayer.Asr, date: times.asr },
    { name: PRAYER_NAMES_RU[Prayer.Maghrib], time: formatTime(times.maghrib, timeZone), key: Prayer.Maghrib, date: times.maghrib },
    { name: PRAYER_NAMES_RU[Prayer.Isha], time: formatTime(times.isha, timeZone), key: Prayer.Isha, date: times.isha }
  ];
}

const FARD_PRAYER_KEYS = new Set([Prayer.Fajr, Prayer.Dhuhr, Prayer.Asr, Prayer.Maghrib, Prayer.Isha]);

function makePrayerTimes(coords, date, settings) {
  return new PrayerTimes(coords, date, buildParams(settings, coords));
}

function buildPrayerData(lat, lng, cityName, settings = getPrayerSettings(), options = {}) {
  if (!isValidCoordinate(lat, lng)) return DEFAULT_FALLBACK;

  const timeZone = options.timeZone || options.timezone || readStorage(STORAGE_KEY_TIMEZONE, getBrowserTimeZone());
  const region = options.region || readStorage(STORAGE_KEY_REGION, "Авто");
  const coords = new Coordinates(Number(lat), Number(lng));
  const today = getDateInTimeZone(timeZone);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const times = makePrayerTimes(coords, today, settings);
  const tomorrowTimes = makePrayerTimes(coords, tomorrow, settings);
  const prayerEntries = buildPrayerEntries(times, timeZone);
  if (prayerEntries.some((entry) => !Number.isFinite(entry.date.getTime()))) {
    return { ...DEFAULT_FALLBACK, city: cityName || "Ваш город", error: "Для этой широты выбранный метод не даёт полного расписания. Используйте расписание местной общины." };
  }
  const now = new Date();
  const nextEntry = [...prayerEntries, ...buildPrayerEntries(tomorrowTimes, timeZone)]
    .filter((entry) => FARD_PRAYER_KEYS.has(entry.key))
    .find((entry) => entry.date.getTime() > now.getTime())
    || buildPrayerEntries(tomorrowTimes, timeZone).find((entry) => entry.key === Prayer.Fajr);
  const msTillNext = nextEntry ? nextEntry.date.getTime() - now.getTime() : 0;

  return {
    city: cityName || "Ваш город",
    region,
    country: options.country || "",
    timeZone,
    nextPrayer: nextEntry ? nextEntry.name : PRAYER_NAMES_RU.none,
    nextPrayerTime: nextEntry ? nextEntry.time : "",
    countdown: formatCountdown(msTillNext),
    times: prayerEntries.map(({ name, time }) => ({ name, time })),
    entries: [...prayerEntries, ...buildPrayerEntries(tomorrowTimes, timeZone)],
    nextPrayerDate: nextEntry?.date.toISOString(),
    lat,
    lng,
    settings,
    qibla: calculateQiblaDirection(lat, lng),
    _computed: true
  };
}

const DEFAULT_FALLBACK = {
  city: "Бишкек",
  region: "Кыргызстан",
  nextPrayer: "—",
  nextPrayerTime: "—",
  countdown: "—",
  times: [
    { name: "Фаджр", time: "—" },
    { name: "Восход", time: "—" },
    { name: "Зухр", time: "—" },
    { name: "Аср", time: "—" },
    { name: "Магриб", time: "—" },
    { name: "Иша", time: "—" }
  ]
};

function buildFromCached() {
  const cached = loadCachedCoords();
  if (!cached) return null;
  const city = readStorage(STORAGE_KEY_CITY, "Ваш город");
  return buildPrayerData(cached.lat, cached.lng, city, getPrayerSettings(), {
    timeZone: cached.timeZone || readStorage(STORAGE_KEY_TIMEZONE, getBrowserTimeZone()),
    region: cached.region || readStorage(STORAGE_KEY_REGION, "Авто")
  });
}

export const prayerTimes = buildFromCached() || DEFAULT_FALLBACK;

export function getCurrentPrayerTimes() {
  return buildFromCached() || DEFAULT_FALLBACK;
}

export function getPrayerReminders(data, now = new Date()) {
  return (data.entries || []).filter((entry) => FARD_PRAYER_KEYS.has(entry.key)).map((entry) => ({
    name: entry.name,
    at: new Date(entry.date).getTime() - 5 * 60 * 1000
  })).filter((entry) => entry.at > now.getTime() && entry.at - now.getTime() <= 86400000);
}

export function requestPrayerTimes(onUpdate, onError, { isCurrent = () => true } = {}) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    if (onError) onError();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (!isCurrent()) return;
      const { latitude: lat, longitude: lng } = pos.coords;
      const timeZone = getBrowserTimeZone();
      const city = "Моё местоположение";
      saveCoords(lat, lng, city, timeZone, "GPS");
      const data = buildPrayerData(lat, lng, city, getPrayerSettings(), { timeZone, region: "GPS" });
      onUpdate(data);
    },
    () => { if (isCurrent() && onError) onError(); },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
  );
}

export function buildPrayerDataFromCoords(lat, lng, city, settings = getPrayerSettings(), options = {}) {
  if (!isValidCoordinate(lat, lng)) throw new Error("Некорректные координаты");
  const timeZone = options.timeZone || options.timezone || readStorage(STORAGE_KEY_TIMEZONE, getBrowserTimeZone());
  const region = options.region || options.country || "";
  saveCoords(lat, lng, city, timeZone, region);
  return buildPrayerData(lat, lng, city, settings, { ...options, timeZone, region });
}

export function updateCountdown(data) {
  if (!isValidCoordinate(data?.lat, data?.lng)) return data;
  return buildPrayerData(data.lat, data.lng, data.city, data.settings || getPrayerSettings(), {
    timeZone: data.timeZone,
    region: data.region,
    country: data.country
  });
}

export function calculateQiblaDirection(lat, lng) {
  if (!isValidCoordinate(lat, lng)) return null;
  return Qibla(new Coordinates(Number(lat), Number(lng)));
}

function parseCoordinateQuery(query) {
  const match = String(query || "").trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (!match) return null;
  const lat = Number(match[1].replace(",", "."));
  const lng = Number(match[2].replace(",", "."));
  return isValidCoordinate(lat, lng) ? { lat, lng } : null;
}

function formatGeocodedName(place) {
  const parts = [place.name, place.admin1, place.country].filter(Boolean);
  return Array.from(new Set(parts)).join(", ");
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCountryHintTokens(hint) {
  const normalized = normalizeSearchText(hint);
  const tokens = normalized.split(" ").filter(Boolean);
  if (/\b(usa|us|сша|united states|america|америка)\b/i.test(hint)) {
    tokens.push("us", "usa", "сша", "united states", "соединенные штаты");
  }
  if (/\b(uk|gb|great britain|britain|england|великобритания|англия)\b/i.test(hint)) {
    tokens.push("gb", "uk", "britain", "great britain", "великобритания", "англия");
  }
  return Array.from(new Set(tokens));
}

function placeMatchesHints(place, hint) {
  const tokens = getCountryHintTokens(hint);
  if (tokens.length === 0) return true;
  const haystack = normalizeSearchText([
    place.country,
    place.country_code,
    place.admin1,
    place.admin2,
    place.admin3
  ].filter(Boolean).join(" "));
  return tokens.some((token) => haystack.includes(normalizeSearchText(token)));
}

async function fetchGeocodingResults(name, signal) {
  const params = new URLSearchParams({
    name,
    count: "10",
    language: "ru",
    format: "json"
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, { signal });
  if (!response.ok) throw new Error("geocoding-failed");
  const payload = await response.json();
  return Array.isArray(payload.results) ? payload.results : [];
}

export async function geocodeCity(query) {
  const trimmed = String(query || "").trim();
  if (trimmed.length < 2) throw new Error("empty-city");

  const coords = parseCoordinateQuery(trimmed);
  if (coords) {
    return {
      ...coords,
      name: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      region: "Координаты",
      country: "",
      timeZone: getBrowserTimeZone()
    };
  }

  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), 9000);
  try {
    const queryParts = trimmed.split(",").map((part) => part.trim()).filter(Boolean);
    const primaryName = queryParts[0] || trimmed;
    const hint = queryParts.slice(1).join(" ");
    const variants = Array.from(new Set([
      trimmed,
      primaryName,
      /\bcity\b/i.test(primaryName) ? primaryName : `${primaryName} city`
    ].filter((item) => item.length >= 2)));

    const batches = [];
    for (const variant of variants) {
      try {
        batches.push(...await fetchGeocodingResults(variant, controller.signal));
      } catch {
        // Try the next variant before failing the whole search.
      }
    }

    const seen = new Set();
    const results = batches.filter((item) => {
      const key = item.id || `${item.latitude}:${item.longitude}:${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const place = results
      .filter((item) => isValidCoordinate(item.latitude, item.longitude))
      .filter((item) => placeMatchesHints(item, hint))
      .sort((a, b) => (b.population || 0) - (a.population || 0))[0];
    if (!place) throw new Error("city-not-found");
    return {
      lat: Number(place.latitude),
      lng: Number(place.longitude),
      name: formatGeocodedName(place),
      region: place.admin1 || place.country || "",
      country: place.country || "",
      timeZone: place.timezone || getBrowserTimeZone()
    };
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}
