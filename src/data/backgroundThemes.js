import mosqueClassic from "../assets/backgrounds/mosque-bg.png";
import bgBlueArches from "../assets/backgrounds/bg-blue-arches.png";
import bgCreamPattern from "../assets/backgrounds/bg-cream-pattern.png";
import bgDayTerrace from "../assets/backgrounds/bg-day-terrace.png";
import bgDesertSunset from "../assets/backgrounds/bg-desert-sunset.png";
import bgEmeraldArches from "../assets/backgrounds/bg-emerald-arches.png";
import bgMarbleHall from "../assets/backgrounds/bg-marble-hall.png";
import bgMoonGarden from "../assets/backgrounds/bg-moon-garden.png";
import bgNightLagoon from "../assets/backgrounds/bg-night-lagoon.png";
import bgPastelValley from "../assets/backgrounds/bg-pastel-valley.png";
import bgSunriseCourtyard from "../assets/backgrounds/bg-sunrise-courtyard.png";

const themeImages = {
  classic: bgSunriseCourtyard,
  pearl: bgMarbleHall,
  dawn: bgDayTerrace,
  sky: bgDayTerrace,
  gold: bgDesertSunset,
  rose: bgPastelValley,
  aqua: bgNightLagoon,
  sand: bgSunriseCourtyard,
  mint: bgPastelValley,
  marble: bgMarbleHall,
  sunbeam: bgDayTerrace,
  calm: bgCreamPattern,
  emerald: bgEmeraldArches,
  forest: bgMoonGarden,
  night: bgNightLagoon,
  moon: bgBlueArches,
  "deep-blue": bgNightLagoon,
  starry: bgBlueArches,
  lantern: bgMoonGarden,
  sunset: bgDesertSunset,
  indigo: bgNightLagoon,
  midnight: bgBlueArches
};

const baseBackgroundThemes = [
  { id: "classic", category: "light", name: "Классика", description: "Мягкий свет", overlay: "linear-gradient(180deg, rgba(245,234,212,.10), rgba(219,182,144,.20))", position: "center" },
  { id: "pearl", category: "light", name: "Жемчуг", description: "Светлый фон", overlay: "linear-gradient(180deg, rgba(245,234,212,.34), rgba(255,250,245,.16))", position: "center top" },
  { id: "dawn", category: "light", name: "Рассвет", description: "Тёплое утро", overlay: "linear-gradient(145deg, rgba(255,234,202,.28), rgba(0,111,61,.16))", position: "center top" },
  { id: "sky", category: "light", name: "Небо", description: "Свежий воздух", overlay: "linear-gradient(160deg, rgba(210,236,247,.34), rgba(0,111,61,.12))", position: "center top" },
  { id: "gold", category: "light", name: "Золото", description: "Солнечный тон", overlay: "linear-gradient(145deg, rgba(219,182,144,.38), rgba(245,234,212,.08))", position: "center 42%" },
  { id: "rose", category: "light", name: "Розовый", description: "Нежный вечер", overlay: "linear-gradient(150deg, rgba(255,218,218,.30), rgba(219,182,144,.16))", position: "center" },
  { id: "aqua", category: "light", name: "Бирюза", description: "Чистый воздух", overlay: "linear-gradient(155deg, rgba(96,218,220,.28), rgba(245,234,212,.10))", position: "center top" },
  { id: "sand", category: "light", name: "Песок", description: "Мягкое тепло", overlay: "linear-gradient(145deg, rgba(222,198,162,.32), rgba(245,234,212,.12))", position: "center 35%" },
  { id: "mint", category: "light", name: "Мята", description: "Лёгкий зелёный", overlay: "linear-gradient(145deg, rgba(188,237,213,.30), rgba(245,234,212,.14))", position: "center top" },
  { id: "marble", category: "light", name: "Мрамор", description: "Белая мечеть", overlay: "linear-gradient(180deg, rgba(245,234,212,.42), rgba(214,225,223,.12))", position: "center 25%" },
  { id: "sunbeam", category: "light", name: "Солнце", description: "Яркий день", overlay: "linear-gradient(150deg, rgba(255,231,164,.34), rgba(245,234,212,.08))", position: "center 60%" },
  { id: "calm", category: "light", name: "Спокойствие", description: "Тихий зал", overlay: "linear-gradient(180deg, rgba(245,245,239,.34), rgba(0,111,61,.10))", position: "center bottom" },
  { id: "emerald", category: "dark", name: "Изумруд", description: "Зелёный свет", overlay: "linear-gradient(150deg, rgba(16,60,47,.18), rgba(219,182,144,.18))", position: "center" },
  { id: "forest", category: "dark", name: "Сад", description: "Глубокий зелёный", overlay: "linear-gradient(145deg, rgba(31,95,71,.34), rgba(245,234,212,.08))", position: "center bottom" },
  { id: "night", category: "dark", name: "Ночь", description: "Спокойствие", overlay: "linear-gradient(145deg, rgba(16,60,47,.42), rgba(11,25,36,.26))", position: "center bottom" },
  { id: "moon", category: "dark", name: "Луна", description: "Ночное небо", overlay: "linear-gradient(155deg, rgba(13,34,52,.44), rgba(245,234,212,.06))", position: "center top" },
  { id: "deep-blue", category: "dark", name: "Синий", description: "Глубокая ночь", overlay: "linear-gradient(145deg, rgba(11,31,57,.48), rgba(0,111,61,.10))", position: "center" },
  { id: "starry", category: "dark", name: "Звёзды", description: "Тихий вечер", overlay: "linear-gradient(145deg, rgba(21,33,56,.42), rgba(219,182,144,.10))", position: "center top" },
  { id: "lantern", category: "dark", name: "Фонари", description: "Тёплая ночь", overlay: "linear-gradient(145deg, rgba(20,24,30,.48), rgba(219,182,144,.22))", position: "center 65%" },
  { id: "sunset", category: "dark", name: "Закат", description: "Тёплый вечер", overlay: "linear-gradient(145deg, rgba(219,142,98,.32), rgba(31,95,71,.16))", position: "center 55%" },
  { id: "indigo", category: "dark", name: "Индиго", description: "Глубокий тон", overlay: "linear-gradient(145deg, rgba(37,32,82,.44), rgba(16,60,47,.18))", position: "center bottom" },
  { id: "midnight", category: "dark", name: "Полночь", description: "Самый тёмный", overlay: "linear-gradient(145deg, rgba(5,10,15,.52), rgba(31,95,71,.14))", position: "center bottom" }
];

export const backgroundThemes = baseBackgroundThemes.map((theme) => ({
  ...theme,
  image: themeImages[theme.id] || mosqueClassic
}));

export const backgroundThemeGroups = [
  { id: "light", title: "Светлая тема" },
  { id: "dark", title: "Тёмная тема" }
];

export function getBackgroundThemeById(themeId) {
  return backgroundThemes.find((theme) => theme.id === themeId) || backgroundThemes[0];
}

export function isBackgroundTheme(themeId) {
  return themeId === "custom" || backgroundThemes.some((theme) => theme.id === themeId);
}
