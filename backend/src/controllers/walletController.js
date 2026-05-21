const { body, query } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Investment = require("../models/Investment");
const Notification = require("../models/Notification");
const DepositRequest = require("../models/DepositRequest");
const PaymentSettings = require("../models/PaymentSettings");
const { getNextLevelThreshold } = require("../constants/levels");

const manualDepositValidators = [
  body("amount").isFloat({ min: 100 }).withMessage("Minimum deposit is INR 100"),
  body("utr")
    .trim()
    .matches(/^[a-zA-Z0-9-]{8,35}$/)
    .withMessage("UTR must be 8-35 characters and alphanumeric")
];

const withdrawValidators = [
  body("amount").isFloat({ min: 200 }).withMessage("Minimum withdrawal is INR 200"),
  body("upiId").optional().trim().isLength({ min: 5 }).withMessage("Invalid UPI ID"),
  body("bankName").optional().trim().isLength({ min: 2 }).withMessage("Bank name is invalid")
];

const transactionQueryValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be at least 1"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100")
];

const normalizeUtr = (utr) => (utr || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const getOrCreatePaymentSettings = async () => {
  let settings = await PaymentSettings.findOne({ singletonKey: "default" });
  if (!settings) {
    settings = await PaymentSettings.create({
      singletonKey: "default",
      upiId: "trustvest@upi",
      accountName: "TrustVest Financial Technologies",
      bankName: "National Commerce Bank",
      accountNumberMasked: "XXXXXX1028",
      depositsEnabled: true
    });
  }
  return settings;
};

const getWalletSummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const activeInvestments = await Investment.find({
    user: req.user._id,
    status: "active"
  }).sort({ createdAt: -1 });

  const recentTransactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(8);

  const unreadNotifications = await Notification.countDocuments({
    $or: [{ user: req.user._id }, { targetRole: "all" }, { targetRole: "user" }],
    isRead: false
  });

  const pendingDepositRequests = await DepositRequest.countDocuments({
    user: req.user._id,
    status: "pending"
  });

  const nextThreshold = getNextLevelThreshold(user.maxLevelUnlocked);
  const levelProgress = nextThreshold
    ? Math.min((user.totalInvestment / nextThreshold) * 100, 100)
    : 100;

  res.json({
    success: true,
    wallet: user.wallet,
    kycStatus: user.kyc?.status || "not_submitted",
    level: {
      current: user.currentLevel,
      unlocked: user.maxLevelUnlocked,
      nextThreshold,
      progressPercent: Number(levelProgress.toFixed(2))
    },
    totalInvestment: user.totalInvestment,
    referralCode: user.referralCode,
    referralTeamCount: user.referralTeamCount,
    activeInvestments,
    recentTransactions,
    unreadNotifications,
    pendingDepositRequests
  });
});

const getPaymentSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreatePaymentSettings();

  res.json({
    success: true,
    settings: {
      upiId: settings.upiId,
      accountName: settings.accountName,
      bankName: settings.bankName,
      accountNumberMasked: settings.accountNumberMasked,
      qrImageUrl: settings.qrImageUrl,
      instructions: settings.instructions,
      depositsEnabled: settings.depositsEnabled,
      updatedAt: settings.updatedAt
    }
  });
});

const createManualDepositRequest = asyncHandler(async (req, res) => {
  const { amount, utr } = req.body;
  const numericAmount = Number(amount);

  if (!req.file) {
    res.status(400);
    throw new Error("Payment screenshot is required.");
  }

  const settings = await getOrCreatePaymentSettings();
  if (!settings.depositsEnabled) {
    res.status(403);
    throw new Error("Deposits are temporarily disabled. Please try again later.");
  }

  const utrNormalized = normalizeUtr(utr);
  const existingUtr = await DepositRequest.findOne({ utrNormalized });
  if (existingUtr) {
    res.status(409);
    throw new Error("This UTR has already been submitted.");
  }

  const screenshotUrl = `/uploads/deposits/${req.file.filename}`;
  const depositRequest = await DepositRequest.create({
    user: req.user._id,
    amount: numericAmount,
    utr: utr.trim().toUpperCase(),
    utrNormalized,
    screenshotUrl,
    paymentSnapshot: {
      upiId: settings.upiId,
      accountName: settings.accountName,
      bankName: settings.bankName,
      accountNumberMasked: settings.accountNumberMasked,
      qrImageUrl: settings.qrImageUrl
    }
  });

  await Notification.create({
    user: req.user._id,
    targetRole: "user",
    title: "Deposit submitted",
    message: "Your UPI payment proof has been submitted and is pending manual verification.",
    type: "info"
  });

  res.status(201).json({
    success: true,
    message: "Deposit request submitted successfully.",
    depositRequest
  });
});

const getMyDepositRequests = asyncHandler(async (req, res) => {
  const requests = await DepositRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(25);

  res.json({ success: true, requests });
});

const createWithdrawalRequest = asyncHandler(async (req, res) => {
  const { amount, upiId, bankName } = req.body;
  const numericAmount = Number(amount);

  const user = await User.findById(req.user._id);
  if (user.wallet.balance < numericAmount) {
    res.status(400);
    throw new Error("Insufficient wallet balance for withdrawal.");
  }

  if (user.kyc.status !== "verified") {
    res.status(403);
    throw new Error("KYC must be verified before withdrawal.");
  }

  const transaction = await Transaction.create({
    user: req.user._id,
    type: "withdrawal",
    direction: "debit",
    amount: numericAmount,
    status: "pending",
    note: "Withdrawal request submitted",
    meta: {
      paymentMethod: upiId ? "UPI" : "BANK",
      upiId: upiId || null,
      bankName: bankName || null
    }
  });

  await Notification.create({
    user: req.user._id,
    targetRole: "user",
    title: "Withdrawal under review",
    message: "Withdrawal request submitted. Funds release after verification.",
    type: "warning"
  });

  res.status(201).json({
    success: true,
    message: "Withdrawal request submitted.",
    transaction
  });
});

const getTransactionHistory = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments({ user: req.user._id })
  ]);

  res.json({
    success: true,
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

module.exports = {
  manualDepositValidators,
  withdrawValidators,
  transactionQueryValidators,
  getWalletSummary,
  getPaymentSettings,
  createManualDepositRequest,
  getMyDepositRequests,
  createWithdrawalRequest,
  getTransactionHistory
};
