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

  // Save show to backend for logged-in user
  const handleAddShow = async (show) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch('https://api.showme.jumpingcrab.com/api/save-show', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        showId: show.id,
        name: show.name,
        image: show.image,
        start_date: show.premiered,
        genres: show.genres,
        rating: show.rating,
      }),
    });
    // Optionally, you can show a message or refresh saved shows in Profile
  };

  // Fetch max page count on mount
  useEffect(() => {
    fetch('https://api.showme.jumpingcrab.com/api/max-pages')
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
    fetch(
      `https://api.showme.jumpingcrab.com/api/all-shows?page=${currentPage}`
    )
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
      <div className="content">
        <Preloader />
      </div>
    );
  if (error) return <div className="content">{error}</div>;

  return (
    <div className="content" role="main">
      <form
        className="content__controls"
        role="search"
        aria-label="Show search form"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="show-search" className="visually-hidden">
          Search shows
        </label>
        <input
          id="show-search"
          type="text"
          placeholder="Search shows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="content__search"
        />
        <label htmlFor="genre-filter" className="visually-hidden">
          Filter by genre
        </label>
        <select
          id="genre-filter"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="content__genre-dropdown"
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
            type="button"
            onClick={() => setSelectedGenre('')}
            className="content__genre-clear-btn"
            aria-label="Clear selected genre"
          >
            Clear
          </button>
        )}
      </form>
      <section className="content__grid" aria-label="Shows list">
        {shows
          .filter(
            (show) =>
              show.name.toLowerCase().includes(search.toLowerCase()) &&
              (!selectedGenre ||
                (show.genres && show.genres.includes(selectedGenre)))
          )
          .map((show) => (
            <article
              className="content__card"
              key={show.id}
              onClick={() => setModalShow(show)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${show.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setModalShow(show);
                }
              }}
            >
              <img
                src={
                  show.image && show.image.medium
                    ? show.image.medium
                    : 'https://static.tvmaze.com/images/no-img/no-img-portrait-text.png'
                }
                alt={show.name}
                className="content__image"
              />
              <div
                className="content__info"
                role="group"
                aria-label={`${show.name} info`}
              >
                <h3 className="content__title">{show.name}</h3>
                <p className="content__meta">Premiered: {show.premiered}</p>
                {show.genres && show.genres.length > 0 && (
                  <p className="content__meta">
                    Genre: {show.genres.join(', ')}
                  </p>
                )}
                {show.rating && show.rating.average && (
                  <p className="content__meta">
                    Rating: {renderStars(show.rating.average)}
                  </p>
                )}
              </div>
            </article>
          ))}
      </section>
      <nav className="content__pagination" aria-label="Pagination navigation">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="content__pagination-btn content__pagination-btn--prev"
        >
          Previous
        </button>
        <span className="content__pagination-info">
          Page {currentPage} of {totalPages || '...'}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="content__pagination-btn content__pagination-btn--next"
        >
          Next
        </button>
      </nav>
      {modalShow && (
        <div
          className="content__modal-overlay"
          onClick={() => setModalShow(null)}
          style={{ cursor: 'pointer' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="show-modal-title"
        >
          <div className="content__modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="content__modal-close"
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
              className="content__image content__image--modal"
            />
            <h2 id="show-modal-title">{modalShow.name}</h2>
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
            {localStorage.getItem('token') && (
              <button
                className="content__add-show-btn"
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Content;
