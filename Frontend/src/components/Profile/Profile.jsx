import React, { useState } from "react";
import "./Profile.css";

function Profile({ user, onLogout }) {
  // Dropdown state for toggling between shows and movies
  const [selectedList, setSelectedList] = useState("shows");
  const [editShowModal, setEditShowModal] = useState(null);
  const [editSeason, setEditSeason] = useState("");
  const [editEpisode, setEditEpisode] = useState("");

  // Show and movie progress is now stored in backend per user, so no localStorage usage.
  const [myShows, setMyShows] = useState([]);
  const [myMovies, setMyMovies] = useState([]);

  // Fetch saved shows and movies from backend on mount
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:3001/api/saved-shows", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMyShows(data.shows || []);
      })
      .catch(() => {
        setMyShows([]);
      });
    fetch("http://localhost:3001/api/saved-movies", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMyMovies(data.movies || []);
      })
      .catch(() => {
        setMyMovies([]);
      });
  }, []);
  const [showEdit, setShowEdit] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayAvatar, setDisplayAvatar] = useState("");

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:3001/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setDisplayName(data.username || "");
          setDisplayAvatar(data.avatarUrl || "");
          setUsername(data.username || "");
          setAvatarUrl(data.avatarUrl || "");
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
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
        if (user) {
          user.username = data.user.username;
          user.avatarUrl = data.user.avatarUrl;
        }
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      alert("Network error");
    }
    setShowEdit(false);
  };

  // Close any open profile-related modal with Escape
  React.useEffect(() => {
    if (!showEdit && !editShowModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (editShowModal) setEditShowModal(null);
        if (showEdit) setShowEdit(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEdit, editShowModal]);

  return (
    <div className="profile">
      <aside className="profile__sidebar" aria-labelledby="profile-heading">
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
                background: "#90caf9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {(displayName || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <h1
            id="profile-heading"
            className="profile__name"
            style={{ margin: 0, fontSize: 28 }}
          >
            {displayName || "Profile Name"}
          </h1>
        </div>
        {/* Edit Profile button above Sign Out button */}
        <button className="profile__edit-btn" onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        <button
          className="profile__friends-btn"
          onClick={() => (window.location.href = "/friends")}
        >
          Friends
        </button>
        <button className="profile__signout-btn" onClick={onLogout}>
          Sign Out
        </button>
        {/* Modal for editing profile */}
        {showEdit && (
          <div
            className="profile__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="profile__modal" role="document">
              <button
                className="profile__modal-close"
                aria-label="Close"
                onClick={() => setShowEdit(false)}
              >
                &times;
              </button>
              <form onSubmit={handleEditSubmit} className="profile__form">
                <h2 id="edit-profile-title" className="visually-hidden">
                  Edit profile
                </h2>
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
            htmlFor="profile-list-select"
            className="profile__myshows-heading"
            id="shows-heading"
            style={{ margin: 0 }}
          >
            <select
              id="profile-list-select"
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
            aria-label="Saved shows list"
          >
            {myShows.length === 0 && <p>No shows added yet.</p>}
            {myShows.map((show) => {
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
                  aria-labelledby={`show-title-${show.showId}`}
                  key={show.showId}
                  onClick={() => {
                    setEditShowModal(show);
                    setEditSeason(show.season || "");
                    setEditEpisode(show.episode || "");
                  }}
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
                      id={`show-title-${show.showId}`}
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
            aria-label="Saved movies list"
          >
            {myMovies.length === 0 && <p>No movies added yet.</p>}
            {myMovies.map((movie) => {
              const imageSrc =
                movie.image && movie.image.medium
                  ? movie.image.medium
                  : movie.image && movie.image.original
                    ? movie.image.original
                    : "https://via.placeholder.com/300x450?text=No+Image";
              return (
                <article
                  className="profile__card"
                  aria-labelledby={`movie-title-${movie.movieId || movie.id}`}
                  key={movie.movieId || movie.id}
                  onClick={() => {
                    const id = movie.movieId || movie.id;
                    setEditShowModal({
                      ...movie,
                      showId: id,
                      movieId: id,
                      season: movie.season || "",
                      episode: movie.episode || "",
                      isMovie: true,
                    });
                    setEditSeason(movie.season || "");
                    setEditEpisode(movie.episode || "");
                  }}
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
                      id={`movie-title-${movie.movieId || movie.id}`}
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
      {editShowModal && (
        <div
          className="profile__modal-overlay"
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="profile__modal"
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 32px #0000002e",
              minWidth: 340,
              maxWidth: "90vw",
              padding: "32px 28px 32px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "relative",
            }}
          >
            <button
              className="profile__modal-close"
              aria-label="Close"
              onClick={() => setEditShowModal(null)}
              type="button"
            >
              &times;
            </button>
            <h2 style={{ marginBottom: 8 }}>
              {editShowModal.isMovie
                ? "Edit Movie Progress"
                : "Edit Show Progress"}
            </h2>
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 16,
                textAlign: "left",
                alignSelf: "flex-start",
              }}
            >
              {editShowModal.name}
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editShowModal.isMovie) return; // Prevent submit for movies
                const token = localStorage.getItem("token");
                try {
                  const res = await fetch(
                    "http://localhost:3001/api/save-show",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        showId: editShowModal.showId,
                        season: editSeason,
                        episode: editEpisode,
                      }),
                    }
                  );
                  if (!res.ok) {
                    alert("Failed to save show progress");
                    return;
                  }
                  // Refresh saved shows only if save succeeded
                  const showsRes = await fetch(
                    "http://localhost:3001/api/saved-shows",
                    {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const data = await showsRes.json();
                  setMyShows(data.shows || []);
                  setEditShowModal(null);
                } catch (err) {
                  alert("Network error while saving show");
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {/* Save button (for shows only) */}
                {!editShowModal.isMovie && (
                  <>
                    <label htmlFor="edit-season">Season</label>
                    <input
                      id="edit-season"
                      type="number"
                      min="1"
                      value={editSeason}
                      onChange={(e) => setEditSeason(e.target.value)}
                      required
                    />
                    <label htmlFor="edit-episode">Episode</label>
                    <input
                      id="edit-episode"
                      type="number"
                      min="1"
                      value={editEpisode}
                      onChange={(e) => setEditEpisode(e.target.value)}
                      required
                    />
                    <button type="submit" className="profile__save-btn">
                      Save
                    </button>
                  </>
                )}
                {/* Finished & Watch Later buttons side by side */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                    margin: "8px 0",
                  }}
                >
                  <button
                    type="button"
                    className="profile__save-btn"
                    style={{ background: "#388e3c", color: "#fff", flex: 1 }}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (editShowModal.isMovie) {
                        await fetch("http://localhost:3001/api/save-movie", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            movieId: editShowModal.movieId,
                            status: "finished",
                          }),
                        });
                        const moviesRes = await fetch(
                          "http://localhost:3001/api/saved-movies",
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        const data = await moviesRes.json();
                        setMyMovies(data.movies || []);
                        setEditShowModal(null);
                      } else {
                        await fetch("http://localhost:3001/api/save-show", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            showId: editShowModal.showId,
                            status: "finished",
                          }),
                        });
                        const showsRes = await fetch(
                          "http://localhost:3001/api/saved-shows",
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        const data = await showsRes.json();
                        setMyShows(data.shows || []);
                        setEditShowModal(null);
                      }
                    }}
                  >
                    Finished
                  </button>
                  <button
                    type="button"
                    className="profile__cancel-btn"
                    style={{ background: "#4fc3f7", color: "#fff", flex: 1 }}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (editShowModal.isMovie) {
                        await fetch("http://localhost:3001/api/save-movie", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            movieId: editShowModal.movieId,
                            status: "watch_later",
                          }),
                        });
                        const moviesRes = await fetch(
                          "http://localhost:3001/api/saved-movies",
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        const data = await moviesRes.json();
                        setMyMovies(data.movies || []);
                        setEditShowModal(null);
                      } else {
                        await fetch("http://localhost:3001/api/save-show", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            showId: editShowModal.showId,
                            status: "watch_later",
                          }),
                        });
                        const showsRes = await fetch(
                          "http://localhost:3001/api/saved-shows",
                          {
                            method: "GET",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        const data = await showsRes.json();
                        setMyShows(data.shows || []);
                        setEditShowModal(null);
                      }
                    }}
                  >
                    Watch Later
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="profile__cancel-btn"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  if (editShowModal.isMovie) {
                    await fetch("http://localhost:3001/api/delete-movie", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ movieId: editShowModal.movieId }),
                    });
                    // Refresh saved movies
                    const res = await fetch(
                      "http://localhost:3001/api/saved-movies",
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    const data = await res.json();
                    setMyMovies(data.movies || []);
                  } else {
                    await fetch("http://localhost:3001/api/delete-show", {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ showId: editShowModal.showId }),
                    });
                    // Refresh saved shows
                    const res = await fetch(
                      "http://localhost:3001/api/saved-shows",
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    const data = await res.json();
                    setMyShows(data.shows || []);
                  }
                  setEditShowModal(null);
                }}
              >
                {editShowModal.isMovie ? "Delete Movie" : "Delete Show"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
