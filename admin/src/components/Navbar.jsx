import React, { useEffect, useRef, useState } from "react";
import brandLogo from "../assets/forever-logo.png";

const Navbar = ({ setToken, theme, setTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const signOut = () => {
    setMenuOpen(false);
    setToken("");
  };

  return (
    <header className="admin-topbar">
      <div className="admin-brand-lockup">
        <span className="admin-logo-wrap">
          <img src={brandLogo} className="admin-logo-image" alt="Forever" />
          <span className="admin-logo-dot" aria-hidden="true" />
        </span>
        <span className="admin-brand-divider" />
        <span className="admin-brand-caption">STORE ADMIN</span>
      </div>
      <div className="admin-topbar-actions">
        <div className="admin-profile-menu" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="admin-profile-trigger"
            aria-label="Open administrator menu"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-controls="admin-profile-dropdown"
          >
            <span className="admin-avatar" aria-hidden="true">A</span>
            <span className="hidden sm:inline">Account</span>
            <span className={`admin-chevron ${menuOpen ? "is-open" : ""}`} aria-hidden="true">⌄</span>
          </button>
          {menuOpen && (
            <div id="admin-profile-dropdown" className="admin-profile-dropdown" aria-label="Administrator menu">
              <div className="admin-profile-heading">
                <span className="admin-avatar admin-avatar-large" aria-hidden="true">A</span>
                <div>
                  <p>Administrator</p>
                  <span>Store management</span>
                </div>
              </div>
              <div className="admin-menu-divider" />
              <div className="admin-menu-theme">
                <label htmlFor="admin-theme-choice">Theme</label>
                <select id="admin-theme-choice" value={theme} onChange={(event) => setTheme(event.target.value)}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <button type="button" onClick={signOut} className="admin-menu-signout">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
