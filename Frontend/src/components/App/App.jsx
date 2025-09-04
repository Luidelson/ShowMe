import './App.css';
import React, { useState } from 'react';
import Footer from '../Footer/Footer';
import Navigation from '../Navigation/Navigation';
import { Routes, Route } from 'react-router-dom';
import About from '../About/About';
import Content from '../Content/Content';
import Profile from '../Profile/Profile';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import LoginModal from '../LoginModal/LoginModal';
import RegisterModal from '../RegisterModal/RegisterModal';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
      setUser(data.user);
    }
  };

  const handleRegister = (data) => {
    if (data.token) {
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
      setUser(data.user);
      setShowRegister(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            ) : (
              <div className="app__main" role="main">
                <section
                  className="app__circle-container"
                  aria-labelledby="features-heading"
                >
                  <div className="app__features-circle">
                    <h1 id="features-heading" className="visually-hidden">
                      ShowMe Features
                    </h1>
                    <ul>
                      <li>
                        <span className="app__check">&#10003;</span> Keep up
                        with your favorite shows
                      </li>
                      <li>
                        <span className="app__check">&#10003;</span> Find new
                        shows to watch
                      </li>
                      <li>
                        <span className="app__check">&#10003;</span> Get started
                        free today!
                      </li>
                    </ul>
                  </div>
                </section>
                <div
                  className="app__register-form"
                  aria-labelledby="auth-heading"
                >
                  {!showRegister ? (
                    <LoginModal onLogin={handleLogin} />
                  ) : (
                    <RegisterModal onRegister={handleRegister} />
                  )}
                  <button
                    type="button"
                    className="app__register-btn"
                    onClick={() => setShowRegister(!showRegister)}
                  >
                    {showRegister ? 'Back to Login' : 'Register'}
                  </button>
                </div>
              </div>
            )
          }
        />
        <Route path="/shows" element={<Content />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
