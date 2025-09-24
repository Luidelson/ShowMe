const Movie = require("../models/movie");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

// Save a movie for the logged-in user
exports.saveMovie = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const { movieId, name, image, release_date, genres, rating, status } =
      req.body;
    if (!movieId) return res.status(400).json({ error: "Missing movieId." });
    // Upsert: update if exists, create if not
    const movie = await Movie.findOneAndUpdate(
      { userId, movieId },
      {
        $set: {
          name,
          image,
          release_date,
          genres,
          rating,
          status,
        },
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Movie saved/updated.", movie });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Get all saved movies for the logged-in user
exports.getSavedMovies = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const movies = await Movie.find({ userId });
    res.json({ movies });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Remove a saved movie for the logged-in user
exports.deleteMovie = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const { movieId } = req.body;
    if (!movieId) return res.status(400).json({ error: "Missing movieId." });
    await Movie.findOneAndDelete({ userId, movieId });
    res.json({ message: "Movie removed." });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};
