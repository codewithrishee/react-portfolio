
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/skills`;
const STORAGE_URL = `${import.meta.env.VITE_API_URL}/storage/`;

const initialForm = {
  name: "",
  category: "LANGUAGES",
  description: "",
  icon_type: "bootstrap",
  icon: "",
  image: null,
  color: "blue",
  sort_order: 1,
  is_active: true,
};

function getImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;

  return `${STORAGE_URL}${image.replace(/^\/+/, "")}`;
}

export default function ManageSkills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const token = localStorage.getItem("admin_token");

  async function request(url, options = {}) {
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          Object.values(data.errors || {}).flat().join(", ") ||
          "Request failed."
      );
    }

    return data;
  }

  async function fetchSkills() {
    try {
      setLoading(true);
      const data = await request(API_URL);
      setSkills(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkills();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked, files } = event.target;

    if (name === "image") {
      const selectedFile = files?.[0] || null;

      setForm((previous) => ({
        ...previous,
        image: selectedFile,
      }));

      setImagePreview(
        selectedFile ? URL.createObjectURL(selectedFile) : ""
      );

      return;
    }

    if (name === "icon_type") {
      setForm((previous) => ({
        ...previous,
        icon_type: value,
        image: null,
      }));

      if (value === "bootstrap") {
        setImagePreview("");
      } else if (editingId) {
        const currentSkill = skills.find(
          (skill) => skill.id === editingId
        );

        setImagePreview(getImageUrl(currentSkill?.image));
      }

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "sort_order"
            ? Number(value)
            : value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setImagePreview("");
  }

  function editSkill(skill) {
    setEditingId(skill.id);

    setForm({
      name: skill.name || "",
      category: skill.category || "LANGUAGES",
      description: skill.description || "",
      icon_type: skill.icon_type || "bootstrap",
      icon: skill.icon || "",
      image: null,
      color: skill.color || "blue",
      sort_order: skill.sort_order ?? 1,
      is_active: Boolean(skill.is_active),
    });

    setImagePreview(getImageUrl(skill.image));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (
        form.icon_type === "image" &&
        !form.image &&
        !imagePreview
      ) {
        throw new Error("Please select an image logo.");
      }

      if (
        form.icon_type === "bootstrap" &&
        !form.icon.trim()
      ) {
        throw new Error("Please enter a Bootstrap Icon class.");
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("icon_type", form.icon_type);
      formData.append("icon", form.icon);
      formData.append("color", form.color);
      formData.append("sort_order", String(form.sort_order));
      formData.append("is_active", form.is_active ? "1" : "0");

      if (form.image) {
        formData.append("image", form.image);
      }

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      if (editingId) {
        formData.append("_method", "PUT");
      }

      await request(url, {
        method: "POST",
        body: formData,
      });

      setMessage(
        editingId
          ? "Skill updated successfully!"
          : "Skill added successfully!"
      );

      resetForm();
      await fetchSkills();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSkill(skill) {
    try {
      setMessage("");
      setError("");

      await request(`${API_URL}/${skill.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: skill.name,
          category: skill.category,
          description: skill.description || "",
          icon: skill.icon || "",
          icon_type: skill.icon_type || "bootstrap",
          color: skill.color || "blue",
          sort_order: skill.sort_order ?? 1,
          is_active: !Boolean(skill.is_active),
        }),
      });

      setMessage("Skill visibility updated!");
      await fetchSkills();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSkill(skill) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"?`
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      await request(`${API_URL}/${skill.id}`, {
        method: "DELETE",
      });

      setMessage("Skill deleted successfully!");
      await fetchSkills();

      if (editingId === skill.id) {
        resetForm();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="manage-skills">
      <div className="manage-skills-header">
        <div>
          <h1>Skills Management</h1>
          <p>Manage the technologies displayed on your portfolio.</p>
        </div>

        <span>Total Skills: {skills.length}</span>
      </div>

      {message && (
        <div className="skills-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="skills-message" role="alert">
          {error}
        </div>
      )}

      <form className="skills-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Skill" : "Add New Skill"}</h2>

        <div className="skills-form-grid">
          <label>
            Skill Name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="e.g. React"
            />
          </label>

          <label>
            Category *
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="LANGUAGES">LANGUAGES</option>
              <option value="FRONTEND">FRONTEND</option>
              <option value="BACKEND">BACKEND</option>
              <option value="DATABASE">DATABASE</option>
              <option value="DEVOPS">DEVOPS</option>
            </select>
          </label>

          <label>
            Description
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short skill description"
            />
          </label>

          <label>
            Icon Type *
            <select
              name="icon_type"
              value={form.icon_type}
              onChange={handleChange}
            >
              <option value="bootstrap">Bootstrap Icon</option>
              <option value="image">Image Logo</option>
            </select>
          </label>

          {form.icon_type === "bootstrap" && (
            <label>
              Bootstrap Icon Class *
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="bi bi-filetype-php"
                required
              />
            </label>
          )}

          <label>
            Color
            <select
              name="color"
              value={form.color}
              onChange={handleChange}
            >
              {["blue", "orange", "yellow", "cyan", "purple", "red", "green"].map(
                (color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Sort Order
            <input
              type="number"
              name="sort_order"
              value={form.sort_order}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        {form.icon_type === "image" && (
          <div className="skills-image-upload">
            <label>
              Upload Technology Logo *
              <input
                type="file"
                name="image"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleChange}
              />
            </label>

            {imagePreview && (
              <div className="skills-image-preview">
                <img
                  src={imagePreview}
                  alt="Technology logo preview"
                />
                <span>Logo Preview</span>
              </div>
            )}

            <small>PNG, JPG or WEBP · Maximum 2 MB</small>
          </div>
        )}

        <label className="skills-active-checkbox">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Show this skill on portfolio
        </label>

        <div className="skills-form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Skill"
                : "Add Skill"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      
<div className="skills-list">
  <h2>All Skills</h2>

  {loading ? (
    <p>Loading skills...</p>
  ) : skills.length === 0 ? (
    <p>No skills found.</p>
  ) : (
    <div className="skills-table-wrapper">
      <table className="skills-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Category</th>
            <th>Logo</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              <td>
                <div className="skill-name-cell">
                  <strong>{skill.name}</strong>
                  <small>{skill.description}</small>
                </div>
              </td>

              <td>{skill.category}</td>

              <td>
                <div className="skill-logo-preview">
                  {skill.icon_type === "image" && skill.image ? (
                    <img
                      src={getImageUrl(skill.image)}
                      alt={`${skill.name} logo`}
                    />
                  ) : (
                    <i
                      className={skill.icon}
                      aria-label={`${skill.name} icon`}
                      title={skill.icon}
                    />
                  )}
                </div>
              </td>

              <td>{skill.sort_order}</td>

              <td>
                <span className={
                  skill.is_active
                    ? "skill-status active"
                    : "skill-status hidden"
                }>
                  {skill.is_active ? "Active" : "Hidden"}
                </span>
              </td>

              <td>
                <div className="skills-row-actions">
                  <button type="button" onClick={() => editSkill(skill)}>
                    Edit
                  </button>

                  <button type="button" onClick={() => toggleSkill(skill)}>
                    {skill.is_active ? "Hide" : "Show"}
                  </button>

                  <button type="button" onClick={() => deleteSkill(skill)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

    </div>
  );
}
