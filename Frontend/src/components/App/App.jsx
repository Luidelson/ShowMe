import "./App.css";
import React, { useState } from "react";
import Footer from "../Footer/Footer";
import Navigation from "../Navigation/Navigation";
import { Routes, Route, useParams } from "react-router-dom";
import FriendProfile from "../FriendProfile/FriendProfile";
import About from "../About/About";
import Content from "../Content/Content";
import Profile from "../Profile/Profile";
import Friends from "../Friends/Friends";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";
import LoginModal from "../LoginModal/LoginModal";
import RegisterModal from "../RegisterModal/RegisterModal";
import Movies from "../Movies/Movies";
import WhatsNew from "../WhatsNew/WhatsNew";

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("token"));
  });
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      setUser(data.user);
      if (data.user && (data.user.id || data.user._id)) {
        localStorage.setItem("userId", data.user.id || data.user._id);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    }
  };

  const handleRegister = (data) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      setUser(data.user);
      setShowRegister(false);
      if (data.user && (data.user.id || data.user._id)) {
        localStorage.setItem("userId", data.user.id || data.user._id);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
                    {showRegister ? "Back to Login" : "Register"}
                  </button>
                </div>
              </div>
            )
          }
        />
        <Route path="/whatsnew" element={<WhatsNew />} />
        <Route path="/shows" element={<Content />} />
        <Route path="/about" element={<About />} />
        <Route path="/movies" element={<Movies />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Friends user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friend/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <FriendProfileWrapper />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}

function FriendProfileWrapper() {
  const { id } = useParams();
  return <FriendProfile friendId={id} />;
}

export default App;
