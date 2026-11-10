import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
const API_URL = `${import.meta.env.VITE_API_URL}/api`;
const STORAGE_URL = `${import.meta.env.VITE_API_URL}/storage/`;

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  case_study: "",
  features: "",
  technologies: "",
  live_url: "",
  github_url: "",
  is_featured: false,
  is_visible: true,
  sort_order: 0,
};

function getImageUrl(image) {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${STORAGE_URL}${image.replace(/^\/+/, "")}`;
}

function normalizeFeatures(features) {
  if (Array.isArray(features)) {
    return features.join("\n");
  }

  if (typeof features === "string" && features.trim()) {
    try {
      const parsed = JSON.parse(features);

      if (Array.isArray(parsed)) {
        return parsed.join("\n");
      }
    } catch {
      return features;
    }

    return features;
  }

  return "";
}

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getHeaders = () => ({
    Accept: "application/json",
    Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
  });

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load projects.");
      }

      setProjects(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");

    const fileInput = document.getElementById("project-image");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);

    setForm({
      title: project.title || "",
      slug: project.slug || "",
      description: project.description || "",
      case_study: project.case_study || "",
      features: normalizeFeatures(project.features),
      technologies: project.technologies || "",
      live_url: project.live_url || "",
      github_url: project.github_url || "",
      is_featured: Boolean(project.is_featured),
      is_visible: Boolean(project.is_visible),
      sort_order: project.sort_order ?? 0,
    });

    setImageFile(null);
    setImagePreview(getImageUrl(project.image));

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();

      payload.append("title", form.title.trim());
      payload.append("slug", form.slug.trim());
      payload.append("description", form.description.trim());
      payload.append("case_study", form.case_study.trim());
      payload.append("technologies", form.technologies.trim());
      payload.append("live_url", form.live_url.trim());
      payload.append("github_url", form.github_url.trim());
      payload.append(
        "is_featured",
        form.is_featured ? "1" : "0"
      );
      payload.append(
        "is_visible",
        form.is_visible ? "1" : "0"
      );
      payload.append(
        "sort_order",
        String(Number(form.sort_order))
      );

      const features = form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);

      features.forEach((feature, index) => {
        payload.append(`features[${index}]`, feature);
      });

      if (imageFile) {
        payload.append("image", imageFile);
      }

      if (editingId) {
        payload.append("_method", "PUT");
      }

      const response = await fetch(
        editingId
          ? `${API_URL}/projects/${editingId}`
          : `${API_URL}/projects`,
        {
          method: "POST",
          headers: getHeaders(),
          body: payload,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("admin_token");

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        const validationErrors = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationErrors ||
            result.message ||
            "Unable to save project."
        );
      }

      setMessage(
        editingId
          ? "Project updated successfully!"
          : "Project added successfully!"
      );

      resetForm();
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${project.title}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/projects/${project.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem("admin_token");

        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete project."
        );
      }

      setMessage("Project deleted successfully!");

      if (editingId === project.id) {
        resetForm();
      }

      await fetchProjects();
    } catch (err) {
      setError(err.message || "Unable to delete project. Please try again.");
    }
  };

  return (
    <div className="manage-projects">
      <header className="manage-projects-header">
        <div>
          <Link to="/admin/dashboard">
            ← Back to Dashboard
          </Link>

          <h1>
            {editingId ? "Edit Project" : "Manage Projects"}
          </h1>

          <p>
            Add, update and manage your portfolio projects.
          </p>
        </div>
      </header>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="project-admin-form"
      >
        <h2>
          {editingId ? "Update Project" : "Add New Project"}
        </h2>

        <label htmlFor="title">
          Project Title *
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </label>

        <label htmlFor="slug">
          Slug *
          <input
            id="slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="my-project"
            required
            maxLength={255}
          />
        </label>

        <label htmlFor="description">
          Short Description *
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
          />
        </label>

        <label htmlFor="case_study">
          Case Study
          <textarea
            id="case_study"
            name="case_study"
            value={form.case_study}
            onChange={handleChange}
            placeholder="Explain the project's purpose, problem, solution and functionality..."
            rows={7}
          />
          <small>
            Describe the project's purpose, problem, and solution.
          </small>
        </label>

        <label htmlFor="features">
          Key Features
          <textarea
            id="features"
            name="features"
            value={form.features}
            onChange={handleChange}
            placeholder={
              "Enter one feature per line\nResponsive design\nAdmin dashboard\nContact form"
            }
            rows={5}
          />
          <small>
            Enter each feature on a separate line.
          </small>
        </label>

        <label htmlFor="technologies">
          Technologies
          <input
            id="technologies"
            name="technologies"
            value={form.technologies}
            onChange={handleChange}
            placeholder="React, Laravel, MySQL"
            maxLength={255}
          />
        </label>

        <label htmlFor="project-image">
          Project Image (JPG, PNG, WEBP — max 2 MB)
          <input
            id="project-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
          />
        </label>

        {imagePreview && (
          <div className="project-image-preview">
            <img
              src={imagePreview}
              alt="Project preview"
              style={{
                display: "block",
                width: "220px",
                maxWidth: "100%",
                height: "140px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "10px",
              }}
            />

            <button
              type="button"
              onClick={() => {
                setImageFile(null);

                const input =
                  document.getElementById("project-image");

                if (input) {
                  input.value = "";
                }

                setImagePreview(
                  editingId
                    ? getImageUrl(
                        projects.find(
                          (project) => project.id === editingId
                        )?.image
                      )
                    : ""
                );
              }}
            >
              Remove Selected Image
            </button>
          </div>
        )}

        <label htmlFor="live_url">
          Live Project URL
          <input
            id="live_url"
            name="live_url"
            type="url"
            value={form.live_url}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </label>

        <label htmlFor="github_url">
          GitHub URL
          <input
            id="github_url"
            name="github_url"
            type="url"
            value={form.github_url}
            onChange={handleChange}
            placeholder="https://github.com/username/project"
          />
        </label>

        <label htmlFor="sort_order">
          Display Order
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min="0"
            value={form.sort_order}
            onChange={handleChange}
          />
        </label>

        <label>
          <input
            name="is_featured"
            type="checkbox"
            checked={form.is_featured}
            onChange={handleChange}
          />
          Featured Project
        </label>

        <label>
          <input
            name="is_visible"
            type="checkbox"
            checked={form.is_visible}
            onChange={handleChange}
          />
          Visible on Portfolio
        </label>

        <div className="project-form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Project"
                : "Add Project"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <section className="project-admin-list">
        <h2>Existing Projects ({projects.length})</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div>
            {projects.map((project) => (
              <article
                key={project.id}
                className="project-admin-item"
              >
                <div>
                  {project.image && (
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.title}
                      loading="lazy"
                      style={{
                        width: "100px",
                        height: "65px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    />
                  )}

                  <h3>{project.title}</h3>

                  <p>
                    {project.technologies ||
                      "No technologies added"}
                  </p>

                  <small>
                    {project.is_visible ? "Visible" : "Hidden"}
                    {" · "}
                    {project.is_featured
                      ? "Featured"
                      : "Not featured"}
                  </small>

                  <p>
                    <small>
                      Case Study:{" "}
                      {project.case_study
                        ? "Added"
                        : "Not added"}
                      {" · "}
                      Features:{" "}
                      {Array.isArray(project.features)
                        ? project.features.length
                        : 0}
                    </small>
                  </p>
                </div>

                <div className="project-admin-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}