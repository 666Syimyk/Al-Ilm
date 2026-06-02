import { Coordinates, CalculationMethod, HighLatitudeRule, Madhab, PrayerTimes, Prayer, Qibla } from "adhan";

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
  { id: "mwl", label: "Muslim World League" },
  { id: "egyptian", label: "Egyptian" },
  { id: "karachi", label: "Karachi" },
  { id: "umm_al_qura", label: "Umm al-Qura" },
  { id: "north_america", label: "North America" }
];

export const ASR_MADHABS = [
  { id: "shafi", label: "Шафии, Малики, Ханбали" },
  { id: "hanafi", label: "Ханафи" }
];

const DEFAULT_SETTINGS = {
  method: "mwl",
  madhab: "hanafi"
};

const METHOD_BUILDERS = {
  mwl: () => CalculationMethod.MuslimWorldLeague(),
  egyptian: () => CalculationMethod.Egyptian(),
  karachi: () => CalculationMethod.Karachi(),
  umm_al_qura: () => CalculationMethod.UmmAlQura(),
  north_america: () => CalculationMethod.NorthAmerica()
};

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
  try {
    const date = localStorage.getItem(STORAGE_KEY_DATE);
    if (date !== getTodayDateString()) return null;
    const raw = localStorage.getItem(STORAGE_KEY_COORDS);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!isValidCoordinate(parsed?.lat, parsed?.lng)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readStorage(key, fallback = null) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

function saveCoords(lat, lng, city, timeZone = getBrowserTimeZone(), region = "") {
  writeStorage(STORAGE_KEY_COORDS, JSON.stringify({ lat, lng, timeZone, region }));
  writeStorage(STORAGE_KEY_DATE, getTodayDateString());
  if (city) writeStorage(STORAGE_KEY_CITY, city);
  if (timeZone) writeStorage(STORAGE_KEY_TIMEZONE, timeZone);
  if (region) writeStorage(STORAGE_KEY_REGION, region);
}

export function getPrayerSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}), madhab: "hanafi" };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setPrayerSettings(settings) {
  const next = { ...getPrayerSettings(), ...settings, madhab: "hanafi" };
  writeStorage(STORAGE_KEY_SETTINGS, JSON.stringify(next));
  return next;
}

function buildParams(settings = getPrayerSettings(), coords = null) {
  const build = METHOD_BUILDERS[settings.method] || METHOD_BUILDERS.mwl;
  const params = build();
  params.madhab = settings.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  if (coords) params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  return params;
}

function isValidCoordinate(lat, lng) {
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
  const coords = new Coordinates(lat, lng);
  const today = getDateInTimeZone(timeZone);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const times = makePrayerTimes(coords, today, settings);
  const tomorrowTimes = makePrayerTimes(coords, tomorrow, settings);
  const prayerEntries = buildPrayerEntries(times, timeZone);
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

export function requestPrayerTimes(onUpdate, onError) {
  if (!navigator.geolocation) {
    if (onError) onError();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const timeZone = getBrowserTimeZone();
      const city = readStorage(STORAGE_KEY_CITY, "Моё местоположение");
      saveCoords(lat, lng, city, timeZone, "GPS");
      const data = buildPrayerData(lat, lng, city, getPrayerSettings(), { timeZone, region: "GPS" });
      onUpdate(data);
    },
    () => { if (onError) onError(); },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
  );
}

export function buildPrayerDataFromCoords(lat, lng, city, settings = getPrayerSettings(), options = {}) {
  const timeZone = options.timeZone || options.timezone || readStorage(STORAGE_KEY_TIMEZONE, getBrowserTimeZone());
  const region = options.region || options.country || "";
  saveCoords(lat, lng, city, timeZone, region);
  return buildPrayerData(lat, lng, city, settings, { ...options, timeZone, region });
}

export function updateCountdown(data) {
  if (!data.lat || !data.lng) return data;
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
