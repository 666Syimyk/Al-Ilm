import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./styles/responsive.css";
import "./styles/theme-polish.css";
import "./styles/reference-redesign.css";
import "./styles/mobile-app.css";

try {
  if (window.localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
} catch {
  // Ignore blocked storage and keep the default theme.
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
