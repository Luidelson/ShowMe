const express = require("express");
const router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
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
