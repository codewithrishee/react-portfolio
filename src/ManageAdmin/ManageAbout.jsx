
import { useEffect, useState } from "react";
import "./Admin.css";

const API = `${import.meta.env.VITE_API_URL}/api/about-sections`;

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
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

  useEffect(() => {
    if (!imageFile) return;

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  async function loadAbout() {
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/about-admin`,
        { headers: headers() }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load the About section. Please log in again."
        );
      }

      const data = await response.json();
      const record = data[0];

      if (record) {
        setRecordId(record.id);
        setForm({ ...initialForm, ...record });
        setImagePreview(record.image || "");
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

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "image") {
          formData.append(key, value ?? "");
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Laravel multipart update: POST + method spoofing
      if (recordId) {
        formData.append("_method", "PUT");
      }

      const response = await fetch(
        recordId ? `${API}/${recordId}` : API,
        {
          method: "POST",
          headers: headers(),
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.message;

        throw new Error(validationMessage || "Unable to save changes.");
      }

      setRecordId(result.id);
      setForm({ ...initialForm, ...result });
      setImageFile(null);
      setImagePreview(result.image || "");
      setMessage("About section updated successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility() {
    if (!recordId) {
      setMessage("Please save the About section first.");
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
        throw new Error(result.message || "Unable to update visibility.");
      }

      setForm((previous) => ({
        ...previous,
        is_active: result.is_active,
      }));

      setMessage(
        result.is_active
          ? "About section is now visible."
          : "About section is now hidden."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return <div className="manage-content">Loading About section...</div>;
  }

  return (
    <div className="manage-content">
      <div className="manage-header">
        <h2>About Management</h2>
        <p>Manage the About section displayed on your portfolio.</p>
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
                required
              />
            )}
          </label>
        ))}

        <label>
          Profile Image

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </label>

        {imagePreview && (
          <div style={{ margin: "12px 0" }}>
            <p>Image Preview:</p>
            <img
              src={imagePreview}
              alt="Profile Preview"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save About Section"}
        </button>
      </form>
    </div>
  );
}
