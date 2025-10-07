const express = require("express");
const router = express.Router();
const FriendRequest = require("../models/friendRequest");
const User = require("../models/user");
const auth = require("../middlewares/auth");
const Show = require("../models/show");
const Movie = require("../models/movie");

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

module.exports = router;
