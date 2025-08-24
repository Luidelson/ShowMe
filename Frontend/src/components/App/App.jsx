import "./App.css";
import React, { useState } from "react";
import Footer from "../Footer/Footer";
import Navigation from "../Navigation/Navigation";
import { Routes, Route } from "react-router-dom";
import About from "../About/About";
import Content from "../Content/Content";
import Profile from "../Profile/Profile";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

function App() {
  const [showRegister, setShowRegister] = useState(false);

  const handleRegisterClick = (e) => {
    e.preventDefault();
    setShowRegister(true);
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    setShowRegister(false);
  };

  // Simple login state for demonstration
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-content">
              <div className="circle-container">
                <div className="features-circle">
                  <ul>
                    <li>
                      <span className="check">&#10003;</span> Keep up with your
                      favorite shows
                    </li>
                    <li>
                      <span className="check">&#10003;</span> Find new shows to
                      watch
                    </li>
                    <li>
                      <span className="check">&#10003;</span> Get started free
                      today!
                    </li>
                  </ul>
                </div>
              </div>
              <div className="register-form">
                {!showRegister ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsAuthenticated(true);
                    }}
                  >
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Enter your email"
                    />
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="Enter your password"
                    />
                    <button type="submit" className="login-btn">
                      Log In
                    </button>
                    <button
                      type="button"
                      className="register-btn"
                      onClick={handleRegisterClick}
                    >
                      Register
                    </button>
                  </form>
                ) : (
                  <form>
                    <label htmlFor="reg-email">Email</label>
                    <input
                      type="email"
                      id="reg-email"
                      placeholder="Enter your email"
                    />
                    <label htmlFor="reg-password">Password</label>
                    <input
                      type="password"
                      id="reg-password"
                      placeholder="Create a password"
                    />
                    <label htmlFor="reg-confirm">Confirm Password</label>
                    <input
                      type="password"
                      id="reg-confirm"
                      placeholder="Confirm your password"
                    />
                    <button type="submit" className="register-btn">
                      Register
                    </button>
                    <button
                      type="button"
                      className="login-btn"
                      onClick={handleBackToLogin}
                    >
                      Back to Login
                    </button>
                  </form>
                )}
              </div>
            </div>
          }
        />
        <Route path="/shows" element={<Content />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
