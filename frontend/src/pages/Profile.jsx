import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.js";
import Title from "../components/Title";

const themeOptions = [
  { value: "system", label: "Device", icon: "◐" },
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
];

const Profile = () => {
  const { backendUrl, token, theme, setTheme, navigate, getCartCount } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return undefined;
    }

    let active = true;
    axios.get(backendUrl + "/api/user/profile", { headers: { token } })
      .then(({ data }) => {
        if (active && data.success) setProfile(data.profile);
      })
      .catch((error) => {
        if (!active) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/login");
          return;
        }
        setLoadError("We couldn’t load your account details. Please try again shortly.");
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [backendUrl, token, navigate]);

  const firstName = profile?.name?.trim().split(/\s+/)[0] || "there";
  const initials = profile?.name?.trim().charAt(0).toUpperCase() || "F";

  return (
    <section className="profile-page border-t pt-10 sm:pt-14">
      <div className="profile-page-heading">
        <Title text1="MY" text2="PROFILE" />
        <p>Your account, preferences, and shopping shortcuts.</p>
      </div>

      {loading ? (
        <div className="profile-skeleton" aria-label="Loading your profile">
          <span /><span /><span />
        </div>
      ) : loadError ? (
        <div className="profile-error" role="status">{loadError}</div>
      ) : profile && (
        <>
          <div className="profile-welcome-card">
            <div className="profile-avatar" aria-hidden="true">{initials}</div>
            <div className="profile-welcome-copy">
              <p className="profile-eyebrow">FOREVER MEMBER</p>
              <h1 className="prata-regular">Good to see you, {firstName}</h1>
              <p>Everything you need for your next visit, in one place.</p>
            </div>
            <Link to="/collection" className="profile-shop-link">Explore collection <span aria-hidden="true">↗</span></Link>
          </div>

          <div className="profile-content-grid">
            <section className="profile-panel">
              <div className="profile-panel-heading">
                <div><p className="profile-eyebrow">ACCOUNT</p><h2>Your details</h2></div>
                <span className="profile-panel-icon" aria-hidden="true">01</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-icon" aria-hidden="true">N</span>
                <div><span>Name</span><strong>{profile.name}</strong></div>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-icon" aria-hidden="true">@</span>
                <div><span>Email address</span><strong className="profile-email">{profile.email}</strong></div>
              </div>
            </section>

            <section className="profile-panel">
              <div className="profile-panel-heading">
                <div><p className="profile-eyebrow">PREFERENCES</p><h2>Appearance</h2></div>
                <span className="profile-panel-icon" aria-hidden="true">02</span>
              </div>
              <p className="profile-panel-description">Choose the look that feels right for you.</p>
              <div className="profile-theme-options" role="group" aria-label="Choose appearance theme">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`profile-theme-option ${theme === option.value ? "is-selected" : ""}`}
                    aria-pressed={theme === option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    <span aria-hidden="true">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="profile-shortcuts">
            <Link to="/orders" className="profile-shortcut-card">
              <span className="profile-shortcut-icon" aria-hidden="true">↗</span>
              <span><strong>My orders</strong><small>Check your latest order updates</small></span>
              <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/favorites" className="profile-shortcut-card">
              <span className="profile-shortcut-icon" aria-hidden="true">♡</span>
              <span><strong>Favorites</strong><small>Return to pieces you’ve saved</small></span>
              <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/cart" className="profile-shortcut-card">
              <span className="profile-shortcut-icon" aria-hidden="true">{getCartCount()}</span>
              <span><strong>Your cart</strong><small>Continue where you left off</small></span>
              <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default Profile;
