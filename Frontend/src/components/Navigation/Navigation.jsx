import "./Navigation.css";
import { Link } from "react-router-dom";
import logo from "../../assets/ShowMe.svg";
import React, { useState } from "react";
import ThemeToggle from "../ThemeToggle";

function Navigation({ user }) {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Close menu on route click
  const handleLinkClick = () => setOpen(false);

  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="navigation__left">
        <button
          type="button"
          className="navigation__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navigation__toggle-bar" />
          <span className="navigation__toggle-bar" />
          <span className="navigation__toggle-bar" />
        </button>
        <Link to="/" className="navigation__logo" onClick={handleLinkClick}>
          <img
            src={logo}
            alt="ShowMe Logo"
            className="navigation__logo-image"
          />
        </Link>
      </div>
      <ul
        id="primary-navigation"
        className={`navigation__links ${open ? "navigation__links--open" : ""}`}
      >
        <li
          className="navigation__item"
          style={{ display: "flex", alignItems: "center" }}
        >
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <Link
            to="/movies"
            className="navigation__link"
            onClick={handleLinkClick}
            style={{ marginLeft: 8 }}
          >
            Movies
          </Link>
        </li>
        <li className="navigation__item">
          <Link
            to="/shows"
            className="navigation__link"
            onClick={handleLinkClick}
          >
            Shows
          </Link>
        </li>
        <li className="navigation__item">
          <Link
            to="/about"
            className="navigation__link"
            onClick={handleLinkClick}
          >
            About
          </Link>
        </li>
        <li className="navigation__item">
          <Link
            to="/whatsnew"
            className="navigation__link"
            onClick={handleLinkClick}
          >
            Whats New
          </Link>
        </li>
        {user && (
          <li className="navigation__item">
            <Link
              to="/profile"
              className="navigation__link"
              onClick={handleLinkClick}
            >
              Profile
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
