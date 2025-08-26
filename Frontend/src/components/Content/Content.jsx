import React, { useEffect, useState } from 'react';
import './Content.css';
import Preloader from '../Preloader/Preloader';

function Content() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalShow, setModalShow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('');
  const showsPerPage = 50;

  // Close modal on Escape key
  React.useEffect(() => {
    if (!modalShow) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalShow(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalShow]);

  // Helper to render stars from rating (out of 10)
  const renderStars = (rating) => {
    if (typeof rating !== 'number') return null;
    const stars = Math.round(rating / 2); // Convert 10 scale to 5 stars
    return (
      <span style={{ color: '#FFD700', fontSize: 18 }}>
        {'★'.repeat(stars)}
        {'☆'.repeat(5 - stars)}
      </span>
    );
  };

  // Placeholder for add show logic
  const handleAddShow = (show) => {
    // Save to localStorage for demo purposes
    const myShows = JSON.parse(localStorage.getItem('myShows') || '[]');
    if (!myShows.find((s) => s.id === show.id)) {
      myShows.push(show);
      localStorage.setItem('myShows', JSON.stringify(myShows));
      window.dispatchEvent(new Event('storage'));
      // No alert
    } else {
      // No alert
    }
  };

  // Fetch max page count on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/max-pages')
      .then((res) => res.json())
      .then((data) => {
        setTotalPages(data.maxPages);
      })
      .catch(() => {
        setTotalPages(1); // fallback
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/all-shows?page=${currentPage}`)
      .then((res) => res.json())
      .then((data) => {
        setShows(data.shows || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch shows.');
        setLoading(false);
      });
  }, [currentPage]);

  if (loading)
    return (
      <div className="content-wrapper">
        <Preloader />
      </div>
    );
  if (error) return <div className="content-wrapper">{error}</div>;

  return (
    <div className="content-wrapper">
      {/* Removed anime count display */}
      <input
        type="text"
        placeholder="Search shows..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      {/* Genre dropdown menu */}
      <div style={{ margin: '12px 0' }}>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #4fc3f7',
            fontWeight: 500,
            minWidth: 160,
            marginRight: 8,
          }}
        >
          <option value="">All Genres</option>
          {Array.from(new Set(shows.flatMap((show) => show.genres || []))).map(
            (genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            )
          )}
        </select>
        {selectedGenre && (
          <button
            onClick={() => setSelectedGenre('')}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #aaa',
              background: '#eee',
              color: '#333',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Clear
          </button>
        )}
      </div>
      <div className="shows-grid">
        {shows
          .filter(
            (show) =>
              show.name.toLowerCase().includes(search.toLowerCase()) &&
              (!selectedGenre ||
                (show.genres && show.genres.includes(selectedGenre)))
          )
          .map((show) => (
            <div
              className="show-card"
              key={show.id}
              onClick={() => setModalShow(show)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={
                  show.image && show.image.medium
                    ? show.image.medium
                    : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
                }
                alt={show.name}
                className="show-image-placeholder"
                style={{
                  width: '120px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  background: '#eee',
                }}
              />
              <div className="show-info">
                <div>{show.name}</div>
                <div>Premiered: {show.premiered}</div>
                {show.genres && show.genres.length > 0 && (
                  <div>Genre: {show.genres.join(', ')}</div>
                )}
                {show.rating && show.rating.average && (
                  <div>Rating: {renderStars(show.rating.average)}</div>
                )}
              </div>
            </div>
          ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0px 0',
          gap: 8,
          paddingBottom: 8,
        }}
      >
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        <span style={{ fontWeight: 500, margin: '0 12px' }}>
          Page {currentPage} of {totalPages || '...'}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
      {modalShow && (
        <div
          className="content-modal-overlay"
          onClick={() => setModalShow(null)}
          style={{ cursor: 'pointer' }}
        >
          <div className="content-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="content-modal-close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 36,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
              }}
              onClick={() => setModalShow(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={
                modalShow.image && modalShow.image.medium
                  ? modalShow.image.medium
                  : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
              }
              alt={modalShow.name}
              className="show-image-placeholder"
              style={{
                width: 180,
                height: 150,
                borderRadius: 8,
                marginBottom: 16,
              }}
            />
            <h2>{modalShow.name}</h2>
            <p>
              <strong>Premiered:</strong> {modalShow.premiered}
            </p>
            {modalShow.genres && modalShow.genres.length > 0 && (
              <p>
                <strong>Genre:</strong> {modalShow.genres.join(', ')}
              </p>
            )}
            {modalShow.rating && modalShow.rating.average && (
              <p>
                <strong>Rating:</strong> {renderStars(modalShow.rating.average)}
              </p>
            )}
            {modalShow.summary && (
              <div style={{ marginTop: 16 }}>
                <strong>Summary:</strong>
                <div
                  style={{
                    fontSize: 15,
                    color: '#444',
                    marginTop: 4,
                    maxHeight: 120,
                    overflowY: 'auto',
                    paddingRight: 4,
                  }}
                  dangerouslySetInnerHTML={{ __html: modalShow.summary }}
                />
              </div>
            )}
            <button
              className="add-show-btn"
              style={{
                marginTop: 24,
                background: '#4fc3f7',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '12px 24px',
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
              }}
              onClick={() => {
                handleAddShow(modalShow);
                setModalShow(null);
              }}
            >
              + Add Show
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Content;
