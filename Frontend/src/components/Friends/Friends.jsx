import React, { useEffect, useState } from "react";
import "../Profile/Profile.css";

// Modal to show incoming recommendations for the logged-in user
function RecommendedModal({ onClose, onHandled }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isDark =
    typeof document !== "undefined" &&
    document.body.classList.contains("dark-mode");

  // Close on Escape while modal is open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view recommendations.");
      setLoading(false);
      return;
    }
    fetch("http://localhost:3001/api/recommendations/incoming", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data.recommendations)
          ? data.recommendations
          : [];
        const unread = all.filter((r) => !r.read);
        const readOnes = all.filter((r) => r.read);
        setRecommendations(unread);
        // Optional cleanup: remove old read recommendations from server
        if (readOnes.length > 0) {
          Promise.all(
            readOnes.map((r) =>
              fetch(`http://localhost:3001/api/recommendations/${r._id}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }).catch(() => null)
            )
          ).catch(() => null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch recommendations.");
        setLoading(false);
      });
  }, []);

  const markRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3001/api/recommendations/${id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setRecommendations((prev) =>
      prev.map((r) => (r._id === id ? { ...r, read: true } : r))
    );
  };

  const acceptRecommendation = async (rec) => {
    const token = localStorage.getItem("token");
    try {
      // If we have a showId, attempt to save it to user's shows as a convenience
      if (rec?.showId) {
        await fetch("http://localhost:3001/api/save-show", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            showId: rec.showId,
            name: rec.showName,
            image: rec.image || {},
          }),
        });
      }
    } catch (e) {
      // Non-fatal: proceed to remove recommendation anyway
    }
    try {
      await fetch(`http://localhost:3001/api/recommendations/${rec._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {}
    setRecommendations((prev) => prev.filter((r) => r._id !== rec._id));
    if (typeof onHandled === "function") onHandled(1);
  };

  const ignoreRecommendation = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3001/api/recommendations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {}
    setRecommendations((prev) => prev.filter((r) => r._id !== id));
    if (typeof onHandled === "function") onHandled(1);
  };

  return (
    <div
      className="profile__overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="profile__modal"
        role="document"
        style={{
          maxWidth: "600px",
          width: "90%",
          minHeight: "400px",
          padding: "48px 32px 32px 32px",
          borderRadius: "18px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "#fff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="profile__modal-close"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 24,
            fontSize: 32,
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
          }}
        >
          &times;
        </button>
        <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>
          Incoming Recommendations
        </h2>
        {loading ? (
          <div style={{ color: "#555", fontSize: 18, marginTop: 32 }}>
            Loading...
          </div>
        ) : error ? (
          <div style={{ color: "#e53935", fontSize: 18, marginTop: 32 }}>
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ color: "#666", fontSize: 18, marginTop: 32 }}>
            No recommendations yet.
          </div>
        ) : (
          <ul
            style={{ listStyle: "none", padding: 0, margin: 0, width: "100%" }}
          >
            {recommendations.map((rec) => (
              <li
                key={rec._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  background: isDark
                    ? rec.read
                      ? "#2b2b2b"
                      : "#333333"
                    : rec.read
                      ? "#f3f4f6"
                      : "#eef2ff",
                  color: isDark ? "#f3f4f3" : "inherit",
                  borderRadius: 8,
                  marginBottom: 16,
                  padding: 16,
                  boxShadow: "0 1px 8px #0001",
                  opacity: rec.read ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {rec.from?.avatarUrl ? (
                    <img
                      src={rec.from.avatarUrl}
                      alt="avatar"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#ddd",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#bbb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      {rec.from?.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                  <span style={{ fontWeight: 600 }}>
                    {rec.from?.username || "Unknown"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {rec.image?.medium ? (
                    <img
                      src={rec.image.medium}
                      alt={rec.showName}
                      style={{
                        width: 40,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 4,
                        background: isDark ? "#444" : "#eee",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 40,
                        height: 60,
                        borderRadius: 4,
                        background: isDark ? "#444" : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isDark ? "#ddd" : "#6b7280",
                        fontSize: 24,
                      }}
                    >
                      ?
                    </span>
                  )}
                  <span style={{ fontWeight: 500 }}>{rec.showName}</span>
                </div>
                {rec.note && (
                  <div
                    style={{
                      fontStyle: "italic",
                      color: isDark ? "#ffffff" : "#4b5563",
                    }}
                  >
                    {rec.note}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    fontSize: "0.95em",
                  }}
                >
                  <span>{new Date(rec.createdAt).toLocaleString()}</span>
                  {!rec.read && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        style={{
                          background: "#22c55e",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                        onClick={() => acceptRecommendation(rec)}
                      >
                        Accept
                      </button>
                      <button
                        style={{
                          background: "#9ca3af",
                          color: "#111827",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                        onClick={() => ignoreRecommendation(rec._id)}
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Friends({ user }) {
  const [showFriendMedia, setShowFriendMedia] = useState(false);
  const [friendMedia, setFriendMedia] = useState({ shows: [], movies: [] });
  const [activeFriend, setActiveFriend] = useState(null);
  // ...existing code...
  const [showRequests, setShowRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [displayAvatar, setDisplayAvatar] = useState(user?.avatarUrl || "");
  const [friendRequests, setFriendRequests] = useState(() => {
    try {
      const stored = localStorage.getItem("friendRequestsCount");
      return stored ? Array(Number(stored)).fill({}) : [];
    } catch (e) {
      return [];
    }
  });
  const [sentRequests, setSentRequests] = useState(() => {
    try {
      const stored = localStorage.getItem("sentFriendRequests");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Show recommendations modal
  const [showRecommended, setShowRecommended] = useState(false);
  const [recommendedCount, setRecommendedCount] = useState(0);

  // Fetch count of unread recommendations
  const updateRecommendedCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setRecommendedCount(0);
        return;
      }
      const res = await fetch(
        "http://localhost:3001/api/recommendations/incoming",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      const all = Array.isArray(data.recommendations)
        ? data.recommendations
        : [];
      const unread = all.filter((r) => !r.read);
      setRecommendedCount(unread.length);
    } catch (e) {
      // ignore errors
    }
  };

  useEffect(() => {
    updateRecommendedCount();
  }, []);

  // When modal closes, refresh count (it may have changed)
  useEffect(() => {
    if (!showRecommended) updateRecommendedCount();
  }, [showRecommended]);

  // Global Escape: close any open Friends modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showRequests) setShowRequests(false);
        if (showEdit) setShowEdit(false);
        if (showRecommended) setShowRecommended(false);
        if (showFriendMedia) setShowFriendMedia(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRequests, showEdit, showRecommended, showFriendMedia]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sentFriendRequests");
      if (stored) setSentRequests(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.replace("/");
  };
  const handleUserSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3001/api/users/search?query=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.users || []);
      } else {
        setSearchError(data.error || "Search failed");
      }
    } catch (err) {
      setSearchError("Network error");
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3001/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.username || "");
        setDisplayAvatar(data.avatarUrl || "");
        setUsername(data.username || "");
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch(() => {});
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:3001/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, avatarUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setDisplayName(data.user.username);
        setDisplayAvatar(data.user.avatarUrl);
        setUsername(data.user.username);
        setAvatarUrl(data.user.avatarUrl);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      alert("Network error");
    }
    setShowEdit(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3001/api/friends", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setFriends(data.friends || []);
      })
      .catch(() => {
        setError("Failed to fetch friends.");
        setFriends([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showRequests) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3001/api/friends/requests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const reqs = Array.isArray(data.requests) ? data.requests : [];
        setFriendRequests(reqs);
        localStorage.setItem("friendRequestsCount", reqs.length.toString());
      })
      .catch(() => {
        setFriendRequests([]);
        localStorage.setItem("friendRequestsCount", "0");
      });
  }, [showRequests, user]);

  return (
    <div className="profile">
      <aside className="profile__sidebar" aria-labelledby="friends-heading">
        <div
          className="profile__header"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            justifyContent: "flex-start",
          }}
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Profile"
              className="profile__avatar"
              style={{ width: 56, height: 56 }}
            />
          ) : (
            <div
              className="profile__avatar profile__avatar--default"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#888",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {displayName ? displayName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <h1
            id="friends-heading"
            className="profile__name"
            style={{ margin: 0, fontSize: 28 }}
          >
            {displayName ? displayName : "User"}
          </h1>
        </div>
        <button className="profile__edit-btn" onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        <button
          className="profile__friends-btn"
          disabled
          style={{ marginBottom: 12 }}
        >
          Friends
        </button>
        <button
          className="profile__friend-requests-btn"
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: "1rem",
            borderRadius: 8,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            marginBottom: 12,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowRequests(true)}
        >
          Friend Requests
          {Array.isArray(friendRequests) && friendRequests.length > 0 && (
            <span
              style={{
                background: "#e53935",
                color: "#fff",
                borderRadius: "8px",
                padding: "2px 8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginLeft: 10,
                minWidth: 24,
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                display: "inline-block",
              }}
            >
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          className="profile__recommended-btn"
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: "1rem",
            borderRadius: 8,
            border: "none",
            background: "#6a1b9a",
            color: "#fff",
            cursor: "pointer",
            marginBottom: 12,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowRecommended(true)}
        >
          <span>Recommended</span>
          {recommendedCount > 0 && (
            <span
              aria-label={`${recommendedCount} recommendations`}
              style={{
                position: "absolute",
                top: 12,
                right: 10,
                minWidth: 22,
                height: 22,
                padding: "0 6px",
                borderRadius: 999,
                background: "#ef4444",
                color: "#fff",
                fontSize: 12,
                lineHeight: "22px",
                textAlign: "center",
                fontWeight: 700,
                boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
              }}
            >
              {recommendedCount > 99 ? "99+" : recommendedCount}
            </span>
          )}
        </button>
        <button
          className="profile__back-btn"
          style={{
            width: "100%",
            padding: "12px 0",
            fontSize: "1rem",
            borderRadius: 8,
            border: "none",
            background: "#e5e7eb",
            color: "#333",
            cursor: "pointer",
            marginBottom: 12,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => window.history.back()}
        >
          Back
        </button>
        {/* Modal for friend requests */}
        {showRequests && (
          <div
            className="profile__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="friend-requests-title"
            onClick={() => setShowRequests(false)}
          >
            <div
              className="profile__modal"
              role="document"
              style={{
                maxWidth: "600px",
                width: "90%",
                minHeight: "600px",
                padding: "48px 32px 32px 32px",
                borderRadius: "18px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                background: "#fff",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="profile__modal-close"
                aria-label="Close"
                onClick={() => setShowRequests(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 24,
                  fontSize: 32,
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
              <h2
                id="friend-requests-title"
                style={{ marginBottom: 32, fontSize: 32, fontWeight: 700 }}
              >
                Friend Requests
              </h2>
              <div style={{ width: "100%", maxWidth: 480 }}>
                {Array.isArray(friendRequests) &&
                friendRequests.length === 0 ? (
                  <div
                    style={{
                      color: "#888",
                      fontSize: 18,
                      textAlign: "center",
                      marginTop: 32,
                    }}
                  >
                    No friend requests.
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {Array.isArray(friendRequests) &&
                      friendRequests.map((req) => {
                        const fromUser = req.from || {};
                        const avatarUrl =
                          fromUser.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(fromUser.username || "User")}`;
                        const username = fromUser.username || "Unknown";
                        return (
                          <li
                            key={req._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "18px 0",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <img
                                src={avatarUrl}
                                alt={username}
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 12,
                                  marginRight: 16,
                                }}
                              />
                              <span style={{ fontSize: 20, fontWeight: 500 }}>
                                {username}
                              </span>
                            </div>
                            <div>
                              <button
                                style={{
                                  background: "#22c55e",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "8px 16px",
                                  marginRight: 8,
                                  cursor: "pointer",
                                }}
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  try {
                                    const res = await fetch(
                                      "http://localhost:3001/api/friends/accept",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({
                                          requestId: req._id,
                                        }),
                                      }
                                    );
                                    const data = await res.json();
                                    if (!res.ok) {
                                      alert(
                                        data.error || "Failed to accept request"
                                      );
                                      return;
                                    }
                                    setFriendRequests((prev) =>
                                      prev.filter((r) => r._id !== req._id)
                                    );
                                    // Refresh friends list
                                    const friendsRes = await fetch(
                                      "http://localhost:3001/api/friends",
                                      {
                                        method: "GET",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                      }
                                    );
                                    const friendsData = await friendsRes.json();
                                    setFriends(friendsData.friends || []);
                                  } catch (err) {
                                    alert("Network error");
                                  }
                                }}
                              >
                                Accept
                              </button>
                              <button
                                style={{
                                  background: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "8px 16px",
                                  cursor: "pointer",
                                }}
                                onClick={async () => {
                                  const token = localStorage.getItem("token");
                                  try {
                                    const res = await fetch(
                                      "http://localhost:3001/api/friends/reject",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                        body: JSON.stringify({
                                          requestId: req._id,
                                        }),
                                      }
                                    );
                                    const data = await res.json();
                                    if (!res.ok) {
                                      alert(
                                        data.error || "Failed to reject request"
                                      );
                                      return;
                                    }
                                    setFriendRequests((prev) =>
                                      prev.filter((r) => r._id !== req._id)
                                    );
                                  } catch (err) {
                                    alert("Network error");
                                  }
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Recommended modal */}
        {showRecommended && (
          <RecommendedModal
            onClose={() => setShowRecommended(false)}
            onHandled={(n = 1) =>
              setRecommendedCount((c) => Math.max(0, c - (Number(n) || 1)))
            }
          />
        )}
        <button className="profile__signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
        {/* Modal for editing profile */}
        {showEdit && (
          <div
            className="profile__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={() => setShowEdit(false)}
          >
            <div
              className="profile__modal"
              role="document"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="profile__modal-close"
                aria-label="Close"
                onClick={() => setShowEdit(false)}
              >
                &times;
              </button>
              <h2 id="edit-profile-title" className="visually-hidden">
                Edit profile
              </h2>
              <form onSubmit={handleEditSubmit} className="profile__form">
                <label htmlFor="edit-username">Profile Name</label>
                <input
                  id="edit-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <label htmlFor="edit-avatar">Profile Image URL</label>
                <input
                  id="edit-avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste image URL"
                />
                <button type="submit" className="profile__save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="profile__cancel-btn"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </aside>
      {/* ...existing code for edit modal and sidebar... */}
      <main className="profile__main" aria-labelledby="friends-list-heading">
        <h2 id="friends-list-heading" style={{ marginBottom: 24 }}>
          Friends
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUserSearch();
                }
              }}
              style={{
                width: 320,
                padding: "10px 16px",
                fontSize: 18,
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleUserSearch}
              style={{
                marginLeft: 12,
                padding: "10px 20px",
                fontSize: 18,
                borderRadius: 8,
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSearchError(null);
              }}
              style={{
                marginLeft: 8,
                padding: "10px 20px",
                fontSize: 18,
                borderRadius: 8,
                background: "#e5e7eb",
                color: "#333",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
          {/* Search results */}
          {searchLoading && <div style={{ marginTop: 16 }}>Searching...</div>}
          {searchError && (
            <div style={{ marginTop: 16, color: "red" }}>{searchError}</div>
          )}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div style={{ marginTop: 16, width: "100%" }}>
              <h3
                className="friends__results-heading"
                style={{ fontWeight: 500, marginBottom: 8 }}
              >
                Results:
              </h3>
              <section
                className="profile__shows-grid"
                aria-label="User search results"
              >
                {searchResults
                  .filter((u) => u._id !== user?._id)
                  .map((user) => {
                    const isFriend = friends.some((f) => f._id === user._id);
                    return (
                      <article
                        className="profile__card"
                        aria-labelledby={`user-title-${user._id}`}
                        key={user._id}
                        style={{ position: "relative", paddingBottom: 48 }}
                      >
                        <img
                          src={
                            user.avatarUrl ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(user.username)
                          }
                          alt={user.username}
                          className="profile__image"
                          loading="lazy"
                        />
                        <div
                          className="profile__info"
                          role="group"
                          aria-label={`${user.username} info`}
                        >
                          <h3
                            id={`user-title-${user._id}`}
                            className="profile__show-title"
                          >
                            {user.username ? user.username : "User"}
                          </h3>
                          {/* Email removed for privacy */}
                        </div>
                        {isFriend ? null : sentRequests.includes(user._id) ? (
                          <button
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: 12,
                              transform: "translateX(-50%)",
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "#2563eb",
                              border: "1px solid #2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: 18,
                              color: "#fff",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            }}
                            title="Cancel Friend Request"
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const toUserId = user._id;
                              if (!toUserId) {
                                alert("Missing user ID");
                                return;
                              }
                              try {
                                const res = await fetch(
                                  "http://localhost:3001/api/friends/cancel-request",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ toUserId }),
                                  }
                                );
                                const data = await res.json();
                                if (!res.ok) {
                                  alert(
                                    data.error ||
                                      "Failed to cancel friend request"
                                  );
                                  return;
                                }
                                setSentRequests((prev) => {
                                  const updated = prev.filter(
                                    (id) => id !== user._id
                                  );
                                  localStorage.setItem(
                                    "sentFriendRequests",
                                    JSON.stringify(updated)
                                  );
                                  // Re-fetch friend requests to update UI
                                  const token = localStorage.getItem("token");
                                  fetch(
                                    `http://localhost:3001/api/friends/requests`,
                                    {
                                      method: "GET",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  )
                                    .then((res) => res.json())
                                    .then((data) => {
                                      const reqs = Array.isArray(data.requests)
                                        ? data.requests
                                        : [];
                                      setFriendRequests(reqs);
                                      localStorage.setItem(
                                        "friendRequestsCount",
                                        reqs.length.toString()
                                      );
                                    })
                                    .catch(() => {});
                                  return updated;
                                });
                              } catch (err) {
                                alert("Failed to cancel friend request");
                              }
                            }}
                          >
                            <span
                              style={{
                                fontSize: 22,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              &#8594;
                            </span>
                          </button>
                        ) : (
                          <button
                            style={{
                              position: "absolute",
                              left: "50%",
                              bottom: 12,
                              transform: "translateX(-50%)",
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "#22c55e",
                              border: "1px solid #16a34a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              fontSize: 18,
                              color: "#fff",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                            }}
                            title="Add Friend"
                            onClick={async () => {
                              const token = localStorage.getItem("token");
                              const toUserId = user._id; // card user from searchResults
                              if (!toUserId) {
                                alert("Missing user ID");
                                return;
                              }
                              try {
                                const res = await fetch(
                                  "http://localhost:3001/api/friends/request",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({ toUserId }),
                                  }
                                );
                                const data = await res.json();
                                if (!res.ok) {
                                  alert(
                                    data.error ||
                                      "Failed to send friend request"
                                  );
                                  return;
                                }
                                setSentRequests((prev) => {
                                  const updated = [...prev, user._id];
                                  localStorage.setItem(
                                    "sentFriendRequests",
                                    JSON.stringify(updated)
                                  );
                                  return updated;
                                });
                              } catch (err) {
                                alert("Failed to send friend request");
                              }
                            }}
                          >
                            +
                          </button>
                        )}
                      </article>
                    );
                  })}
              </section>
            </div>
          )}
        </div>
        {searchQuery.trim() === "" ? (
          loading ? (
            <p>Loading friends...</p>
          ) : error ? (
            <p>{error}</p>
          ) : friends.length === 0 && searchResults.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60vh",
                fontSize: 24,
                color: "#888",
              }}
            >
              No Friends to Show
            </div>
          ) : (
            <section className="profile__shows-grid" aria-label="Friends list">
              {friends.map((friend) => (
                <article
                  className="profile__card"
                  aria-labelledby={`friend-title-${friend._id}`}
                  key={friend._id}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    (window.location.href = `/friend/${friend._id}`)
                  }
                >
                  <img
                    src={
                      (friend && friend.avatarUrl) ||
                      (user && user.avatarUrl) ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(friend?.username || "Friend")
                    }
                    alt={friend.username}
                    className="profile__image"
                    loading="lazy"
                  />
                  <div
                    className="profile__info"
                    role="group"
                    aria-label={`${friend.username} info`}
                  >
                    <h3
                      id={`friend-title-${friend._id}`}
                      className="profile__show-title"
                    >
                      {friend.username}
                    </h3>
                    {/* Email removed for privacy */}
                  </div>
                </article>
              ))}
            </section>
          )
        ) : null}
      </main>
      {/* Friend Media Modal */}
      {showFriendMedia && activeFriend && (
        <div
          className="profile__overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFriendMedia(false)}
        >
          <div
            className="profile__modal"
            role="document"
            style={{
              maxWidth: 700,
              width: "95%",
              minHeight: 400,
              padding: 32,
              borderRadius: 18,
              background: "#fff",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profile__modal-close"
              aria-label="Close"
              onClick={() => setShowFriendMedia(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 24,
                fontSize: 32,
                background: "none",
                border: "none",
                color: "#888",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h2 style={{ marginBottom: 24, fontSize: 28, fontWeight: 700 }}>
              {activeFriend.username}'s Media
            </h2>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 600 }}>Shows</h3>
              {friendMedia.shows.length === 0 ? (
                <div style={{ color: "#888", fontSize: 16 }}>
                  No shows added.
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {friendMedia.shows.map((show) => (
                    <li key={show._id} style={{ marginBottom: 12 }}>
                      <strong>{show.name}</strong>{" "}
                      {show.season ? `(Season ${show.season})` : ""}{" "}
                      {show.episode ? `Ep ${show.episode}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 600 }}>Movies</h3>
              {friendMedia.movies.length === 0 ? (
                <div style={{ color: "#888", fontSize: 16 }}>
                  No movies added.
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {friendMedia.movies.map((movie) => (
                    <li key={movie._id} style={{ marginBottom: 12 }}>
                      <strong>{movie.name}</strong>{" "}
                      {movie.release_date ? `(${movie.release_date})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Friends;
