
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/journeys`;

const EMPTY_FORM = {
  year: "",
  title: "",
  subtitle: "",
  description: "",
  is_active: true,
  sort_order: 0,
};

export default function ManageJourney() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("admin_token");

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const validationErrors = Object.values(data.errors || {}).flat();

      throw new Error(
        validationErrors.join(" ") ||
          data.message ||
          `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function loadItems() {
    try {
      setError("");

      const data = await apiRequest(API_URL);
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err.message || "Unable to load journey entries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

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
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage("");
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      year: item.year ?? "",
      title: item.title ?? "",
      subtitle: item.subtitle ?? "",
      description: item.description ?? "",
      is_active: Boolean(item.is_active),
      sort_order: Number(item.sort_order ?? 0),
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      await apiRequest(url, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form),
      });

      setMessage(
        editingId
          ? "Journey updated successfully!"
          : "Journey added successfully!"
      );

      setForm(EMPTY_FORM);
      setEditingId(null);

      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to save journey.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    setMessage("");
    setError("");

    try {
      await apiRequest(`${API_URL}/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          is_active: !Boolean(item.is_active),
        }),
      });

      setMessage("Journey visibility updated!");
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to update visibility.");
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await apiRequest(`${API_URL}/${item.id}`, {
        method: "DELETE",
      });

      setMessage("Journey deleted successfully!");
      await loadItems();
    } catch (err) {
      setError(err.message || "Unable to delete journey.");
    }
  }

  return (
    <div className="manage-journey">
      <div className="manage-journey-header">
        <div>
          <h1>Journey Management</h1>
          <p>Manage your portfolio journey timeline.</p>
        </div>

        <span>Total: {items.length}</span>
      </div>

      {message && (
        <div className="journey-admin-message success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="journey-admin-message error" role="alert">
          {error}
        </div>
      )}

      <form className="journey-admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit Journey" : "Add New Journey"}</h2>

        <div className="journey-admin-form-grid">
          <label>
            Year *
            <input
              type="text"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="2026"
              maxLength={20}
              required
            />
          </label>

          <label>
            Title *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Laravel & React Development"
              required
            />
          </label>

          <label>
            Subtitle
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="INDEPENDENT PROJECTS"
            />
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

          <label className="journey-admin-description">
            Description *
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your learning or work experience..."
              required
            />
          </label>
        </div>

        <label className="journey-admin-checkbox">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Show this entry on my portfolio
        </label>

        <div className="journey-admin-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Journey"
                : "Add Journey"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="journey-admin-list">
        <h2>Journey Entries</h2>

        {loading ? (
          <p>Loading journey entries...</p>
        ) : items.length === 0 ? (
          <p>No active journey entries found.</p>
        ) : (
          <div className="journey-admin-table-wrapper">
            <table className="journey-admin-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Journey</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.year}</td>

                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </td>

                    <td>{item.sort_order ?? 0}</td>

                    <td>
                      <span className={
                        item.is_active
                          ? "journey-status active"
                          : "journey-status hidden"
                      }>
                        {item.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>

                    <td>
                      <div className="journey-admin-row-actions">
                        <button type="button" onClick={() => handleEdit(item)}>
                          Edit
                        </button>

                        <button type="button" onClick={() => handleToggle(item)}>
                          {item.is_active ? "Hide" : "Show"}
                        </button>

                        <button type="button" onClick={() => handleDelete(item)}>
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
