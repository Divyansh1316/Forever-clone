import axios from "axios";
import React, { useState } from "react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import brandLogo from "../assets/forever-logo.png";

const Login = ({ setToken, theme, toggleTheme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });
      if (response.data.success) {
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cannot reach the API. Check the backend service and CORS configuration.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={onSubmitHandler}>
        <div className="admin-login-topline">
          <span className="admin-logo-wrap admin-login-logo">
            <img src={brandLogo} className="admin-logo-image" alt="Forever" />
            <span className="admin-logo-dot" aria-hidden="true" />
          </span>
          <button type="button" onClick={toggleTheme} className="admin-theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
        <div className="admin-login-heading">
          <p className="admin-eyebrow">STORE MANAGEMENT</p>
          <h1>Welcome back</h1>
          <p>Sign in to manage your catalog and orders.</p>
        </div>
        <div className="admin-form-field">
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="admin-field"
            type="email"
            autoComplete="username"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="admin-form-field">
          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="admin-field"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        <button className="admin-login-submit" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in to dashboard"}
        </button>
        <p className="admin-login-footnote">Authorized administrators only</p>
      </form>
    </div>
  );
};

export default Login;
