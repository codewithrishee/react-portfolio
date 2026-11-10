
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      window.location.replace("/admin/login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(`${API_URL}/dashboard`, { headers });

      if (response.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const result = await response.json();

      setStats(result.stats || {});
      setProjects(result.recent_projects || []);
      setMessages(result.recent_messages || []);
      setSkills(result.recent_skills || []);

      const userResponse = await fetch(`${API_URL}/me`, { headers });

      if (userResponse.status === 401) {
        localStorage.removeItem("admin_token");
        window.location.replace("/admin/login");
        return;
      }

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        setUser(userResult.user);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = [
    { title: "Total Projects", value: stats.total_projects ?? 0, icon: "📁" },
    { title: "Featured Projects", value: stats.featured_projects ?? 0, icon: "⭐" },
    { title: "Visible Projects", value: stats.visible_projects ?? 0, icon: "👁️" },
    { title: "Hidden Projects", value: stats.hidden_projects ?? 0, icon: "🔒" },
    { title: "Total Skills", value: stats.total_skills ?? 0, icon: "💻" },
    { title: "Active Skills", value: stats.active_skills ?? 0, icon: "⚡" },
    { title: "Hidden Skills", value: stats.hidden_skills ?? 0, icon: "🙈" },
    { title: "Total Messages", value: stats.total_messages ?? 0, icon: "✉️" },
    { title: "Unread Messages", value: stats.unread_messages ?? 0, icon: "📩" },
  ];

  const quickActions = [
    { title: "Manage Projects", description: "Add, edit and organize projects", link: "/admin/projects", icon: "📁" },
    { title: "Manage Skills", description: "Update your technical skills", link: "/admin/skills", icon: "💻" },
    { title: "Manage Resume", description: "Upload or update your resume", link: "/admin/resume", icon: "📄" },
    { title: "Contact Messages", description: "Read and manage inquiries", link: "/admin/messages", icon: "✉️" },
    { title: "Manage Hero", description: "Update your homepage introduction", link: "/admin/hero", icon: "✨" },
    { title: "Manage About", description: "Edit your profile information", link: "/admin/about", icon: "👤" },
    { title: "Manage Journey", description: "Update your career timeline", link: "/admin/journey", icon: "🚀" },
    { title: "Manage Marquee", description: "Manage scrolling technologies", link: "/admin/marquee", icon: "🔄" },
  ];

  if (isLoading) {
    return (
      <section className="admin-dashboard">
        <h2>Loading Dashboard...</h2>
        <p>Fetching your portfolio data.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard">
        <h1>Dashboard</h1>
        <p role="alert">{error}</p>
        <button type="button" onClick={loadDashboard}>Try Again</button>
      </section>
    );
  }

  return (
    <section className="admin-dashboard">

      <header className="dashboard-header">
        <div>
          <p>ADMINISTRATION</p>
          <h1>Dashboard Overview</h1>
          <p>
            Welcome back, <strong>{user?.name || "Admin"}</strong>!
            Here's what's happening with your portfolio.
          </p>
        </div>

        <button type="button" onClick={loadDashboard}>
          ↻ Refresh
        </button>
      </header>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Portfolio Statistics</h2>
          <p>Live data from your database</p>
        </div>

        <div className="admin-stats">
          {statCards.map((card) => (
            <article className="admin-stat-card" key={card.title}>
              <div className="admin-stat-icon">{card.icon}</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <h2>Quick Actions</h2>
          <p>Manage different sections of your portfolio</p>
        </div>

        <div className="dashboard-quick-actions">
          {quickActions.map((action) => (
            <Link to={action.link} className="dashboard-action-card" key={action.link}>
              <span className="dashboard-action-icon">{action.icon}</span>
              <div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <span className="dashboard-action-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-content-grid">

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Projects</h2>
            <Link to="/admin/projects">View All →</Link>
          </div>

          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <div className="dashboard-list">
              {projects.map((project) => (
                <article className="dashboard-list-item" key={project.id}>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.is_featured ? "⭐ Featured" : "Regular Project"}</p>
                  </div>
                  <span className={`dashboard-badge ${project.is_visible ? "visible" : "hidden"}`}>
                    {project.is_visible ? "Visible" : "Hidden"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Messages</h2>
            <Link to="/admin/messages">View All →</Link>
          </div>

          {messages.length === 0 ? (
            <p>No messages found.</p>
          ) : (
            <div className="dashboard-list">
              {messages.map((message) => (
                <article className="dashboard-list-item" key={message.id}>
                  <div>
                    <h3>{message.name}</h3>
                    <p>{message.email}</p>
                    <p>{message.subject || "No subject"}</p>
                  </div>
                  <span className={`dashboard-badge ${message.is_read ? "visible" : "unread"}`}>
                    {message.is_read ? "Read" : "Unread"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Skills</h2>
            <Link to="/admin/skills">Manage Skills →</Link>
          </div>

          {skills.length === 0 ? (
            <p>No skills found.</p>
          ) : (
            <div className="dashboard-list">
              {skills.map((skill) => (
                <article className="dashboard-list-item" key={skill.id}>
                  <div>
                    <h3>{skill.name}</h3>
                    <p>{skill.category}</p>
                  </div>
                  <span className={`dashboard-badge ${skill.is_active ? "visible" : "hidden"}`}>
                    {skill.is_active ? "Active" : "Hidden"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </section>
  );
}
