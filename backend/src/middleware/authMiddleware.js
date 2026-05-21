const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Token missing.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error("User is invalid or inactive.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Invalid token.");
  }
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Admin access required.");
  }

  next();
};

module.exports = { protect, adminOnly };
