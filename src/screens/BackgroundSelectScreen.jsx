import { ArrowLeft, Check, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard.jsx";
import { backgroundThemeGroups, backgroundThemes } from "../data/backgroundThemes.js";
import {
  getBackgroundCustomImage,
  getBackgroundTheme,
  setBackgroundCustomImage,
  setBackgroundTheme
} from "../utils/storage.js";

export default function BackgroundSelectScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedBackground, setSelectedBackground] = useState(getBackgroundTheme);
  const [customImage, setCustomImage] = useState(getBackgroundCustomImage);

  function chooseBackground(themeId) {
    setSelectedBackground(themeId);
    setBackgroundTheme(themeId);
  }

  function openGallery() {
    fileInputRef.current?.click();
  }

  function uploadFromGallery(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result);
      setCustomImage(imageData);
      setSelectedBackground("custom");
      setBackgroundCustomImage(imageData);
    };
    reader.readAsDataURL(file);
  }

  function renderUploadTile(key) {
    return (
      <button className="background-tile background-tile--upload" key={key} type="button" onClick={openGallery}>
        <span className="background-tile__upload-icon">
          <ImagePlus size={28} aria-hidden="true" />
        </span>
        <span>Добавить из галереи</span>
      </button>
    );
  }

  return (
    <section className="background-picker-screen">
      <GlassCard className="background-picker-top">
        <button className="background-picker-back" type="button" onClick={() => navigate("/profile")} aria-label="Назад">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1>Фон приложения</h1>
      </GlassCard>

      {customImage ? (
        <GlassCard className="background-picker-section">
          <h2>Мой фон</h2>
          <div className="background-grid background-grid--custom">
            <button
              className={`background-tile background-tile--custom ${selectedBackground === "custom" ? "is-selected" : ""}`}
              type="button"
              onClick={() => chooseBackground("custom")}
              aria-pressed={selectedBackground === "custom"}
            >
              <span
                className="background-tile__preview"
                style={{
                  "--theme-image": `url("${customImage}")`,
                  "--theme-overlay": "linear-gradient(145deg, rgba(16,60,47,.18), rgba(245,234,212,.08))",
                  "--theme-position": "center"
                }}
              />
              <span>Из галереи</span>
              {selectedBackground === "custom" ? (
                <span className="background-tile__check">
                  <Check size={18} aria-hidden="true" />
                </span>
              ) : null}
            </button>
            {renderUploadTile("custom-upload")}
          </div>
        </GlassCard>
      ) : null}

      {backgroundThemeGroups.map((group) => (
        <GlassCard className="background-picker-section" key={group.id}>
          <h2>{group.title}</h2>
          <div className="background-grid">
            {backgroundThemes
              .filter((theme) => theme.category === group.id)
              .map((theme) => (
                <button
                  className={`background-tile ${selectedBackground === theme.id ? "is-selected" : ""}`}
                  key={theme.id}
                  type="button"
                  onClick={() => chooseBackground(theme.id)}
                  aria-pressed={selectedBackground === theme.id}
                >
                  <span
                    className="background-tile__preview"
                    style={{
                      "--theme-image": `url("${theme.image}")`,
                      "--theme-overlay": theme.overlay,
                      "--theme-position": theme.position
                    }}
                  />
                  <span>{theme.name}</span>
                  {selectedBackground === theme.id ? (
                    <span className="background-tile__check">
                      <Check size={18} aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              ))}
            {renderUploadTile(`${group.id}-upload`)}
          </div>
        </GlassCard>
      ))}

      <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={uploadFromGallery} />
    </section>
  );
}
