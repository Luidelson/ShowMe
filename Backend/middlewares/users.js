const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Malformed token" });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = { id: user.userId, email: user.email };
    next();
  });
}

module.exports = { authenticateToken };
