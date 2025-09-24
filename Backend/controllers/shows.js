const Show = require("../models/show");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

// Save a show for the logged-in user
exports.saveShow = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const {
      showId,
      name,
      image,
      start_date,
      season,
      episode,
      genres,
      rating,
      status,
      finished,
      watchLater,
    } = req.body;
    if (!showId) return res.status(400).json({ error: "Missing showId." });
    // Determine status from explicit status, or from finished/watchLater booleans for backward compatibility
    let newStatus = status;
    if (typeof newStatus === "undefined") {
      if (finished === true) newStatus = "finished";
      else if (watchLater === true) newStatus = "watch_later";
      else newStatus = null;
    }
    // Upsert: update if exists, create if not
    const show = await Show.findOneAndUpdate(
      { userId, showId },
      {
        $set: {
          name,
          image,
          start_date,
          season,
          episode,
          genres,
          rating,
          status: newStatus,
        },
      },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Show saved/updated.", show });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Get all saved shows for the logged-in user
exports.getSavedShows = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const shows = await Show.find({ userId });
    res.json({ shows });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Remove a saved show for the logged-in user
exports.deleteShow = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    const { showId } = req.body;
    if (!showId) return res.status(400).json({ error: "Missing showId." });
    await Show.deleteOne({ userId, showId });
    res.json({ message: "Show deleted." });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};
