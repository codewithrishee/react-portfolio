import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000/api/skills";

const initialForm = {
  name: "",
  category: "LANGUAGES",
  description: "",
  icon: "",
  color: "blue",
  sort_order: 1,
  is_active: true,
};

export default function ManageSkills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("admin_token");

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.method
          ? { Authorization: `Bearer ${token}` }
          : {}),
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
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkills();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

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
  }

  function editSkill(skill) {
    setEditingId(skill.id);

    setForm({
      name: skill.name || "",
      category: skill.category || "LANGUAGES",
      description: skill.description || "",
      icon: skill.icon || "",
      color: skill.color || "blue",
      sort_order: skill.sort_order ?? 1,
      is_active: Boolean(skill.is_active),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      await request(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      setMessage(editingId ? "Skill updated successfully!" : "Skill added successfully!");

      resetForm();
      await fetchSkills();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSkill(skill) {
    try {
      setMessage("");

      await request(`${API_URL}/${skill.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: skill.name,
          category: skill.category,
          description: skill.description || "",
          icon: skill.icon || "",
          color: skill.color || "blue",
          sort_order: skill.sort_order ?? 1,
          is_active: !Boolean(skill.is_active),
        }),
      });

      setMessage("Skill visibility updated!");
      await fetchSkills();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteSkill(skill) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"?`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      await request(`${API_URL}/${skill.id}`, {
        method: "DELETE",
      });

      setMessage("Skill deleted successfully!");
      await fetchSkills();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="manage-skills">
      <div className="manage-skills-header">
        <div>
          <h1>Skills Management</h1>
          <p>Manage the skills displayed on your portfolio.</p>
        </div>

        <span>Total Skills: {skills.length}</span>
      </div>

      {message && (
        <div className="skills-message" role="status">
          {message}
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
            Icon
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="e.g. JS or ⚛"
            />
          </label>

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
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>
                      <strong>{skill.icon} {skill.name}</strong>
                      <small>{skill.description}</small>
                    </td>

                    <td>{skill.category}</td>
                    <td>{skill.sort_order}</td>

                    <td>
                      {skill.is_active ? "Active" : "Hidden"}
                    </td>

                    <td>
                      <div className="skills-row-actions">
                        <button
                          type="button"
                          onClick={() => editSkill(skill)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill.is_active ? "Hide" : "Show"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteSkill(skill)}
                        >
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
