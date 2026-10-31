import { useEffect, useState } from "react";
import "./Admin.css";

const API_URL = "http://127.0.0.1:8000/api";

const initialForm = {
  name: "", eyebrow: "AVAILABLE FOR OPPORTUNITIES",
  role_prefix: "Full Stack", role_suffix: "Developer",
  technologies: "PHP · Laravel · React",
  heading_line_1: "I build production-ready",
  heading_line_2: "interfaces for the modern web.",
  roles: ["PHP Developer", "Laravel Developer", "React Developer", "Full Stack Developer"],
  description: "",
  primary_button_text: "Explore My Work", primary_button_link: "#projects",
  secondary_button_text: "Get in touch", secondary_button_link: "#contact",
  github_url: "", linkedin_url: "",
  experience_value: "06+", experience_label: "MONTHS EXPERIENCE",
  technology_count: "05+", technology_label: "TECHNOLOGIES",
  project_count: "03+", project_label: "PROJECTS BUILT",
  availability_text: "Open", availability_label: "TO OPPORTUNITIES",
  is_active: true,
};

function ManageHero() {
  const [form, setForm] = useState(initialForm);
  const [heroId, setHeroId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const token = localStorage.getItem("admin_token");
  const authHeaders = { Accept: "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    const loadHero = async () => {
      if (!token) {
        setMessage("Admin token nahi mila. Pehle admin login karo.");
        setMessageType("error"); setLoading(false); return;
      }
      try {
        const response = await fetch(`${API_URL}/hero-admin`, { headers: authHeaders });
        if (!response.ok) {
          throw new Error(
            response.status === 401 || response.status === 403
              ? "Login expire ho gaya ya permission nahi hai."
              : "Hero data load nahi hua."
          );
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const existingHero = data[0];
          setHeroId(existingHero.id);
          setForm({
            ...initialForm, ...existingHero,
            roles: Array.isArray(existingHero.roles) ? existingHero.roles : initialForm.roles,
            is_active: Boolean(existingHero.is_active),
          });
        }
      } catch (error) {
        setMessage(error.message || "Something went wrong."); setMessageType("error");
      } finally { setLoading(false); }
    };
    loadHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    if (!token) {
      setMessage("Admin token nahi mila. Pehle login karo.");
      setMessageType("error"); setSaving(false); return;
    }
    const cleanedRoles = form.roles.map((r) => r.trim()).filter(Boolean);
    if (cleanedRoles.length === 0) {
      setMessage("Kam se kam ek typewriter role add karo.");
      setMessageType("error"); setSaving(false); return;
    }
    const payload = { ...form, roles: cleanedRoles, is_active: Boolean(form.is_active) };
    const isUpdating = Boolean(heroId);
    try {
      const response = await fetch(
        isUpdating ? `${API_URL}/hero-sections/${heroId}` : `${API_URL}/hero-sections`,
        {
          method: isUpdating ? "PUT" : "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const ve = result.errors ? Object.values(result.errors).flat().join(" ") : "";
        throw new Error(ve || result.message || "Hero save nahi hua.");
      }
      if (result.hero?.id) setHeroId(result.hero.id);
      setMessage(isUpdating ? "Hero section successfully update ho gaya!" : "Hero section successfully create ho gaya!");
      setMessageType("success");
    } catch (error) {
      setMessage(error.message || "Something went wrong."); setMessageType("error");
    } finally { setSaving(false); }
  };

  const renderInput = (name, label, placeholder = "", type = "text") => (
    <label key={name}>
      {label}
      <input type={type} name={name} value={form[name] ?? ""} onChange={handleChange} placeholder={placeholder} />
    </label>
  );

  const renderTextarea = (name, label, placeholder = "") => (
    <label key={name}>
      {label}
      <textarea name={name} value={form[name] ?? ""} onChange={handleChange} placeholder={placeholder} rows={4} />
    </label>
  );

  if (loading) return <div className="manage-content">Loading Hero settings...</div>;

  return (
    <div className="manage-hero">
      <header className="mh-header">
        <div>
          <h1>Manage Hero Section</h1>
          <p>Apne portfolio ke Hero section ka content yahan se manage karo.</p>
        </div>
      </header>

      {message && (
        <div className={`mh-alert ${messageType}`} role="status">{message}</div>
      )}

      {!heroId && (
        <div className="mh-note">
          Abhi existing Hero record nahi mila. Form save karne par naya record create hoga.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mh-form">
        <section className="mh-section">
          <h2>Basic Details</h2>
          <div className="mh-grid">
            {renderInput("name", "Your Name")}
            {renderInput("eyebrow", "Eyebrow / Status Text")}
            {renderInput("role_prefix", "Role Prefix")}
            {renderInput("role_suffix", "Role Suffix")}
            {renderInput("technologies", "Technology Line")}
            <div className="mh-full">{renderTextarea("description", "Description")}</div>
          </div>
        </section>

        <section className="mh-section">
          <h2>Hero Headings</h2>
          <div className="mh-grid">
            {renderInput("heading_line_1", "Heading Line 1")}
            {renderInput("heading_line_2", "Heading Line 2")}
          </div>
        </section>

        <section className="mh-section">
          <h2>Typewriter Roles</h2>
          <label>
            Roles — har line par ek role likho
            <textarea
              value={form.roles.join("\n")}
              onChange={(e) => setForm((prev) => ({ ...prev, roles: e.target.value.split("\n") }))}
              rows={5}
              placeholder={"PHP Developer\nLaravel Developer\nReact Developer"}
            />
          </label>
        </section>

        <section className="mh-section">
          <h2>Call-to-Action Buttons</h2>
          <div className="mh-grid">
            {renderInput("primary_button_text", "Primary Button Text")}
            {renderInput("primary_button_link", "Primary Button Link")}
            {renderInput("secondary_button_text", "Secondary Button Text")}
            {renderInput("secondary_button_link", "Secondary Button Link")}
          </div>
        </section>

        <section className="mh-section">
          <h2>Social Profiles</h2>
          <div className="mh-grid">
            {renderInput("github_url", "GitHub URL", "https://github.com/")}
            {renderInput("linkedin_url", "LinkedIn URL", "https://www.linkedin.com/")}
          </div>
        </section>

        <section className="mh-section">
          <h2>Portfolio Statistics</h2>
          <div className="mh-grid">
            {renderInput("experience_value", "Experience Value")}
            {renderInput("experience_label", "Experience Label")}
            {renderInput("technology_count", "Technology Count")}
            {renderInput("technology_label", "Technology Label")}
            {renderInput("project_count", "Project Count")}
            {renderInput("project_label", "Project Label")}
            {renderInput("availability_text", "Availability Text")}
            {renderInput("availability_label", "Availability Label")}
          </div>
        </section>

        <section className="mh-section">
          <h2>Visibility</h2>
          <label className="mh-checkbox">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
            <span>
              <strong>Show Hero Section</strong>
              <small>Uncheck karne par public Hero API active record return nahi karegi.</small>
            </span>
          </label>
        </section>

        <button type="submit" className="mh-submit" disabled={saving}>
          {saving ? "Saving..." : heroId ? "Update Hero Section" : "Create Hero Section"}
        </button>
      </form>
    </div>
  );
}

export default ManageHero;