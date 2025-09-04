import './Navigation.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/ShowMe.svg';
import React, { useState } from 'react';

function Navigation({ user }) {
  const [open, setOpen] = useState(false);

  // Close menu on route click
  const handleLinkClick = () => setOpen(false);

  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="navigation__left">
        <button
          type="button"
          className="navigation__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
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
        className={`navigation__links ${open ? 'navigation__links--open' : ''}`}
      >
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
