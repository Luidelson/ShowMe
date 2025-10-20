const express = require("express");
const router = express.Router();
const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const Show = require("../models/show");
const Movie = require("../models/movie");
const Recommendation = require("../models/recommendation");

// Cancel (delete) a sent friend request
router.post("/friends/cancel-request", auth, async (req, res) => {
  const fromUserId = req.user.id;
  const { toUserId } = req.body;
  if (!fromUserId || !toUserId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }
  try {
    const request = await FriendRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ error: "No pending request found" });
    }
    await request.deleteOne();
    return res.json({ message: "Friend request cancelled" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to cancel request" });
  }
});

// Remove a friend from the user's friends list
router.delete("/friends/:friendId", auth, async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.params;
  if (!userId || !friendId) {
    return res.status(400).json({ error: "Missing user or friend ID" });
  }
  try {
    // Remove friendId from user's friends
    await User.updateOne({ _id: userId }, { $pull: { friends: friendId } });
    // Remove userId from friend's friends
    await User.updateOne({ _id: friendId }, { $pull: { friends: userId } });
    res.json({ success: true, message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove friend" });
  }
});
// Get a friend's shows and movies
router.get("/friends/:friendId/media", auth, async (req, res) => {
  const { friendId } = req.params;
  try {
    const shows = await Show.find({ userId: friendId });
    const movies = await Movie.find({ userId: friendId });
    res.json({ shows, movies });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch friend's media" });
  }
});
// Accept a friend request
router.post("/friends/accept", auth, async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: "Missing requestId" });
  try {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res
        .status(404)
        .json({ error: "Request not found or already handled" });
    }
    request.status = "accepted";
    await request.save();
    // Add each user to the other's friends list
    await User.updateOne(
      { _id: request.from },
      { $addToSet: { friends: request.to } }
    );
    await User.updateOne(
      { _id: request.to },
      { $addToSet: { friends: request.from } }
    );
    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept request" });
  }
});

// Reject (delete) a friend request
router.post("/friends/reject", auth, async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: "Missing requestId" });
  try {
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res
        .status(404)
        .json({ error: "Request not found or already handled" });
    }
    request.status = "rejected";
    await request.save();
    res.json({ message: "Friend request rejected" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject request" });
  }
});
// Send a friend request
router.post("/friends/request", auth, async (req, res) => {
  const { toUserId } = req.body;
  const fromUserId = req.user?.id || req.body.fromUserId; // fallback for testing
  if (!toUserId || !fromUserId) {
    return res.status(400).json({ error: "Missing user IDs" });
  }
  try {
    // Prevent duplicate requests
    const existing = await FriendRequest.findOne({
      from: fromUserId,
      to: toUserId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({ error: "Request already sent" });
    }
    const request = new FriendRequest({ from: fromUserId, to: toUserId });
    await request.save();
    return res.json({ message: "Friend request sent!" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send request" });
  }
});

// Get incoming friend requests for a user
router.get("/friends/requests", auth, async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  try {
    const requests = await FriendRequest.find({
      to: userId,
      status: "pending",
    }).populate("from", "username email avatarUrl");
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});
// Mock: Return empty friends array for testing empty state
router.get("/friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "username email avatarUrl _id"
    );
    res.json({ friends: user.friends || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch friends list" });
  }
});

// Recommend a show/movie to a friend
router.post("/friends/:friendId/recommend", auth, async (req, res) => {
  const fromUserId = req.user.id;
  const { friendId } = req.params;
  const { showId, showName, movieId, movieName, image, note } = req.body;

  // Must have either show or movie data
  if (!fromUserId || !friendId || (!showId && !movieId)) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    // Optionally verify friendId is actually a friend; allow recommending anyway for MVP
    const rec = new Recommendation({
      from: fromUserId,
      to: friendId,
      showId,
      showName,
      movieId,
      movieName,
      image,
      note,
    });
    await rec.save();
    res.json({ success: true, recommendation: rec });
  } catch (err) {
    res.status(500).json({ error: "Failed to create recommendation" });
  }
});

// Get incoming recommendations for logged in user
router.get("/recommendations/incoming", auth, async (req, res) => {
  try {
    const recs = await Recommendation.find({ to: req.user.id })
      .populate("from", "username avatarUrl _id")
      .sort({ createdAt: -1 });
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Mark a recommendation as read
router.post("/recommendations/:id/read", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const rec = await Recommendation.findById(id);
    if (!rec) return res.status(404).json({ error: "Not found" });
    if (rec.to.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });
    rec.read = true;
    await rec.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// Delete a recommendation (ignore)
router.delete("/recommendations/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const rec = await Recommendation.findById(id);
    if (!rec) return res.status(404).json({ error: "Not found" });
    if (rec.to.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });
    await rec.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recommendation" });
  }
});

module.exports = router;
