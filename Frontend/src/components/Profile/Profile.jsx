import React, { useState } from 'react';
import './Profile.css';

function Profile({ user, onLogout }) {
  const [editShowModal, setEditShowModal] = useState(null);
  const [editSeason, setEditSeason] = useState('');
  const [editEpisode, setEditEpisode] = useState('');

  // Load season/episode info from localStorage for a show
  const getShowProgress = (showId) => {
    const progress = JSON.parse(localStorage.getItem('showProgress') || '{}');
    return progress[showId] || { season: '', episode: '' };
  };

  // Save season/episode info to localStorage for a show
  const saveShowProgress = (showId, season, episode) => {
    const progress = JSON.parse(localStorage.getItem('showProgress') || '{}');
    progress[showId] = { season, episode };
    localStorage.setItem('showProgress', JSON.stringify(progress));
  };
  const [myShows, setMyShows] = useState([]);

  // Load added shows from localStorage on mount
  React.useEffect(() => {
    const storedShows = localStorage.getItem('myShows');
    if (storedShows) {
      setMyShows(JSON.parse(storedShows));
    }
  }, []);

  // Listen for changes to localStorage (from Content.jsx)
  React.useEffect(() => {
    const onStorage = () => {
      const storedShows = localStorage.getItem('myShows');
      if (storedShows) {
        setMyShows(JSON.parse(storedShows));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
        const response = await fetch('http://localhost:3000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
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
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      alert('Network error');
    }
    setShowEdit(false);
  };

  return (
    <div
      className="profile-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      <aside
        className="profile-sidebar"
        style={{ width: 240, minWidth: 180, maxWidth: 280, flexShrink: 0 }}
      >
        <div className="profile-header-row">
          {displayAvatar && (
            <img
              src={displayAvatar}
              alt="Profile"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                marginRight: 12,
              }}
            />
          )}
          <div className="profile-name">{displayName || 'Profile Name'}</div>
        </div>
        {/* Edit Profile button above Sign Out button */}
        <button
          className="profile-edit-btn"
          onClick={() => setShowEdit(true)}
          style={{ marginBottom: 16 }}
        >
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
              <form
                onSubmit={handleEditSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
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
      <main
        className="profile-main"
        style={{
          flex: 1,
          padding: '32px 40px 32px 32px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2 style={{ marginBottom: 24 }}>My Shows</h2>
        <div className="shows-grid">
          {myShows.length === 0 && <div>No shows added yet.</div>}
          {myShows.map((show) => {
            const progress = getShowProgress(show.id);
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
                key={show.id}
                style={{
                  marginBottom: 18,
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setEditShowModal(show);
                  setEditSeason(progress.season);
                  setEditEpisode(progress.episode);
                }}
              >
                <img
                  src={imageSrc}
                  alt={show.name}
                  className="show-image-placeholder"
                  loading="lazy"
                  style={{
                    width: '180px',
                    height: '180px',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    background: '#eee',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                <div className="show-info">
                  <div>{show.name}</div>
                  <div>Start: {show.start_date}</div>
                  <div>Season: {progress.season || '-'}</div>
                  <div>Episode: {progress.episode || '-'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {/* Show Edit Modal */}
      {editShowModal && (
        <div className="profile-edit-overlay" style={{ zIndex: 1000 }}>
          <div
            className="profile-edit-modal"
            style={{ minWidth: 320, position: 'relative' }}
          >
            {editShowModal.image_thumbnail_path && (
              <img
                src={editShowModal.image_thumbnail_path}
                alt={editShowModal.name}
                style={{
                  width: '100%',
                  height: '180px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  background: '#eee',
                  display: 'block',
                  overflow: 'hidden',
                }}
              />
            )}
            <button
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                fontSize: 32,
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                zIndex: 10,
              }}
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
              onSubmit={(e) => {
                e.preventDefault();
                saveShowProgress(editShowModal.id, editSeason, editEpisode);
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
                onClick={() => {
                  // Remove show from localStorage
                  const myShows = JSON.parse(
                    localStorage.getItem('myShows') || '[]'
                  );
                  const updatedShows = myShows.filter(
                    (s) => s.id !== editShowModal.id
                  );
                  localStorage.setItem('myShows', JSON.stringify(updatedShows));
                  setMyShows(updatedShows);
                  // Remove progress for this show
                  const progress = JSON.parse(
                    localStorage.getItem('showProgress') || '{}'
                  );
                  delete progress[editShowModal.id];
                  localStorage.setItem(
                    'showProgress',
                    JSON.stringify(progress)
                  );
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
