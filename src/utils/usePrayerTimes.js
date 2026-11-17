import { useEffect, useState } from "react";
import { getCurrentPrayerTimes } from "../data/prayerTimes.js";

// Recompute from saved coordinates, not a module-load snapshot.
export default function usePrayerTimes() {
  const [times, setTimes] = useState(getCurrentPrayerTimes);
  useEffect(() => {
    const refresh = () => setTimes(getCurrentPrayerTimes());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("prayerTimesChange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("prayerTimesChange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return times;
}
