const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/movies");

// Save a movie for the logged-in user
router.post("/save-movie", moviesController.saveMovie);

// Get all saved movies for the logged-in user
router.get("/saved-movies", moviesController.getSavedMovies);

// Delete a saved movie for the logged-in user
router.delete("/delete-movie", moviesController.deleteMovie);

module.exports = router;
