import React, { useState } from 'react';
import './Profile.css';

function Profile({ user, onLogout }) {
  const [editShowModal, setEditShowModal] = useState(null);
  const [editSeason, setEditSeason] = useState('');
  const [editEpisode, setEditEpisode] = useState('');

  // Show progress is now stored in backend per user, so no localStorage usage.
  const [myShows, setMyShows] = useState([]);

  // Fetch saved shows from backend on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('https://api.showme.jumpingcrab.com/api/saved-shows', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
  }, []);
  const [showEdit, setShowEdit] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayAvatar, setDisplayAvatar] = useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(
          'https://api.showme.jumpingcrab.com/api/profile',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setDisplayName(data.username || '');
          setDisplayAvatar(data.avatarUrl || '');
          setUsername(data.username || '');
          setAvatarUrl(data.avatarUrl || '');
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        'https://api.showme.jumpingcrab.com/api/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, avatarUrl }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setDisplayName(data.user.username);
        setDisplayAvatar(data.user.avatarUrl);
        if (user) {
          user.username = data.user.username;
          user.avatarUrl = data.user.avatarUrl;
        }
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      alert('Network error');
    }
    setShowEdit(false);
  };

  // Close any open profile-related modal with Escape
  React.useEffect(() => {
    if (!showEdit && !editShowModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editShowModal) setEditShowModal(null);
        if (showEdit) setShowEdit(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEdit, editShowModal]);

  return (
    <div className="profile">
      <aside className="profile__sidebar" aria-labelledby="profile-heading">
        <div className="profile__header">
          {displayAvatar && (
            <img
              src={displayAvatar}
              alt="Profile"
              className="profile__avatar"
            />
          )}
          <h1 id="profile-heading" className="profile__name">
            {displayName || 'Profile Name'}
          </h1>
        </div>
        {/* Edit Profile button above Sign Out button */}
        <button className="profile__edit-btn" onClick={() => setShowEdit(true)}>
          Edit Profile
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
      <main className="profile__main" aria-labelledby="my-shows-heading">
        <h2 className="profile__myshows-heading" id="my-shows-heading">
          My Shows
        </h2>
        <section className="profile__shows-grid" aria-label="Saved shows list">
          {myShows.length === 0 && <p>No shows added yet.</p>}
          {myShows.map((show) => {
            // Use TVmaze image if available, fallback to placeholder
            const imageSrc =
              show.image && show.image.medium
                ? show.image.medium
                : show.image && show.image.original
                  ? show.image.original
                  : show.image_thumbnail_path
                    ? show.image_thumbnail_path
                    : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png';
            return (
              <article
                className="profile__card"
                aria-labelledby={`show-title-${show.showId}`}
                key={show.showId}
                onClick={() => {
                  setEditShowModal(show);
                  setEditSeason(show.season || '');
                  setEditEpisode(show.episode || '');
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
                  <p className="profile__meta">Season: {show.season || '-'}</p>
                  <p className="profile__meta">
                    Episode: {show.episode || '-'}
                  </p>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      {/* Show Edit Modal */}
      {editShowModal && (
        <div
          className="profile__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-show-title"
        >
          <div className="profile__modal" role="document">
            {editShowModal.image_thumbnail_path && (
              <img
                src={editShowModal.image_thumbnail_path}
                alt={editShowModal.name}
                className="profile__edit-image"
              />
            )}
            <button
              className="profile__modal-close"
              aria-label="Close"
              onClick={() => setEditShowModal(null)}
            >
              &times;
            </button>
            <h3 id="edit-show-title">Edit Show Progress</h3>
            <div style={{ marginBottom: 12 }}>
              <b>{editShowModal.name}</b>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                try {
                  const response = await fetch(
                    'https://api.showme.jumpingcrab.com/api/save-show',
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        showId: editShowModal.showId,
                        name: editShowModal.name,
                        image: editShowModal.image,
                        start_date: editShowModal.start_date,
                        season: editSeason,
                        episode: editEpisode,
                        genres: editShowModal.genres,
                        rating: editShowModal.rating,
                      }),
                    }
                  );
                  const result = await response.json();
                  if (!response.ok) {
                    alert(
                      result.error ||
                        `Failed to save show (status ${response.status})`
                    );
                    return;
                  }
                  // Refresh saved shows only if save succeeded
                  const res = await fetch(
                    'https://api.showme.jumpingcrab.com/api/saved-shows',
                    {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const data = await res.json();
                  setMyShows(data.shows || []);
                  setEditShowModal(null);
                } catch (err) {
                  alert('Network error while saving show');
                }
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
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
              <button
                type="button"
                className="profile__cancel-btn"
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  await fetch(
                    'https://api.showme.jumpingcrab.com/api/delete-show',
                    {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ showId: editShowModal.showId }),
                    }
                  );
                  // Refresh saved shows
                  const res = await fetch(
                    'https://api.showme.jumpingcrab.com/api/saved-shows',
                    {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const data = await res.json();
                  setMyShows(data.shows || []);
                  setEditShowModal(null);
                }}
              >
                Delete Show
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
