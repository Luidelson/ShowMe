import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Profile/Profile.css";

function FriendProfile({ friendId }) {
  const [friend, setFriend] = useState(null);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedList, setSelectedList] = useState("shows");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFriend() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:3001/api/users/${friendId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch friend");
        setFriend(data.user);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    async function fetchMedia() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `http://localhost:3001/api/friends/${friendId}/media`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setShows(data.shows || []);
        setMovies(data.movies || []);
      } catch (err) {
        setShows([]);
        setMovies([]);
      }
    }
    fetchFriend();
    fetchMedia();
  }, [friendId]);

  if (loading) return <div className="profile">Loading...</div>;
  if (error) return <div className="profile">{error}</div>;
  if (!friend) return <div className="profile">Friend not found.</div>;

  return (
    <div className="profile">
      <aside className="profile__sidebar" aria-labelledby="friend-heading">
        <div className="profile__header">
          {friend.avatarUrl ? (
            <img
              src={friend.avatarUrl}
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
                background: "#90caf9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {(friend.username || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <h1
            id="friend-heading"
            className="profile__name"
            style={{ margin: 0, fontSize: 28 }}
          >
            {friend.username || "Friend"}
          </h1>
        </div>
        <button
          className="profile__message-btn"
          style={{
            marginTop: 12,
            padding: "8px 20px",
            fontSize: 18,
            fontWeight: 500,
            borderRadius: 8,
            background: "#4fc3f7",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => alert(`Messaging ${friend.username}`)}
        >
          Message
        </button>
        <button
          className="profile__delete-friend-btn"
          style={{
            marginTop: 10,
            padding: "8px 20px",
            fontSize: 18,
            fontWeight: 500,
            borderRadius: 8,
            background: "#ef4444",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Friend
        </button>
        <button
          className="profile__back-btn"
          style={{
            marginTop: 10,
            padding: "8px 20px",
            fontSize: 18,
            fontWeight: 500,
            borderRadius: 8,
            background: "#e0e0e0",
            color: "#333",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 32,
                borderRadius: 12,
                boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                minWidth: 320,
                textAlign: "center",
              }}
            >
              <h2 style={{ marginBottom: 16 }}>
                Are you sure you want to delete{" "}
                <span style={{ color: "#ef4444" }}>{friend.username}</span>?
              </h2>
              <div
                style={{ display: "flex", justifyContent: "center", gap: 16 }}
              >
                <button
                  style={{
                    padding: "8px 20px",
                    fontSize: 18,
                    fontWeight: 500,
                    borderRadius: 8,
                    background: "#e5e7eb",
                    color: "#333",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "8px 20px",
                    fontSize: 18,
                    fontWeight: 500,
                    borderRadius: 8,
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    cursor: deleting ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    setDeleting(true);
                    const token = localStorage.getItem("token");
                    fetch(`http://localhost:3001/api/friends/${friendId}`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        setDeleting(false);
                        setShowDeleteModal(false);
                        if (data.success) {
                          navigate("/friends");
                        } else {
                          alert(data.error || "Failed to delete friend");
                        }
                      })
                      .catch(() => {
                        setDeleting(false);
                        setShowDeleteModal(false);
                        alert("Network error");
                      });
                  }}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
      <main className="profile__main" aria-labelledby="shows-heading">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 16,
            width: "100%",
          }}
        >
          <label
            htmlFor="friend-list-select"
            className="profile__myshows-heading"
            id="shows-heading"
            style={{ margin: 0 }}
          >
            <select
              id="friend-list-select"
              value={selectedList || "shows"}
              onChange={(e) => setSelectedList(e.target.value)}
              style={{
                fontSize: 28,
                fontWeight: 700,
                borderRadius: 8,
                padding: "6px 20px",
                background: "inherit",
                border: "none",
                outline: "none",
                color: "inherit",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <option value="shows">Shows</option>
              <option value="movies">Movies</option>
            </select>
          </label>
        </div>
        {selectedList === "shows" && (
          <section
            className="profile__shows-grid"
            aria-label="Friend's shows list"
          >
            {shows.length === 0 && <p>No shows added yet.</p>}
            {shows.map((show) => {
              const imageSrc =
                show.image && show.image.medium
                  ? show.image.medium
                  : show.image && show.image.original
                    ? show.image.original
                    : show.image_thumbnail_path
                      ? show.image_thumbnail_path
                      : "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png";
              return (
                <article
                  className="profile__card"
                  aria-labelledby={`show-title-${show._id}`}
                  key={show._id}
                >
                  <img
                    src={imageSrc}
                    alt={show.name}
                    className="profile__image"
                    loading="lazy"
                  />
                  <div
                    className="profile__info"
                    role="group"
                    aria-label={`${show.name} progress`}
                  >
                    <h3
                      id={`show-title-${show._id}`}
                      className="profile__show-title"
                    >
                      {show.name}
                    </h3>
                    <p className="profile__meta">Start: {show.start_date}</p>
                    <p className="profile__meta">
                      Season: {show.season || "-"}
                    </p>
                    <p className="profile__meta">
                      Episode: {show.episode || "-"}
                    </p>
                    {show.status === "finished" && (
                      <p
                        className="profile__meta"
                        style={{ fontWeight: 600, color: "#388e3c" }}
                      >
                        Finished
                      </p>
                    )}
                    {show.status === "watch_later" && (
                      <p
                        className="profile__meta"
                        style={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        Watch Later
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
        {selectedList === "movies" && (
          <section
            className="profile__shows-grid"
            aria-label="Friend's movies list"
          >
            {movies.length === 0 && <p>No movies added yet.</p>}
            {movies.map((movie) => {
              const imageSrc =
                movie.image && movie.image.medium
                  ? movie.image.medium
                  : movie.image && movie.image.original
                    ? movie.image.original
                    : "https://via.placeholder.com/300x450?text=No+Image";
              return (
                <article
                  className="profile__card"
                  aria-labelledby={`movie-title-${movie._id}`}
                  key={movie._id}
                >
                  <img
                    src={imageSrc}
                    alt={movie.name}
                    className="profile__image"
                    loading="lazy"
                  />
                  <div
                    className="profile__info"
                    role="group"
                    aria-label={`${movie.name} info`}
                  >
                    <h3
                      id={`movie-title-${movie._id}`}
                      className="profile__show-title"
                    >
                      {movie.name}
                    </h3>
                    <p className="profile__meta">
                      Release: {movie.release_date}
                    </p>
                    {movie.status === "finished" && (
                      <p
                        className="profile__meta"
                        style={{ fontWeight: 600, color: "#388e3c" }}
                      >
                        Finished
                      </p>
                    )}
                    {movie.status === "watch_later" && (
                      <p
                        className="profile__meta"
                        style={{ fontWeight: 600, color: "#1976d2" }}
                      >
                        Watch Later
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default FriendProfile;
