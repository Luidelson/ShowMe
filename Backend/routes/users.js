const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Search users by username or email
router.get("/users/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ users: [] });
  try {
    // Case-insensitive partial match for username or email
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("username email avatarUrl _id");
    // Deduplicate by email and username (show only one user per unique email+username)
    const uniqueUsers = [];
    const seen = new Set();
    for (const user of users) {
      const key = user.email + "|" + user.username;
      if (!seen.has(key)) {
        uniqueUsers.push(user);
        seen.add(key);
      }
    }
    res.json({ users: uniqueUsers });
  } catch (err) {
    res.status(500).json({ error: "Search failed." });
  }
});

// Get public info for a user by id
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username email avatarUrl _id"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

module.exports = router;
