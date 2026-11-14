
import { useEffect, useState } from "react";
import "./Preloader.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api/preloader`;

const defaults = {
  name: "VIJAY Kumar",
  designation: "FULL STACK DEVELOPER",
  location: "DELHI, INDIA",
  duration: 1000,
  background_color: "#080D18",
  text_color: "#FFFFFF",
  progress_color: "#22D3EE",
  percentage_color: "#22D3EE",
  show_logo: false,
  logo_size: 60,
  animation_style: "progress",
  animation_speed: 1000,
  logo: null,
};

export default function Preloader({ onComplete }) {
  const [settings, setSettings] = useState(defaults);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) throw new Error("Preloader API unavailable");

        const data = await response.json();

        if (!cancelled && data.is_enabled !== false) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Preloader settings:", error);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (settings.is_enabled === false) {
      onComplete?.();
      return;
    }

    const duration = Math.max(500, Number(settings.duration) || 1000);
    const start = Date.now();
    let completionTimer;

    const timer = setInterval(() => {
      const value = Math.min(
        Math.floor(((Date.now() - start) / duration) * 100),
        100
      );

      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);
        completionTimer = setTimeout(() => onComplete?.(), 150);
      }
    }, 20);

    return () => {
      clearInterval(timer);
      clearTimeout(completionTimer);
    };
  }, [ready, settings, onComplete]);

  const logoUrl = settings.logo
    ? `${import.meta.env.VITE_API_URL}/storage/${settings.logo}`
    : "";

  return (
    <div
      className={`preloader preloader-${settings.animation_style}`}
      style={{
        backgroundColor: settings.background_color,
        color: settings.text_color,
        "--loader-color": settings.progress_color,
        "--loader-speed": `${settings.animation_speed}ms`,
      }}
    >
      <div className="preloader-inner">
        {settings.show_logo && logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="preloader-logo"
            style={{
              width: `${settings.logo_size}px`,
              height: `${settings.logo_size}px`,
            }}
          />
        )}

        <div className="preloader-top">
          <span className="preloader-name">
            {settings.name}
            <span className="preloader-dot">.</span>
          </span>

          <span
            className="preloader-percent"
            style={{ color: settings.percentage_color }}
          >
            {String(progress).padStart(3, "0")}%
          </span>
        </div>

        <div className="preloader-line">
          <div
            className="preloader-line-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="preloader-bottom">
          <span>{settings.designation}</span>
          <span>{settings.location}</span>
        </div>
      </div>
    </div>
  );
}
