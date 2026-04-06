import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import BrandLogo from "../components/common/BrandLogo";
import "./RegisterPage.css";
import { registerRequest, validateName } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      validateName(fullName);
      await registerRequest({
        name: fullName,
        email: email,
        password: password
      });
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server"
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg">
        {/* Decorative geometric shapes */}
        <svg
          className="bg-shapes"
          viewBox="0 0 900 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="900" height="600" fill="#e8ddd3" />
          <rect
            x="580"
            y="0"
            width="180"
            height="200"
            rx="12"
            fill="#b8c5a8"
            opacity="0.7"
          />
          <rect
            x="700"
            y="60"
            width="200"
            height="160"
            rx="12"
            fill="#8fa878"
            opacity="0.5"
          />
          <circle cx="750" cy="350" r="80" fill="#c4b8a0" opacity="0.4" />
          <rect
            x="640"
            y="280"
            width="120"
            height="180"
            rx="10"
            fill="#9aab8e"
            opacity="0.5"
          />
          <polygon points="580,80 650,0 720,80" fill="#7a9470" opacity="0.4" />
          <rect
            x="760"
            y="150"
            width="60"
            height="200"
            rx="6"
            fill="#6b8a60"
            opacity="0.35"
          />
          <path
            d="M620 200 L680 120 L740 200 Z"
            fill="none"
            stroke="#8a9e7c"
            strokeWidth="3"
            opacity="0.4"
          />
          <circle cx="820" cy="500" r="50" fill="#a8b898" opacity="0.3" />
          <rect
            x="550"
            y="400"
            width="100"
            height="100"
            rx="50"
            fill="#bac4a8"
            opacity="0.35"
          />
          {/* Diagonal stripes decoration */}
          <g opacity="0.25">
            <line
              x1="700"
              y1="0"
              x2="900"
              y2="200"
              stroke="#7a8a6c"
              strokeWidth="8"
            />
            <line
              x1="720"
              y1="0"
              x2="900"
              y2="180"
              stroke="#7a8a6c"
              strokeWidth="8"
            />
            <line
              x1="740"
              y1="0"
              x2="900"
              y2="160"
              stroke="#7a8a6c"
              strokeWidth="8"
            />
          </g>
        </svg>

        <div className="register-card">
          <form className="register-form" onSubmit={handleSubmit}>
            <BrandLogo className="register-brand-logo" />
            <h1 className="register-title">Create Account</h1>

            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />

            <label className="form-label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <label className="checkbox-label terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              I agree to{" "}
              <Link to="/" className="terms-link">
                Terms &amp; Conditions
              </Link>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn-primary btn-dark">
              Create Account
            </button>

            <p className="form-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
