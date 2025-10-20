const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  showId: { type: String },
  showName: { type: String },
  image: Object,
  note: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recommendation", RecommendationSchema);
