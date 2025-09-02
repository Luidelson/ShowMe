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

  return (
    <div className="profile-wrapper">
      <aside className="profile-sidebar">
        <div className="profile-header-row">
          {displayAvatar && (
            <img src={displayAvatar} alt="Profile" className="profile-avatar" />
          )}
          <div className="profile-name">{displayName || 'Profile Name'}</div>
        </div>
        {/* Edit Profile button above Sign Out button */}
        <button className="profile-edit-btn" onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        <br></br>
        <button className="profile-signout-btn" onClick={onLogout}>
          Sign Out
        </button>
        {/* Modal for editing profile */}
        {showEdit && (
          <div className="profile-edit-overlay">
            <div className="profile-edit-modal">
              <form onSubmit={handleEditSubmit} className="profile-edit-form">
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
                <button type="submit" className="profile-save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </aside>
      <main className="profile-main">
        <h2 className="profile-myshows-heading">My Shows</h2>
        <div className="shows-grid">
          {myShows.length === 0 && <div>No shows added yet.</div>}
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
              <div
                className="show-card"
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
                  className="show-image-placeholder profile-show-image"
                  loading="lazy"
                />
                <div className="show-info">
                  <div>{show.name}</div>
                  <div>Start: {show.start_date}</div>
                  <div>Season: {show.season || '-'}</div>
                  <div>Episode: {show.episode || '-'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {/* Show Edit Modal */}
      {editShowModal && (
        <div className="profile-edit-overlay">
          <div className="profile-edit-modal">
            {editShowModal.image_thumbnail_path && (
              <img
                src={editShowModal.image_thumbnail_path}
                alt={editShowModal.name}
                className="profile-edit-image"
              />
            )}
            <button
              className="profile-edit-close"
              aria-label="Close"
              onClick={() => setEditShowModal(null)}
            >
              &times;
            </button>
            <h3>Edit Show Progress</h3>
            <div style={{ marginBottom: 12 }}>
              <b>{editShowModal.name}</b>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                await fetch(
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
              <button type="submit" className="profile-save-btn">
                Save
              </button>
              <button
                type="button"
                className="profile-cancel-btn"
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
