
import { useEffect, useState } from "react";
import "./PreloaderAdmin.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const defaults = {
  name: "VIJAY Kumar",
  designation: "FULL STACK DEVELOPER",
  location: "DELHI, INDIA",
  is_enabled: true,
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

export default function ManagePreloader() {
  const [form, setForm] = useState(defaults);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewProgress, setPreviewProgress] = useState(67);

  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(`${API_URL}/preloader-admin`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load preloader settings.");
        }

        const data = await response.json();

        if (active && data) {
          setForm((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token) loadSettings();
    else {
      setMessage("Admin session not found. Please login.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key !== "logo" && value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    if (logoFile) data.append("logo", logoFile);

    try {
      const response = await fetch(`${API_URL}/preloader-settings`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        const errors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.message;

        throw new Error(errors || "Unable to save settings.");
      }

      setForm((prev) => ({
        ...prev,
        ...result.settings,
      }));

      setLogoFile(null);
      setMessage("Preloader settings saved successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const logoUrl = logoFile
    ? URL.createObjectURL(logoFile)
    : form.logo
      ? `${import.meta.env.VITE_API_URL}/storage/${form.logo}`
      : "";

  if (loading) {
    return <div className="manage-content">Loading settings...</div>;
  }

  return (
    <div className="manage-preloader">
      <header className="mp-header">
        <div>
          <h1>Manage Preloader</h1>
          <p>Customize your portfolio loading screen.</p>
        </div>
        <span className="mp-status">
          {form.is_enabled ? "Enabled" : "Disabled"}
        </span>
      </header>

      {message && <div className="mp-message">{message}</div>}

      <form onSubmit={handleSave}>
        <section className="mp-section">
          <h2>General Settings</h2>

          <label className="mp-toggle">
            <input
              type="checkbox"
              name="is_enabled"
              checked={Boolean(form.is_enabled)}
              onChange={handleChange}
            />
            Enable Preloader
          </label>

          <div className="mp-grid">
            <label>
              Loading Duration (ms)
              <input
                type="number"
                name="duration"
                min="500"
                max="10000"
                value={form.duration}
                onChange={handleChange}
              />
            </label>

            <label>
              Animation Speed (ms)
              <input
                type="number"
                name="animation_speed"
                min="100"
                max="10000"
                value={form.animation_speed}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>

        <section className="mp-section">
          <h2>Content Settings</h2>

          <div className="mp-grid">
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} />
            </label>

            <label>
              Designation
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
              />
            </label>

            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </label>
          </div>
        </section>

        <section className="mp-section">
          <h2>Logo Settings</h2>

          <label className="mp-toggle">
            <input
              type="checkbox"
              name="show_logo"
              checked={Boolean(form.show_logo)}
              onChange={handleChange}
            />
            Show Logo
          </label>

          <div className="mp-grid">
            <label>
              Upload Logo (PNG, JPG, WEBP)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </label>

            <label>
              Logo Size (px)
              <input
                type="number"
                name="logo_size"
                min="20"
                max="200"
                value={form.logo_size}
                onChange={handleChange}
              />
            </label>
          </div>

          {logoUrl && (
            <img className="mp-logo-preview" src={logoUrl} alt="Logo preview" />
          )}
        </section>

        <section className="mp-section">
          <h2>Color Customization</h2>

          <div className="mp-color-grid">
            {[
              ["background_color", "Background"],
              ["text_color", "Text"],
              ["progress_color", "Progress Bar"],
              ["percentage_color", "Percentage"],
            ].map(([name, label]) => (
              <label className="mp-color" key={name}>
                <span>{label}</span>
                <input
                  type="color"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                />
                <small>{form[name]}</small>
              </label>
            ))}
          </div>
        </section>

        <section className="mp-section">
          <h2>Animation Settings</h2>

          <div className="mp-grid">
            <label>
              Animation Style
              <select
                name="animation_style"
                value={form.animation_style}
                onChange={handleChange}
              >
                <option value="progress">Progress Bar</option>
                <option value="fade">Fade</option>
                <option value="spinner">Spinner</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mp-section">
          <div className="mp-preview-heading">
            <h2>Live Preview</h2>
            <button
              type="button"
              onClick={() =>
                setPreviewProgress((prev) => (prev === 67 ? 35 : 67))
              }
            >
              Change Preview
            </button>
          </div>

          <div
            className="mp-preview"
            style={{
              background: form.background_color,
              color: form.text_color,
            }}
          >
            {form.show_logo && logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                style={{
                  width: `${form.logo_size}px`,
                  height: `${form.logo_size}px`,
                  objectFit: "contain",
                }}
              />
            )}

            <div className="mp-preview-top">
              <strong>{form.name}<span>.</span></strong>
              <b style={{ color: form.percentage_color }}>
                {String(previewProgress).padStart(3, "0")}%
              </b>
            </div>

            <div className="mp-preview-track">
              <div
                style={{
                  width: `${previewProgress}%`,
                  background: form.progress_color,
                }}
              />
            </div>

            <div className="mp-preview-bottom">
              <span>{form.designation}</span>
              <span>{form.location}</span>
            </div>
          </div>
        </section>

        <button className="mp-save" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Preloader Settings"}
        </button>
      </form>
    </div>
  );
}
