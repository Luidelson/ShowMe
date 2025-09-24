const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { getCachedTvmazeShows } = require("../utils/tvmazeCache");

// Endpoint to get merged shows from both APIs (up to 7000 pages from new API)
// Efficient merged shows endpoint with pagination, search, genre
router.get("/all-shows-merged-7000", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 50;
    const search = (req.query.search || "").toLowerCase();
    const genre = req.query.genre || "";

    // Use cached TVmaze shows (all pages, refreshed hourly)
    let tvmazeShows = await getCachedTvmazeShows(fetch);

    // Fetch all DB shows (for now, not paginated)
    const showsController = require("../controllers/shows");
    let dbShows = [];
    try {
      await new Promise((resolve) => {
        showsController.getSavedShows(
          { headers: {} },
          {
            json: (data) => {
              dbShows = data.shows || [];
              resolve();
            },
            status: () => ({ json: () => resolve() }),
          }
        );
      });
    } catch (e) {}

    // Merge and dedupe by name (case-insensitive)
    let allShows = [...tvmazeShows, ...dbShows];
    if (search) {
      allShows = allShows.filter((show) =>
        (show.name || "").toLowerCase().includes(search)
      );
    }
    if (genre) {
      allShows = allShows.filter(
        (show) => show.genres && show.genres.includes(genre)
      );
    }
    // Deduplicate by name
    const seen = new Set();
    allShows = allShows.filter((show) => {
      const name = (show.name || "").toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
    // Pagination
    const total = allShows.length;
    const totalPages = Math.ceil(total / perPage);
    const paged = allShows.slice((page - 1) * perPage, page * perPage);
    res.json({ shows: paged, totalPages });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch merged shows." });
  }
});

// Endpoint to get up to 7000 pages from the new API (TVmaze)
router.get("/all-shows-7000", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  // Only allow up to 7000 pages for the new API
  if (page >= 7000) {
    return res.json({ shows: [] });
  }
  try {
    const response = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
    if (!response.ok) {
      console.error("TVmaze API error:", response.status, response.statusText);
      return res
        .status(502)
        .json({ error: `TVmaze API error: ${response.status}` });
    }
    const shows = await response.json();
    res.json({ shows });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch shows." });
  }
});

// Endpoint to get all Anime shows from TVmaze
router.get("/anime-shows", async (req, res) => {
  let page = 0;
  let animeShows = [];
  try {
    while (true) {
      const response = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
      const shows = await response.json();
      if (!Array.isArray(shows) || shows.length === 0) {
        break;
      }
      animeShows = animeShows.concat(
        shows.filter((show) => show.genres && show.genres.includes("Anime"))
      );
      page++;
    }
    res.json({ shows: animeShows });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch anime shows." });
  }
});

// Endpoint to get one page of shows from TVmaze
router.get("/all-shows", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  // Only allow up to 7000 pages for regular shows
  if (page >= 5000) {
    return res.json({ shows: [] });
  }
  try {
    const response = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
    if (!response.ok) {
      console.error("TVmaze API error:", response.status, response.statusText);
      return res
        .status(502)
        .json({ error: `TVmaze API error: ${response.status}` });
    }
    const shows = await response.json();
    res.json({ shows });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch shows." });
  }
});

// Endpoint to get max number of pages from TVmaze
router.get("/max-pages", async (req, res) => {
  // Always return 7000 pages for UI purposes
  res.json({ maxPages: 7000 });
});

const showsController = require("../controllers/shows");

// Save a show for the logged-in user
router.post("/save-show", showsController.saveShow);

// Get all saved shows for the logged-in user
router.get("/saved-shows", showsController.getSavedShows);

// Delete a saved show for the logged-in user
router.delete("/delete-show", showsController.deleteShow);

module.exports = router;
