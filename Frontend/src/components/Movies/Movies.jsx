// Save movie to backend for logged-in user
const handleAddMovie = async (movie) => {
  const token = localStorage.getItem("token");
  if (!token) return;
  await fetch("http://localhost:3001/api/save-movie", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      movieId: movie.id,
      name: movie.title,
      image: {
        medium: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : null,
      },
      release_date: movie.release_date,
      genres: movie.genre_names,
      rating: { average: movie.vote_average },
    }),
  });
  // Optionally, show a message or refresh saved movies in Profile
};

import React, { useState, useEffect, useRef } from "react";
import "../Content/Content.css";
import Preloader from "../Preloader/Preloader";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMovie, setModalMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 100;
  const [totalResults, setTotalResults] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const debounceTimeout = useRef();

  // Debounce search input (must be at top level, not inside another useEffect)
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Build query params for search and genre
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedGenre && selectedGenre !== "all")
      params.append("genre", selectedGenre);
    params.append("page", currentPage);
    params.append("perPage", moviesPerPage);

    fetch(`http://localhost:3001/api/all-movies?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        // data.movies: array of TMDb movie objects, data.totalResults, data.genres
        setMovies(Array.isArray(data.movies) ? data.movies : []);
        setTotalResults(data.totalResults || 0);
        setGenres(["all", ...(data.genres || [])]);
      })
      .catch(() => {
        setError("Error loading movies. Try again later.");
        setMovies([]);
        setTotalResults(0);
      })
      .finally(() => setLoading(false));
  }, [currentPage, debouncedSearch, selectedGenre]);

  // Helper to render stars from rating (out of 10)
  const renderStars = (rating) => {
    if (typeof rating !== "number") return null;
    const stars = Math.round(rating / 2); // Convert 10 scale to 5 stars
    return (
      <span style={{ color: "#FFD700", fontSize: 18 }}>
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </span>
    );
  };

  if (loading)
    return (
      <div className="content">
        <Preloader />
      </div>
    );
  if (error) return <div className="content">{error}</div>;

  const totalPages = Math.ceil(totalResults / moviesPerPage) || 1;
  const pagedMovies = movies;

  return (
    <div className="content" role="main">
      <form
        className="content__controls"
        role="search"
        aria-label="Movie search form"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="movie-search" className="visually-hidden">
          Search movies
        </label>
        <input
          id="movie-search"
          type="text"
          placeholder="Search movies..."
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
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setCurrentPage(1);
          }}
          className="content__genre-dropdown"
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre === "all" ? "All genres" : genre}
            </option>
          ))}
        </select>
        <div style={{ paddingBottom: 16 }} />
        {selectedGenre && selectedGenre !== "all" && (
          <button
            type="button"
            onClick={() => setSelectedGenre("all")}
            className="content__genre-clear-btn"
            aria-label="Clear selected genre"
          >
            Clear
          </button>
        )}
      </form>
      <section className="content__grid" aria-label="Movies list">
        {pagedMovies.map((movie) => (
          <article
            className="content__card"
            key={movie.id}
            onClick={() => setModalMovie(movie)}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${movie.title}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setModalMovie(movie);
              }
            }}
          >
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={movie.title}
              className="content__image"
              style={{ background: "#eee", objectFit: "cover" }}
            />
            <div
              className="content__info"
              role="group"
              aria-label={`${movie.title} info`}
            >
              <h3 className="content__title">{movie.title}</h3>
              <p className="content__meta">
                Year:{" "}
                {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
              </p>
              {movie.vote_average && (
                <p className="content__meta">
                  Rating: {renderStars(movie.vote_average)}
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
          Page {currentPage} of {totalPages || "..."}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="content__pagination-btn content__pagination-btn--next"
        >
          Next
        </button>
      </nav>
      {modalMovie && (
        <div
          className="content__modal-overlay"
          onClick={() => setModalMovie(null)}
          style={{ cursor: "pointer" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-modal-title"
        >
          <div className="content__modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="content__modal-close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 36,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#888",
              }}
              onClick={() => setModalMovie(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={
                modalMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${modalMovie.poster_path}`
                  : "https://via.placeholder.com/300x450?text=No+Image"
              }
              alt={modalMovie.title}
              className="content__image content__image--modal"
            />
            <h2 id="movie-modal-title">{modalMovie.title}</h2>
            <p>
              <strong>Release Date:</strong> {modalMovie.release_date || "N/A"}
            </p>
            {modalMovie.genre_names && modalMovie.genre_names.length > 0 && (
              <p>
                <strong>Genre:</strong> {modalMovie.genre_names.join(", ")}
              </p>
            )}
            {modalMovie.vote_average && (
              <p>
                <strong>Rating:</strong> {renderStars(modalMovie.vote_average)}
              </p>
            )}
            {modalMovie.overview && (
              <div style={{ marginTop: 16 }}>
                <strong>Overview:</strong>
                <div
                  style={{
                    fontSize: 15,
                    color: "#444",
                    marginTop: 4,
                    maxHeight: 120,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {modalMovie.overview}
                </div>
              </div>
            )}
            {localStorage.getItem("token") && (
              <button
                className="content__add-show-btn"
                style={{
                  marginTop: 24,
                  background: "#4fc3f7",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "12px 24px",
                  fontWeight: 500,
                  fontSize: 16,
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleAddMovie(modalMovie);
                  setModalMovie(null);
                }}
              >
                + Add Movie
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Movies;
