import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      window.location.replace("/admin/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          window.location.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Dashboard load nahi hua. Laravel API check karo.");
        }

        const result = await response.json();

        setStats(result.stats || {});
        setProjects(result.recent_projects || []);
        setMessages(result.recent_messages || []);

        const userResponse = await fetch(`${API_URL}/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

    loadDashboard();
  }, []);

  if (isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <section>
        <h1>Dashboard</h1>
        <p role="alert">{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    );
  }

  const statCards = [
    {
      title: "Total Projects",
      value: stats.total_projects ?? 0,
      icon: "📁",
    },
    {
      title: "Featured Projects",
      value: stats.featured_projects ?? 0,
      icon: "⭐",
    },
    {
      title: "Visible Projects",
      value: stats.visible_projects ?? 0,
      icon: "👁️",
    },
    {
      title: "Hidden Projects",
      value: stats.hidden_projects ?? 0,
      icon: "🔒",
    },
    {
      title: "Total Messages",
      value: stats.total_messages ?? 0,
      icon: "✉️",
    },
    {
      title: "Unread Messages",
      value: stats.unread_messages ?? 0,
      icon: "📩",
    },
  ];

  return (
    <section className="admin-dashboard">
      <header className="dashboard-header">
        <div>
          <p>ADMINISTRATION</p>
          <h1>Dashboard</h1>
          <p>
            Welcome back, <strong>{user?.name || "Admin"}</strong>!
          </p>
        </div>

        <button onClick={() => window.location.reload()}>
          ↻ Refresh
        </button>
      </header>

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

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Projects</h2>
            <Link to="/admin/projects">Manage Projects →</Link>
          </div>

          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <div className="dashboard-list">
              {projects.map((project) => (
                <article className="dashboard-list-item" key={project.id}>
                  <div>
                    <h3>{project.title}</h3>
                    <p>
                      {project.is_featured
                        ? "⭐ Featured"
                        : "Regular Project"}
                    </p>
                  </div>

                  <span
                    className={
                      project.is_visible
                        ? "dashboard-badge visible"
                        : "dashboard-badge hidden"
                    }
                  >
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

                  <span
                    className={
                      message.is_read
                        ? "dashboard-badge visible"
                        : "dashboard-badge unread"
                    }
                  >
                    {message.is_read ? "Read" : "Unread"}
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
