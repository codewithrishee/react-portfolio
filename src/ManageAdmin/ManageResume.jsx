
import { useEffect, useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function ManageResume() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("admin_token");

  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchResume = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/resume`, {
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load resume.");
      }

      setResume(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_URL}/resume`, {
        method: "POST",
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const validationError = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : result.message;

        throw new Error(validationError || "Resume upload failed.");
      }

      setMessage("Resume uploaded successfully.");
      setFile(null);

      await fetchResume();
    } catch (err) {
      setError(err.message || "Resume upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/resume`, {
        method: "DELETE",
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Resume deletion failed.");
      }

      setResume(null);
      setFile(null);
      setMessage("Resume deleted successfully.");
    } catch (err) {
      setError(err.message || "Resume deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  const downloadUrl = `${API_URL}/resume/download`;

  return (
    <div className="manage-resume">
      <div className="manage-resume-header">
        <div>
          <span className="manage-resume-eyebrow">PORTFOLIO SETTINGS</span>
          <h2>Resume Management</h2>
          <p>Upload and manage the resume displayed on your portfolio.</p>
        </div>
      </div>

      {message && (
        <div className="resume-alert resume-alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="resume-alert resume-alert-error">
          {error}
        </div>
      )}

      <div className="resume-management-grid">
        <section className="resume-panel">
          <div className="resume-panel-heading">
            <h3>Current Resume</h3>
            <span className={resume ? "resume-status-active" : "resume-status-empty"}>
              {resume ? "Active" : "Not Uploaded"}
            </span>
          </div>

          {loading ? (
            <div className="resume-loading">
              Loading resume details...
            </div>
          ) : resume ? (
            <div className="resume-current-file">
              <div className="resume-pdf-icon">PDF</div>

              <div className="resume-file-info">
                <strong>{resume.original_name}</strong>
                <span>PDF Document</span>
              </div>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="resume-download-btn"
              >
                View Resume ↗
              </a>
            </div>
          ) : (
            <div className="resume-empty">
              <div className="resume-empty-icon">📄</div>
              <strong>No resume uploaded</strong>
              <p>Upload a PDF to make it available on your portfolio.</p>
            </div>
          )}

          {resume && (
            <button
              type="button"
              className="resume-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Resume"}
            </button>
          )}
        </section>

        <section className="resume-panel">
          <div className="resume-panel-heading">
            <h3>{resume ? "Replace Resume" : "Upload Resume"}</h3>
          </div>

          <form onSubmit={handleUpload}>
            <label className="resume-upload-area">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                  setMessage("");
                }}
              />

              <span className="resume-upload-icon">↑</span>
              <strong>
                {file ? file.name : "Choose your resume PDF"}
              </strong>
              <span>Click to browse · PDF only · Maximum 5 MB</span>
            </label>

            <button
              type="submit"
              className="resume-upload-btn"
              disabled={!file || saving}
            >
              {saving
                ? "Uploading..."
                : resume
                  ? "Update Resume"
                  : "Upload Resume"}
            </button>
          </form>
        </section>
      </div>

      <div className="resume-info-note">
        <strong>How it works</strong>
        <p>
          Once uploaded, the latest resume will be available through
          the public portfolio download link. You won't need to update
          the frontend code every time you replace your PDF.
        </p>
      </div>
    </div>
  );
}
