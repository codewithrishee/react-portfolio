import { useCallback, useEffect, useState } from "react";
import "./Admin.css";

const API_URL = "http://127.0.0.1:8000/api";

export default function ManageMessages() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const getToken = () => localStorage.getItem("admin_token");

  const fetchMessages = useCallback(async (url = `${API_URL}/contact-messages`) => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) throw new Error("Admin session not found. Please log in again.");

      const response = await fetch(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Unable to load messages (${response.status}).`);
      }

      setMessages(result.data?.data || []);
      setPagination({
        currentPage: result.data?.current_page || 1,
        lastPage: result.data?.last_page || 1,
        nextPageUrl: result.data?.next_page_url || null,
        prevPageUrl: result.data?.prev_page_url || null,
        total: result.data?.total || 0,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function toggleReadStatus(item) {
    setUpdatingId(item.id);
    setError("");
    try {
      const response = await fetch(`${API_URL}/contact-messages/${item.id}/read-status`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_read: !item.is_read }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update message status.");

      await fetchMessages(
        pagination?.currentPage > 1
          ? `${API_URL}/contact-messages?page=${pagination.currentPage}`
          : `${API_URL}/contact-messages`
      );
    } catch (err) {
      setError(err.message || "Unable to update message status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteMessage(item) {
    if (!window.confirm(`Delete the message from ${item.name}? This action cannot be undone.`)) return;
    setDeletingId(item.id);
    setError("");
    try {
      const response = await fetch(`${API_URL}/contact-messages/${item.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to delete message.");

      const currentPage = pagination?.currentPage || 1;
      const totalAfterDelete = (pagination?.total || 0) - 1;
      const lastPageAfterDelete = Math.max(1, Math.ceil(totalAfterDelete / 10));
      const targetPage = Math.min(currentPage, lastPageAfterDelete);

      await fetchMessages(
        targetPage > 1
          ? `${API_URL}/contact-messages?page=${targetPage}`
          : `${API_URL}/contact-messages`
      );
    } catch (err) {
      setError(err.message || "Unable to delete message.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredMessages = messages.filter((item) => {
    if (filter === "read") return Boolean(item.is_read);
    if (filter === "unread") return !item.is_read;
    return true;
  });

  const unreadCount = messages.filter((item) => !item.is_read).length;

  return (
    <div className="manage-messages">
      <header className="mm-header">
        <div>
          <h1>Contact Messages</h1>
          <p>Manage messages received through your portfolio contact form.</p>
        </div>
        <button
          type="button"
          className="mm-refresh-btn"
          onClick={() =>
            fetchMessages(
              pagination?.currentPage > 1
                ? `${API_URL}/contact-messages?page=${pagination.currentPage}`
                : `${API_URL}/contact-messages`
            )
          }
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="mm-error" role="alert">
          <span>{error}</span>
          {error.toLowerCase().includes("session") && (
            <small>Open the admin login page and sign in again.</small>
          )}
        </div>
      )}

      <div className="mm-stats">
        <div className="mm-stat-card">
          <span className="mm-stat-label">Total Messages</span>
          <span className="mm-stat-value">{pagination?.total ?? 0}</span>
        </div>
        <div className="mm-stat-card">
          <span className="mm-stat-label">Unread on This Page</span>
          <span className="mm-stat-value">{unreadCount}</span>
        </div>
        <div className="mm-stat-card">
          <span className="mm-stat-label">Current Page</span>
          <span className="mm-stat-value">
            {pagination?.currentPage ?? 1} / {pagination?.lastPage ?? 1}
          </span>
        </div>
      </div>

      <div className="mm-filters">
        {[["all", "All Messages"], ["unread", "Unread"], ["read", "Read"]].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`mm-filter${filter === value ? " active" : ""}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mm-empty">Loading contact messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="mm-empty">
          <h3>No messages found</h3>
          <p>
            {messages.length === 0
              ? "Messages submitted through your contact form will appear here."
              : "No messages match the selected filter on this page."}
          </p>
        </div>
      ) : (
        filteredMessages.map((item) => (
          <article key={item.id} className="mm-card">
            <div className="mm-card-top">
              <div className="mm-sender">
                <h3>{item.name}</h3>
                <a href={`mailto:${item.email}`}>{item.email}</a>
                {item.subject && (
                  <p className="mm-subject"><strong>Subject:</strong> {item.subject}</p>
                )}
              </div>
              <span className={`mm-badge ${item.is_read ? "read" : "unread"}`}>
                {item.is_read ? "READ" : "UNREAD"}
              </span>
            </div>

            <div className="mm-message-body">{item.message}</div>

            <p className="mm-date">
              Received: {item.created_at ? new Date(item.created_at).toLocaleString() : "Date unavailable"}
            </p>

            <div className="mm-actions">
              <button
                type="button"
                className="mm-btn-toggle"
                disabled={updatingId === item.id || deletingId === item.id}
                onClick={() => toggleReadStatus(item)}
              >
                {updatingId === item.id
                  ? "Updating..."
                  : item.is_read
                    ? "Mark as Unread"
                    : "Mark as Read"}
              </button>
              <button
                type="button"
                className="mm-btn-delete"
                disabled={deletingId === item.id || updatingId === item.id}
                onClick={() => deleteMessage(item)}
              >
                {deletingId === item.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </article>
        ))
      )}

      {pagination && pagination.lastPage > 1 && (
        <div className="mm-pagination">
          <span>Page {pagination.currentPage} of {pagination.lastPage}</span>
          <div className="mm-pagination-btns">
            <button
              type="button"
              disabled={!pagination.prevPageUrl || loading}
              onClick={() => fetchMessages(pagination.prevPageUrl)}
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={!pagination.nextPageUrl || loading}
              onClick={() => fetchMessages(pagination.nextPageUrl)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}