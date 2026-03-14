const jwt = require('jsonwebtoken');

// A simple middleware to protect routes
const authMid = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Expects "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecret'); // Fallback secret for hackathon
    req.user = verified;
    next(); // Move to the actual route handler
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMid;
