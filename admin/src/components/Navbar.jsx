import React from "react";

const Navbar = ({ setToken, theme, toggleTheme }) => {
  return (
    <header className="admin-topbar">
      <div className="admin-brand-lockup">
        <span className="admin-wordmark">Forever<span>.</span></span>
        <span className="admin-brand-divider" />
        <span className="admin-brand-caption">STORE ADMIN</span>
      </div>
      <div className="admin-topbar-actions">
        <button type="button" onClick={toggleTheme} className="admin-theme-toggle" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="hidden sm:inline">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <span className="admin-account-label">Administrator</span>
        <button type="button" onClick={() => setToken("")} className="admin-logout-button">
          Sign out
        </button>
      </div>
    </header>
  );
};

export default Navbar;
