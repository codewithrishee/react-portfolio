import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success || !result.token) {
        throw new Error(
          result.message || "Invalid email or password."
        );
      }

      // Remove any previously stored session before saving the new token.
      localStorage.removeItem("admin_token");
      localStorage.setItem("admin_token", result.token);

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message || "Server se connection nahi ho paaya."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <aside className="al-brand">
        <div className="al-brand-inner">
          <div className="al-logo">
            <span className="al-logo-mark">V</span>
            <span className="al-logo-text">Vijay Admin</span>
          </div>

          <h2>
            Welcome back,
            <br />
            let's build something great.
          </h2>

          <p>
            Manage your portfolio projects, skills, journey, and
            messages — all from one premium dashboard.
          </p>

          <ul className="al-features">
            <li>
              <span>✓</span> Full control over portfolio content
            </li>
            <li>
              <span>✓</span> Real-time message inbox
            </li>
            <li>
              <span>✓</span> Secure admin authentication
            </li>
          </ul>

          <p className="al-footer">
            © {new Date().getFullYear()} Vijay Kumar. All rights reserved.
          </p>
        </div>

        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />
      </aside>

      <main className="al-form-side">
        <div className="admin-login-card">
          <div className="al-form-head">
            <h1>Admin Login</h1>
            <p>Sign in to manage your portfolio.</p>
          </div>

          {error && (
            <div role="alert" className="admin-error">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">Email</label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter admin email"
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Password</label>

            <div className="al-password-wrap">
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="al-pass-toggle"
                onClick={() => setShowPass((previous) => !previous)}
                aria-label={showPass ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            <button
              type="submit"
              className="al-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="al-spinner" /> Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="al-hint">Authorized personnel only.</p>
        </div>
      </main>
    </div>
  );
}