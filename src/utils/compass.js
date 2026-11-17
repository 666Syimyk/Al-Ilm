import geomagnetism from "geomagnetism";

// Phone compasses report magnetic north, while the Qibla bearing is measured from true north.
// The difference (declination) is 5–15° across Russia and Central Asia, so it must be added.
export function getMagneticDeclination(lat, lng, date = new Date()) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return 0;
  try {
    const declination = geomagnetism.model(date).point([latitude, longitude]).decl;
    return Number.isFinite(declination) ? declination : 0;
  } catch {
    return 0;
  }
}

export function getScreenAngle() {
  if (typeof window === "undefined") return 0;
  const angle = window.screen?.orientation?.angle ?? window.orientation ?? 0;
  return Number.isFinite(Number(angle)) ? Number(angle) : 0;
}

export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

// Converts a device-orientation event to the true-north heading of the top of the screen.
// Returns null when the event carries no absolute direction.
export function readTrueHeading(event, declination, screenAngle = getScreenAngle()) {
  let magnetic = null;
  if (Number.isFinite(event?.webkitCompassHeading)) magnetic = event.webkitCompassHeading;
  else if (event?.absolute && Number.isFinite(event.alpha)) magnetic = 360 - event.alpha;
  if (magnetic === null) return null;
  return normalizeDegrees(magnetic + screenAngle + declination);
}
