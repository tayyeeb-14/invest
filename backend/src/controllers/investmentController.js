const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const InvestmentPlan = require("../models/InvestmentPlan");
const Investment = require("../models/Investment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const {
  MIN_START_INVESTMENT,
  getLevelFromInvestment,
  LEVEL_THRESHOLDS,
  MAX_LEVEL
} = require("../constants/levels");

const investValidators = [
  body("planId").notEmpty().withMessage("Plan ID is required"),
  body("amount")
    .isFloat({ min: MIN_START_INVESTMENT })
    .withMessage(`Minimum investment is ₹${MIN_START_INVESTMENT}`)
];

const getPlans = asyncHandler(async (req, res) => {
  const plans = await InvestmentPlan.find({ isActive: true }).sort({ minAmount: 1 });
  res.json({ success: true, plans });
});

const getMyInvestments = asyncHandler(async (req, res) => {
  const investments = await Investment.find({ user: req.user._id })
    .populate("plan", "name dailyPercent durationDays")
    .sort({ createdAt: -1 });

  res.json({ success: true, investments });
});

const createInvestment = asyncHandler(async (req, res) => {
  const { planId, amount } = req.body;
  const numericAmount = Number(amount);

  const user = await User.findById(req.user._id);
  const plan = await InvestmentPlan.findById(planId);

  if (!plan || !plan.isActive) {
    res.status(404);
    throw new Error("Investment plan is unavailable.");
  }

  if (user.wallet.balance < numericAmount) {
    res.status(400);
    throw new Error("Insufficient wallet balance.");
  }

  if (numericAmount < plan.minAmount || numericAmount > plan.maxAmount) {
    res.status(400);
    throw new Error(`Amount must be between ₹${plan.minAmount} and ₹${plan.maxAmount}.`);
  }

  if (user.maxLevelUnlocked < plan.levelRequired) {
    res.status(403);
    throw new Error(`This plan requires level ${plan.levelRequired}.`);
  }

  const investment = await Investment.create({
    user: user._id,
    plan: plan._id,
    amount: numericAmount,
    levelAtPurchase: user.maxLevelUnlocked,
    dailyPercent: plan.dailyPercent,
    durationDays: plan.durationDays
  });

  user.wallet.balance = Number((user.wallet.balance - numericAmount).toFixed(2));
  user.totalInvestment = Number((user.totalInvestment + numericAmount).toFixed(2));
  user.currentLevel = getLevelFromInvestment(user.totalInvestment);
  user.maxLevelUnlocked = Math.min(user.currentLevel, MAX_LEVEL);
  await user.save();

  await Transaction.create({
    user: user._id,
    type: "investment",
    direction: "debit",
    amount: numericAmount,
    status: "completed",
    note: `Investment in ${plan.name}`
  });

  if (user.referredBy) {
    const referrer = await User.findById(user.referredBy);
    if (referrer) {
      const referralBonus = Number((numericAmount * 0.05).toFixed(2));
      referrer.wallet.balance = Number((referrer.wallet.balance + referralBonus).toFixed(2));
      referrer.wallet.referralEarnings = Number(
        (referrer.wallet.referralEarnings + referralBonus).toFixed(2)
      );
      referrer.wallet.totalEarnings = Number(
        (referrer.wallet.totalEarnings + referralBonus).toFixed(2)
      );
      await referrer.save();

      await Transaction.create({
        user: referrer._id,
        type: "referral",
        direction: "credit",
        amount: referralBonus,
        status: "completed",
        note: `Referral income from ${user.fullName}`
      });

      await Notification.create({
        user: referrer._id,
        targetRole: "user",
        title: "Referral income received",
        message: `You earned ₹${referralBonus} referral income from your team.`,
        type: "success"
      });
    }
  }

  res.status(201).json({
    success: true,
    message: "Investment activated successfully.",
    investment
  });
});

const calculateProfit = asyncHandler(async (req, res) => {
  const amount = Number(req.query.amount || 0);
  const dailyPercent = Number(req.query.dailyPercent || 0);
  const days = Number(req.query.days || 30);

  if (!amount || amount < MIN_START_INVESTMENT || dailyPercent <= 0 || dailyPercent > 60) {
    res.status(400);
    throw new Error("Invalid calculator input.");
  }

  const estimatedDaily = Number(((amount * dailyPercent) / 100).toFixed(2));
  const estimatedTotal = Number((estimatedDaily * days).toFixed(2));

  res.json({
    success: true,
    simulation: {
      amount,
      dailyPercent,
      days,
      estimatedDaily,
      estimatedTotal
    }
  });
});

const getLevelStructure = (req, res) => {
  res.json({
    success: true,
    minimumStartInvestment: MIN_START_INVESTMENT,
    levels: LEVEL_THRESHOLDS.map((threshold, index) => ({
      level: index + 1,
      unlockAmount: threshold
    }))
  });
};

module.exports = {
  investValidators,
  getPlans,
  getMyInvestments,
  createInvestment,
  calculateProfit,
  getLevelStructure
};
