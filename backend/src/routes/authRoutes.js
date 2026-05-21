const express = require("express");
const { validateRequest } = require("../middleware/validate");
const { protect } = require("../middleware/authMiddleware");
const {
  registerValidators,
  loginValidators,
  register,
  login,
  getProfile
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidators, validateRequest, register);
router.post("/login", loginValidators, validateRequest, login);
router.get("/me", protect, getProfile);

module.exports = router;
