const express = require("express");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("./models/user");
const showsApi = require("./routes/showsApi");
const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://www.showme.jumpingcrab.com"],
    credentials: true,
  })
);
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/finalproject");

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Registration (auto-login)
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });
    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(201).json({ token, user: { email: user.email, id: user._id } });
  } catch (err) {
    res.status(500).json({ message: "Registration failed." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required." });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials." });
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});

// Example protected route
app.get("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
});

// Update profile
app.put("/api/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided." });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username, avatarUrl } = req.body;
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (username !== undefined) user.username = username;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();
    res.json({
      message: "Profile updated.",
      user: {
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        id: user._id,
      },
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
});

app.use("/api", showsApi);

const PORT = process.env.PORT || 3001;
// GET /items returns an empty array
app.get("/items", (req, res) => {
  res.json([]);
});

// POST /items returns an authorization error
app.post("/items", (req, res) => {
  res.status(401).json({ error: "Authorization required" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
