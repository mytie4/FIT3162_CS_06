import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./LoginPage.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <svg className="brand-icon" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="17" stroke="#fff" strokeWidth="2" />
              <path
                d="M10 24 L18 10 L26 24 Z"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M14 20 L18 14 L22 20"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M12 22 h12" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <span className="brand-name">Eventure</span>
          </div>

          <div className="login-illustration">
            <svg viewBox="0 0 220 200" fill="none">
              <path
                d="M30 160 L110 40 L190 160 Z"
                fill="none"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                d="M60 160 L110 80 L160 160"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M85 160 L110 115 L135 160"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect
                x="70"
                y="100"
                width="80"
                height="55"
                rx="6"
                fill="rgba(255,255,255,0.15)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2"
              />
              <line
                x1="90"
                y1="110"
                x2="150"
                y2="110"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="90"
                y1="120"
                x2="140"
                y2="120"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <line
                x1="90"
                y1="130"
                x2="130"
                y2="130"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
              />
              <rect
                x="75"
                y="108"
                width="10"
                height="10"
                rx="2"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
              />
              <path
                d="M77 113 L79 115.5 L84 110"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
                fill="none"
              />
              <rect
                x="75"
                y="122"
                width="10"
                height="10"
                rx="2"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
              />
              <path
                d="M77 127 L79 129.5 L84 124"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="170" cy="55" r="4" fill="rgba(255,255,255,0.3)" />
              <circle cx="50" cy="75" r="3" fill="rgba(255,255,255,0.25)" />
              <circle cx="180" cy="90" r="2.5" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          <p className="login-tagline">
            Structure your events.
            <br />
            Build your adventure.
          </p>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1 className="login-title">Welcome Back</h1>

            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>

            <p className="form-switch">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
