import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import BrandLogo from "../components/common/BrandLogo";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <BrandLogo className="brand-icon" />
            <span className="brand-name">Eventure</span>
          </div>

          <div className="login-illustration">
            <BrandLogo className="login-illustration-logo" />
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
