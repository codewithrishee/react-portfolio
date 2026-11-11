import { useCallback, useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import "./Admin.css";
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const Icon = ({ children }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const NAV = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </>
    ),
  },
  {
    to: "/admin/hero",
    label: "Hero",
    icon: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
  },
  {
    to: "/admin/projects",
    label: "Projects",
    icon: (
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    ),
  },
  {
    to: "/admin/skills",
    label: "All Skills",
    icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    to: "/admin/journey",
    label: "Journey",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    to: "/admin/marquee",
    label: "Marquee",
    icon: (
      <>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </>
    ),
  },
  {
    to: "/admin/about",
    label: "About Me",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  {
    to: "/admin/messages",
    label: "All Messages",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
{
  to: "/admin/resume",
  label: "Resume",
  icon: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </>
  ),
},

];

// Profile photo URL helper
const getProfilePhotoUrl = (photo) => {
  if (!photo) return "";

  // Cloudinary image URL
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  // Old local storage image URL
  return `${import.meta.env.VITE_API_URL}/storage/${photo}`;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState("checking");
  const [admin, setAdmin] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

const [notificationOpen, setNotificationOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
  const handleProfileUpdate = (event) => {
    setAdmin(event.detail);
  };

  window.addEventListener("admin-profile-updated", handleProfileUpdate);

  return () => {
    window.removeEventListener(
      "admin-profile-updated",
      handleProfileUpdate
    );
  };
}, []);

useEffect(() => {
  const handleOutsideClick = (event) => {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target)
    ) {
      setProfileMenuOpen(false);
    }
    if (
  notificationRef.current &&
  !notificationRef.current.contains(event.target)
) {
  setNotificationOpen(false);
}
  };

  const handleEscape = (event) => {
    if (event.key === "Escape") {
      setProfileMenuOpen(false);
      setNotificationOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("touchstart", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
    document.removeEventListener("touchstart", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Verify the token with Laravel whenever this layout mounts.
  useEffect(() => {
    let cancelled = false;

    const verifyToken = async () => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        if (!cancelled) {
          setAuthStatus("unauthenticated");
        }
        return;
      }

      setAuthStatus("checking");

      try {
        const response = await fetch(`${API_URL}/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("admin_token");
          }

          if (!cancelled) {
            setAuthStatus("unauthenticated");
          }
          return;
        }

        const result = await response.json();

        if (!result.success || !result.user) {
          localStorage.removeItem("admin_token");

          if (!cancelled) {
            setAuthStatus("unauthenticated");
          }
          return;
        }

        if (!cancelled) {
          setAdmin(result.user);
          setAuthStatus("authenticated");
        }
      } catch (error) {
        // Fail closed: do not show the admin panel if verification fails.
        // Keep the token if the server is unreachable so it can be retried
        // after the backend connection is restored.
        if (!cancelled) {
          setAuthStatus("connection-error");
        }
      }
    };

    verifyToken();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
  const token = localStorage.getItem("admin_token");

  if (!token) return;

  try {
    setNotificationLoading(true);

    const response = await fetch(
      `${API_URL}/contact-notifications`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Unable to fetch notifications");
    }

    const result = await response.json();

    setNotifications(result.data || []);
    setUnreadCount(result.unread_count || 0);

  } catch (error) {
    console.error("Notification error:", error);
  } finally {
    setNotificationLoading(false);
  }
}, []);

  // Load notifications after authentication and refresh every 30 seconds.
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    fetchNotifications();

    const intervalId = window.setInterval(fetchNotifications, 30000);

    return () => window.clearInterval(intervalId);
  }, [authStatus, fetchNotifications]);

  const handleLogout = async () => {
    const token = localStorage.getItem("admin_token");

    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Server logout request failed:", error);
    } finally {
      // Clear the browser token even if the server is unreachable.
      localStorage.removeItem("admin_token");
      setAdmin(null);
      setAuthStatus("unauthenticated");
      navigate("/admin/login", { replace: true });
    }
  };

  const active =
    NAV.find(
      (item) =>
        pathname === item.to || pathname.startsWith(`${item.to}/`)
    ) || NAV[0];

  if (authStatus === "checking") {
    return (
      <div className="admin-auth-loading">
        <p>Verifying admin session...</p>
      </div>
    );
  }

  if (authStatus === "connection-error") {
    return (
      <div className="admin-auth-loading">
        <p>Unable to verify your session. Check that the Laravel server is running.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (authStatus !== "authenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="admin-menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((previous) => !previous)}
          >
            <Icon>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </Icon>
          </button>

          <h1 className="admin-header-title">{active.label}</h1>
        </div>

        <div className="admin-header-right">
          <div className="admin-notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="admin-notification-btn"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notificationOpen}
              onClick={() => {
                setNotificationOpen((previous) => !previous);
                fetchNotifications();
              }}
            >
              <Icon>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </Icon>
              {unreadCount > 0 && (
                <span className="admin-notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="admin-notification-dropdown">
                <div className="admin-notification-heading">
                  <strong>Notifications</strong>
                  <span>{unreadCount} Unread</span>
                </div>

                {notificationLoading && notifications.length === 0 ? (
                  <p className="admin-notification-empty">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="admin-notification-empty">No notifications yet.</p>
                ) : (
                  notifications.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`admin-notification-item${item.is_read ? "" : " unread"}`}
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/admin/messages");
                      }}
                    >
                      <span className="admin-notification-dot" />
                      <span className="admin-notification-details">
                        <strong>{item.name}</strong>
                        <span>{item.subject || "New contact message"}</span>
                        <small>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "Date unavailable"}
                        </small>
                      </span>
                    </button>
                  ))
                )}

                <button
                  type="button"
                  className="admin-notification-footer"
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate("/admin/messages");
                  }}
                >
                  View All Messages →
                </button>
              </div>
            )}
          </div>

 <div className="admin-profile-wrapper" ref={profileRef}>
    <button
      type="button"
      className="admin-profile"
      onClick={() => setProfileMenuOpen((prev) => !prev)}
      aria-expanded={profileMenuOpen}
    >
     <div className="admin-avatar">
  {admin?.profile_photo ? (
    <img
      src={getProfilePhotoUrl(admin.profile_photo)}
      alt="Admin Profile"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    (admin?.name || "V").charAt(0).toUpperCase()
  )}
</div>

      <div className="admin-profile-info">
        <span className="admin-profile-name">
          {admin?.name || "Administrator"}
        </span>
        <span className="admin-profile-role">Administrator</span>
      </div>
    </button>

    {profileMenuOpen && (
      <div className="admin-profile-dropdown">
        <div className="admin-dropdown-user">
          <strong>{admin?.name}</strong>
          <span>{admin?.email}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setProfileMenuOpen(false);
            navigate("/admin/profile");
          }}
        >
          <Icon>
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21a7 7 0 0 1 14 0" />
          </Icon>
          My Profile
        </button>
      </div>
    )}
  </div>
</div>
      </header>

      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-brand">
          <h2>Vijay Admin</h2>
          <span>Control Panel</span>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon>{item.icon}</Icon>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <Icon>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </Icon>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div
        className={`admin-overlay${open ? " show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}