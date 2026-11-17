import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

registerHooks({ load(url, context, next) {
  if (/\.(png|jpg|webp|svg)$/.test(url)) return { format: "module", source: 'export default ""', shortCircuit: true };
  return next(url, context);
} });
const values = new Map();
globalThis.window = { localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) }, dispatchEvent() {} };
const { buildPrayerDataFromCoords, getCurrentPrayerTimes, updateCountdown, getPrayerReminders, calculateQiblaDirection, setPrayerSettings, getPrayerSettings } = await import("../src/data/prayerTimes.js");
const { setDonePrayersForDate, recordNamazDayCompletion } = await import("../src/utils/storage.js");

test("location is read fresh after changing cities", () => {
  buildPrayerDataFromCoords(40.7128, -74.006, "New York", undefined, { timeZone: "America/New_York" });
  assert.equal(getCurrentPrayerTimes().city, "New York");
  buildPrayerDataFromCoords(43.222, 76.8512, "Almaty", undefined, { timeZone: "Asia/Almaty" });
  assert.equal(getCurrentPrayerTimes().city, "Almaty");
  assert.equal(getCurrentPrayerTimes().timeZone, "Asia/Almaty");
});

test("zero latitude and longitude remain valid for updates and Qibla", () => {
  for (const [lat, lng] of [[0, 30], [10, 0], [0, 0]]) {
    const data = buildPrayerDataFromCoords(lat, lng, "Coordinates", undefined, { timeZone: "UTC" });
    assert.equal(data._computed, true);
    assert.notEqual(updateCountdown(data), data);
    assert.ok(Number.isFinite(calculateQiblaDirection(lat, lng)));
  }
});

test("reminders use absolute prayer instants and exclude sunrise", () => {
  const data = buildPrayerDataFromCoords(40.7128, -74.006, "New York", undefined, { timeZone: "America/New_York" });
  const now = new Date(data.entries[0].date.getTime() - 3600000);
  const reminders = getPrayerReminders(data, now);
  assert.ok(reminders.length >= 5);
  assert.ok(reminders.every((item) => item.name !== "Восход"));
  assert.equal(reminders[0].at, data.entries[0].date.getTime() - 300000);
  assert.ok(reminders.every((item) => item.at > now.getTime()));
});

test("settings are persisted and invalid coordinates never overwrite a city", () => {
  setPrayerSettings({ method: "karachi", madhab: "shafi" });
  assert.equal(getPrayerSettings().method, "karachi");
  assert.equal(getPrayerSettings().madhab, "shafi");
  assert.deepEqual(getPrayerSettings().adjustments, { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  const before = getCurrentPrayerTimes().city;
  assert.throws(() => buildPrayerDataFromCoords(null, 30, "Invalid"));
  assert.throws(() => buildPrayerDataFromCoords(91, 30, "Invalid"));
  assert.equal(getCurrentPrayerTimes().city, before);
});

test("a saved city survives its midnight and the schedule rolls to the next date", () => {
  const RealDate = globalThis.Date;
  let clock = RealDate.parse("2026-09-28T18:55:00Z");
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [clock])); }
    static now() { return clock; }
  };
  try {
    const before = buildPrayerDataFromCoords(43.222, 76.8512, "Almaty", undefined, { timeZone: "Asia/Almaty" });
    clock += 600000;
    const after = getCurrentPrayerTimes();
    assert.equal(after.city, "Almaty");
    assert.ok(after.entries[0].date.getTime() > before.entries[0].date.getTime());
    assert.ok(new RealDate(after.nextPrayerDate).getTime() > clock);
  } finally { globalThis.Date = RealDate; }
});

test("mosque adjustments shift exactly that prayer and are clamped", () => {
  setPrayerSettings({ method: "mwl", madhab: "hanafi", adjustments: {} });
  const base = buildPrayerDataFromCoords(55.7558, 37.6173, "Москва", getPrayerSettings(), { timeZone: "Europe/Moscow" });
  setPrayerSettings({ adjustments: { fajr: 7, isha: -99 } });
  const shifted = buildPrayerDataFromCoords(55.7558, 37.6173, "Москва", getPrayerSettings(), { timeZone: "Europe/Moscow" });
  const at = (data, name) => data.entries.find((entry) => entry.name === name).date.getTime();
  assert.equal(at(shifted, "Фаджр") - at(base, "Фаджр"), 7 * 60000);
  assert.equal(at(shifted, "Зухр"), at(base, "Зухр"));
  assert.equal(getPrayerSettings().adjustments.isha, -30);
  setPrayerSettings({ adjustments: {} });
});

test("every listed calculation method produces a full schedule", async () => {
  const { PRAYER_METHODS } = await import("../src/data/prayerTimes.js");
  for (const { id } of PRAYER_METHODS) {
    const data = buildPrayerDataFromCoords(42.8746, 74.5698, "Бишкек", { method: id, madhab: "hanafi", adjustments: {} }, { timeZone: "Asia/Bishkek" });
    assert.equal(data._computed, true, id);
  }
});

test("compass adds magnetic declination and screen rotation", async () => {
  const { getMagneticDeclination, readTrueHeading } = await import("../src/utils/compass.js");
  const moscow = getMagneticDeclination(55.7558, 37.6173, new Date("2026-10-14"));
  assert.ok(moscow > 10 && moscow < 14, String(moscow));
  assert.equal(readTrueHeading({ webkitCompassHeading: 350 }, 12, 0), 2);
  assert.equal(readTrueHeading({ absolute: true, alpha: 90 }, 0, 90), 0);
  assert.equal(readTrueHeading({ absolute: false, alpha: 90 }, 0, 0), null);
});

test("all five checks count once per local day", () => {
  const date = new Date(2026, 8, 27, 12);
  const prayers = ["Фаджр", "Зухр", "Аср", "Магриб", "Иша"];
  setDonePrayersForDate(prayers, date);
  const first = recordNamazDayCompletion(date);
  setDonePrayersForDate(prayers.slice(0, 4), date);
  recordNamazDayCompletion(date);
  setDonePrayersForDate(prayers, date);
  assert.equal(recordNamazDayCompletion(date).practiceCount, first.practiceCount);
  const tomorrow = new Date(2026, 8, 28, 12);
  setDonePrayersForDate(prayers, tomorrow);
  assert.equal(recordNamazDayCompletion(tomorrow).practiceCount, first.practiceCount + 1);
});
