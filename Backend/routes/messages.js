const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const { authenticateToken } = require("../middlewares/users");

// Get all messages between current user and friend
router.get("/:friendId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const friendId = req.params.friendId;
  try {
    const messages = await Message.find({
      $or: [
        { from: userId, to: friendId },
        { from: friendId, to: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    messages.forEach((msg) => {
      msg.from = String(msg.from);
      msg.to = String(msg.to);
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a friend
router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { to, text } = req.body;
  if (!to || !text) return res.status(400).json({ error: "Missing fields" });
  try {
    const message = new Message({ from: userId, to, text });
    await message.save();
    // Ensure returned message has string IDs
    const msgObj = message.toObject();
    msgObj.from = String(msgObj.from);
    msgObj.to = String(msgObj.to);
    res.json({ success: true, message: msgObj });
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
