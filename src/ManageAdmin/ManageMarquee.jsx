import { useEffect, useState } from "react";
import "./Admin.css";
const API_URL = `${import.meta.env.VITE_API_URL}/api/marquee-items`;

export default function ManageMarquee() {
  const [items, setItems] = useState([]);
  const [technology, setTechnology] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("admin_token");

  const loadItems = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}-admin`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Authentication failed. Please log in again."
            : "Unable to load technologies.",
        );
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!technology.trim()) {
      setError("Please enter a technology name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            technology: technology.trim(),
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to save technology. Please check your input and try again.",
        );
      }

      setTechnology("");
      setEditingId(null);
      await loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setTechnology(item.technology);
    setEditingId(item.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this technology?")) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Unable to delete technology.");
      }

      await loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleToggle = async (item) => {
    setError("");

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          is_active: !item.is_active,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Unable to update technology visibility.");
      }

      await loadItems();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="manage-content">
      <div className="manage-header">
        <h2>Marquee Management</h2>
        <p>Manage the technologies displayed on your portfolio.</p>
      </div>

      <form onSubmit={handleSubmit} className="manage-form">
        <label htmlFor="technology">Technology Name</label>

        <input
          id="technology"
          type="text"
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
          placeholder="e.g. Laravel"
          maxLength={100}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId !== null
              ? "Update Technology"
              : "Add Technology"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setTechnology("");
              setEditingId(null);
              setError("");
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Loading technologies...</p>
      ) : (
        <div className="manage-table-wrapper">
          <table className="manage-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Technology</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4">No technologies found.</td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.technology}</td>
                    <td>{item.is_active ? "Visible" : "Hidden"}</td>
                    <td>
                      <button type="button" onClick={() => handleEdit(item)}>
                        Edit
                      </button>

                      <button type="button" onClick={() => handleToggle(item)}>
                        {item.is_active ? "Hide" : "Show"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
