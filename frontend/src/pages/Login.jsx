import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext.js";
import axios from "axios";
import { toast } from "react-toastify";
import BrandLogo from "../components/BrandLogo";

const Login = ({ initialState = "Login" }) => {
  const [currentState, setCurrentState] = useState(initialState);
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      const message = error.response?.status === 404
        ? "The login service was not found. Check the backend URL and deployment."
        : error.response?.data?.message || "Unable to sign in. Please try again.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [navigate, token]);

  return (
    <section className="auth-page">
      <form onSubmit={onSubmitHandler} className="auth-card">
        <div className="auth-card-topline">
          <BrandLogo className="w-28" />
          <span className="auth-eyebrow">YOUR ACCOUNT</span>
        </div>
        <div className="auth-heading">
          <h1 className="prata-regular">{currentState === "Login" ? "Welcome back" : "Create your account"}</h1>
          <p>{currentState === "Login" ? "Sign in to continue to Forever." : "Join Forever for a more personal shopping experience."}</p>
        </div>

        {currentState === "Sign Up" && (
          <label className="auth-field-group">
            <span>Name</span>
            <input
              onChange={(event) => setName(event.target.value)}
              value={name}
              type="text"
              autoComplete="name"
              className="auth-field"
              placeholder="Your name"
              required
            />
          </label>
        )}

        <label className="auth-field-group">
          <span>Email address</span>
          <input
            onChange={(event) => setEmail(event.target.value)}
            value={email}
            type="email"
            autoComplete="email"
            className="auth-field"
            placeholder="name@example.com"
            required
          />
        </label>

        <div className="auth-field-group">
          <label htmlFor="auth-password">Password</label>
          <div className="auth-password-wrap">
            <input
              id="auth-password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              autoComplete={currentState === "Login" ? "current-password" : "new-password"}
              className="auth-field auth-password-field"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="auth-password-toggle"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="auth-account-switch">
          <span>{currentState === "Login" ? "New to Forever?" : "Already have an account?"}</span>
          <button type="button" onClick={() => setCurrentState(currentState === "Login" ? "Sign Up" : "Login")}>
            {currentState === "Login" ? "Create account" : "Sign in"}
          </button>
        </div>
        <button className="auth-submit" type="submit">
          {currentState === "Login" ? "Sign In" : "Create account"}
        </button>
        <p className="auth-security-note">Your account details are protected.</p>
      </form>
    </section>
  );
};

export default Login;
