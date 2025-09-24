const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

const TMDB_API_KEY = "53e41171efe3fcf9336b21d831621df6";
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// Fetch popular movies from TMDb
// Helper to fetch genre list from TMDb
let genreMap = null;
async function getGenreMap() {
  if (genreMap) return genreMap;
  const url = `${TMDB_API_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  const data = await res.json();
  genreMap = {};
  (data.genres || []).forEach((g) => {
    genreMap[g.id] = g.name;
  });
  return genreMap;
}

// Fetch popular movies from TMDb
router.get("/all-movies", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const search = req.query.search || "";
    const genre = req.query.genre || "";
    const genreMap = await getGenreMap();

    // Calculate which TMDb pages to fetch
    // TMDb returns 20 per page, so fetch enough to fill perPage (e.g. 100 => 5 pages)
    const tmdbPagesNeeded = Math.ceil(perPage / 20);
    const startTmdbPage = (page - 1) * tmdbPagesNeeded + 1;
    const tmdbPageNumbers = Array.from(
      { length: tmdbPagesNeeded },
      (_, i) => startTmdbPage + i
    );

    let allResults = [];
    let totalResults = 0;
    let totalPages = 1;
    for (const tmdbPage of tmdbPageNumbers) {
      let url = `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${tmdbPage}`;
      if (search) {
        url = `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(search)}&page=${tmdbPage}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.results) {
        allResults = allResults.concat(data.results);
        totalResults = data.total_results || totalResults;
        totalPages = data.total_pages || totalPages;
      }
    }

    // Deduplicate by movie ID
    const seen = new Set();
    let movies = allResults
      .filter((movie) => {
        if (seen.has(movie.id)) return false;
        seen.add(movie.id);
        return true;
      })
      .map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        genre_names: (movie.genre_ids || [])
          .map((gid) => genreMap[gid])
          .filter(Boolean),
      }));

    // Filter by genre if needed
    if (genre && genre !== "all") {
      movies = movies.filter((movie) => movie.genre_names.includes(genre));
    }

    // Paginate the merged results for the requested page
    const pagedMovies = movies.slice(0, perPage);
    const allGenres = Object.values(genreMap);
    res.json({
      movies: pagedMovies,
      totalResults,
      totalPages,
      genres: allGenres,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies." });
  }
});

module.exports = router;
