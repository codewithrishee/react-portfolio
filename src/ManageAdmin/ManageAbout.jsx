import { useEffect, useState } from "react";
import "./Admin.css";

const API = "http://127.0.0.1:8000/api/about-sections";

const initialForm = {
  name: "Vijay Kumar",
  location: "Delhi, India",
  image: "/images/vijay.jpg",
  education: "BA — IGNOU",
  education_description: "Undergraduate · Open University",
  profile_technologies: "PHP · LARAVEL · REACT",
  section_number: "04",
  heading: "",
  paragraph_1: "",
  paragraph_2: "",
  paragraph_3: "",
  looking_for: "Junior Web Developer / PHP Developer",
  availability: "Open to opportunities",
  technologies: "PHP, Laravel, React, MySQL",
  is_active: true,
};

const fields = [
  ["name", "Name"],
  ["location", "Location"],
  ["image", "Profile Image Path"],
  ["education", "Education"],
  ["education_description", "Education Description"],
  ["profile_technologies", "Profile Technologies"],
  ["section_number", "Section Number"],
  ["heading", "Main Heading"],
  ["paragraph_1", "Paragraph 1"],
  ["paragraph_2", "Paragraph 2"],
  ["paragraph_3", "Paragraph 3"],
  ["looking_for", "Looking For"],
  ["availability", "Availability"],
  ["technologies", "Technologies"],
];

export default function ManageAbout() {
  const [form, setForm] = useState(initialForm);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const headers = () => ({
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
  });

  useEffect(() => {
    loadAbout();
  }, []);

  async function loadAbout() {
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/about-admin",
        { headers: headers() }
      );

      if (!response.ok) {
        throw new Error("About load nahi hua. Admin token check karo.");
      }

      const data = await response.json();
      const record = data[0];

      if (record) {
        setRecordId(record.id);
        setForm({ ...initialForm, ...record });
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        recordId ? `${API}/${recordId}` : API,
        {
          method: recordId ? "PUT" : "POST",
          headers: {
            ...headers(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.message;

        throw new Error(validationMessage || "Save failed.");
      }

      setRecordId(result.id);
      setForm({ ...initialForm, ...result });
      setMessage("About section successfully updated!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility() {
    if (!recordId) {
      setMessage("Pehle About section save karo.");
      return;
    }

    try {
      const response = await fetch(`${API}/${recordId}`, {
        method: "PATCH",
        headers: {
          ...headers(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !form.is_active }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Visibility update failed.");
      }

      setForm((previous) => ({
        ...previous,
        is_active: result.is_active,
      }));

      setMessage(
        result.is_active
          ? "About section visible hai."
          : "About section hidden hai."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) return <div className="manage-content">Loading About...</div>;

  return (
    <div className="manage-content">
      <div className="manage-header">
        <h2>About Management</h2>
        <p>Portfolio ke About section ko manage karo.</p>
      </div>

      {message && <p role="alert">{message}</p>}

      <button
        type="button"
        onClick={toggleVisibility}
        disabled={!recordId}
      >
        {form.is_active ? "Hide About Section" : "Show About Section"}
      </button>

      <form className="manage-form" onSubmit={handleSubmit}>
        {fields.map(([name, label]) => (
          <label key={name}>
            {label}

            {name.startsWith("paragraph_") ? (
              <textarea
                name={name}
                value={form[name] ?? ""}
                onChange={handleChange}
                rows={name === "paragraph_3" ? 3 : 4}
                required={name !== "paragraph_3"}
              />
            ) : (
              <input
                name={name}
                value={form[name] ?? ""}
                onChange={handleChange}
                required={!["image"].includes(name)}
              />
            )}
          </label>
        ))}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save About Section"}
        </button>
      </form>
    </div>
  );
}