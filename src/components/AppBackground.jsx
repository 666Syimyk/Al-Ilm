import { useEffect, useState } from "react";
import { getBackgroundThemeById } from "../data/backgroundThemes.js";
import { getBackgroundCustomImage, getBackgroundTheme } from "../utils/storage.js";

export default function AppBackground({ children }) {
  const [theme, setTheme] = useState(getBackgroundTheme);
  const [customImage, setCustomImage] = useState(getBackgroundCustomImage);

  const selectedTheme = getBackgroundThemeById(theme);
  const isCustomTheme = theme === "custom" && customImage;
  const backgroundImage = isCustomTheme ? customImage : selectedTheme.image;
  const backgroundOverlay =
    isCustomTheme
      ? "linear-gradient(180deg, rgba(255,246,225,.08), rgba(255,246,225,.04))"
      : selectedTheme.overlay;
  const backgroundPosition = isCustomTheme ? "center" : selectedTheme.position;
  const themeClass = isCustomTheme ? "app-background--custom" : `app-background--${selectedTheme.id}`;

  useEffect(() => {
    function syncTheme(event) {
      setTheme(event.detail || getBackgroundTheme());
      setCustomImage(getBackgroundCustomImage());
    }

    window.addEventListener("backgroundThemeChange", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("backgroundThemeChange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <div
      className={`app-background app-shell ${themeClass}`}
      style={{
        "--mosque-bg": `url("${backgroundImage}")`,
        "--theme-image": `url("${backgroundImage}")`,
        "--background-overlay": backgroundOverlay,
        "--background-position": backgroundPosition
      }}
    >
      {children}
    </div>
  );
}
