const mongoose = require("mongoose");

const ShowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showId: { type: String, required: true },
  name: String,
  image: Object,
  start_date: String,
  season: String,
  episode: String,
  genres: [String],
  rating: Object,
});

// Ensure only one show per user per showId
ShowSchema.index({ userId: 1, showId: 1 }, { unique: true });

module.exports = mongoose.model("Show", ShowSchema);
