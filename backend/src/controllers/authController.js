const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const Notification = require("../models/Notification");

const registerValidators = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone").optional().isLength({ min: 10, max: 15 }).withMessage("Invalid phone number")
];

const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, referralCode } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already registered.");
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (referrer) {
      referredBy = referrer._id;
      referrer.referralTeamCount += 1;
      await referrer.save();
    }
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    phone,
    referredBy
  });

  await Notification.create({
    user: user._id,
    targetRole: "user",
    title: "Welcome to TrustVest",
    message:
      "Your account has been created successfully. Complete KYC before requesting withdrawals.",
    type: "security"
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode
    }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, user });
});

module.exports = {
  registerValidators,
  loginValidators,
  register,
  login,
  getProfile
};
