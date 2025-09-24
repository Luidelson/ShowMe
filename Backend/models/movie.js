const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movieId: { type: String, required: true },
  name: { type: String },
  image: { type: Object },
  release_date: { type: String },
  genres: { type: Array },
  rating: { type: Object },
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
});

MovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model("Movie", MovieSchema);
