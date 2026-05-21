const mongoose = require("mongoose");
const { body, query } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const Investment = require("../models/Investment");
const DepositRequest = require("../models/DepositRequest");
const PaymentSettings = require("../models/PaymentSettings");

const transactionDecisionValidators = [
  body("status").isIn(["completed", "rejected"]).withMessage("Invalid status"),
  body("note").optional().trim().isLength({ max: 180 }).withMessage("Note is too long")
];

const depositDecisionValidators = [
  body("status").isIn(["approved", "rejected"]).withMessage("Invalid status"),
  body("note").optional().trim().isLength({ max: 180 }).withMessage("Note is too long")
];

const notificationValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("targetRole").optional().isIn(["user", "admin", "all"]).withMessage("Invalid role")
];

const paymentSettingsValidators = [
  body("upiId").optional().trim().isLength({ min: 5 }).withMessage("Valid UPI ID is required"),
  body("accountName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Account name must be between 2 and 80 characters"),
  body("bankName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Bank name must be between 2 and 80 characters"),
  body("accountNumberMasked")
    .optional()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Masked account number must be between 4 and 20 characters"),
  body("instructions")
    .optional()
    .trim()
    .isLength({ min: 4, max: 260 })
    .withMessage("Instructions must be between 4 and 260 characters"),
  body("depositsEnabled")
    .optional()
    .isBoolean()
    .withMessage("depositsEnabled must be true or false")
];

const kycDecisionValidators = [
  body("status").isIn(["verified", "rejected"]).withMessage("Invalid KYC status"),
  body("rejectionReason")
    .optional()
    .trim()
    .isLength({ min: 4 })
    .withMessage("Invalid rejection reason")
];

const depositListValidators = [
  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid deposit status filter")
];

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

const getAnalytics = asyncHandler(async (req, res) => {
  const [users, activeInvestments, pendingWithdrawals, pendingDeposits, volume] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Investment.countDocuments({ status: "active" }),
    Transaction.countDocuments({ type: "withdrawal", status: "pending" }),
    DepositRequest.countDocuments({ status: "pending" }),
    Transaction.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    analytics: {
      users,
      activeInvestments,
      pendingWithdrawals,
      pendingDeposits,
      volume
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, users });
});

const getPendingTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ status: "pending", type: { $ne: "deposit" } })
    .populate("user", "fullName email wallet.balance kyc.status")
    .sort({ createdAt: -1 });

  res.json({ success: true, transactions });
});

const getDepositRequests = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    filter.status = "pending";
  }

  const deposits = await DepositRequest.find(filter)
    .populate("user", "fullName email wallet.balance")
    .populate("reviewedBy", "fullName email")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ success: true, deposits });
});

const getPaymentSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreatePaymentSettings();
  res.json({ success: true, settings });
});

const updatePaymentSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreatePaymentSettings();
  const fields = [
    "upiId",
    "accountName",
    "bankName",
    "accountNumberMasked",
    "instructions",
    "depositsEnabled"
  ];

  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      settings[field] = req.body[field];
    }
  });
  settings.updatedBy = req.user._id;
  await settings.save();

  res.json({ success: true, message: "Payment settings updated.", settings });
});

const updatePaymentQr = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("QR image is required.");
  }

  const settings = await getOrCreatePaymentSettings();
  settings.qrImageUrl = `/uploads/payment-settings/${req.file.filename}`;
  settings.updatedBy = req.user._id;
  await settings.save();

  res.json({
    success: true,
    message: "QR image updated successfully.",
    qrImageUrl: settings.qrImageUrl
  });
});

const decideDepositRequest = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const deposit = await DepositRequest.findById(req.params.id);

  if (!deposit) {
    res.status(404);
    throw new Error("Deposit request not found.");
  }

  if (deposit.status !== "pending") {
    res.status(400);
    throw new Error("Only pending deposit requests can be reviewed.");
  }

  if (status === "rejected") {
    deposit.status = "rejected";
    deposit.reviewNote = note || "Deposit proof rejected by admin.";
    deposit.reviewedAt = new Date();
    deposit.reviewedBy = req.user._id;
    await deposit.save();

    await Notification.create({
      user: deposit.user,
      targetRole: "user",
      title: "Deposit rejected",
      message: deposit.reviewNote,
      type: "warning"
    });

    return res.json({
      success: true,
      message: "Deposit rejected successfully.",
      deposit
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(deposit.user).session(session);
    if (!user) {
      throw new Error("User not found for this deposit request.");
    }

    user.wallet.balance = Number((user.wallet.balance + deposit.amount).toFixed(2));
    user.wallet.totalDeposited = Number((user.wallet.totalDeposited + deposit.amount).toFixed(2));

    const transaction = new Transaction({
      user: user._id,
      type: "deposit",
      direction: "credit",
      amount: deposit.amount,
      status: "completed",
      reference: deposit.utr,
      note: "Manual UPI deposit approved",
      meta: {
        paymentMethod: "UPI QR",
        upiId: deposit.paymentSnapshot?.upiId || null,
        bankName: deposit.paymentSnapshot?.bankName || null,
        accountNumberMasked: deposit.paymentSnapshot?.accountNumberMasked || null
      }
    });
    await transaction.save({ session });

    deposit.status = "approved";
    deposit.reviewedAt = new Date();
    deposit.reviewedBy = req.user._id;
    deposit.reviewNote = note || "Deposit approved and credited.";
    deposit.creditedTransaction = transaction._id;

    await user.save({ session });
    await deposit.save({ session });
    await Notification.create(
      [
        {
          user: user._id,
          targetRole: "user",
          title: "Deposit approved",
          message: `Your deposit of INR ${deposit.amount} has been approved.`,
          type: "success"
        },
        {
          user: user._id,
          targetRole: "user",
          title: "Wallet credited successfully",
          message: `INR ${deposit.amount} has been credited to your wallet.`,
          type: "success"
        }
      ],
      { session, ordered: true }
    );

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Deposit approved and wallet credited.",
      deposit
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

const decideTransaction = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found.");
  }

  if (transaction.status !== "pending") {
    res.status(400);
    throw new Error("Only pending transactions can be updated.");
  }

  const user = await User.findById(transaction.user);
  transaction.status = status;
  transaction.note = note || transaction.note;

  if (status === "completed") {
    if (transaction.type === "deposit") {
      user.wallet.balance = Number((user.wallet.balance + transaction.amount).toFixed(2));
      user.wallet.totalDeposited = Number(
        (user.wallet.totalDeposited + transaction.amount).toFixed(2)
      );
    }

    if (transaction.type === "withdrawal") {
      if (user.wallet.balance < transaction.amount) {
        res.status(400);
        throw new Error("User balance is no longer sufficient.");
      }
      user.wallet.balance = Number((user.wallet.balance - transaction.amount).toFixed(2));
      user.wallet.totalWithdrawn = Number(
        (user.wallet.totalWithdrawn + transaction.amount).toFixed(2)
      );
    }
  }

  await Promise.all([
    transaction.save(),
    user.save(),
    Notification.create({
      user: user._id,
      targetRole: "user",
      title: `${transaction.type} ${status}`,
      message: `Your ${transaction.type} request has been ${status}.`,
      type: status === "completed" ? "success" : "warning"
    })
  ]);

  res.json({
    success: true,
    message: "Transaction updated successfully.",
    transaction
  });
});

const reviewKyc = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.kyc.status = status;
  user.kyc.reviewedAt = new Date();
  user.kyc.rejectionReason = status === "rejected" ? rejectionReason || "KYC rejected" : null;
  await user.save();

  await Notification.create({
    user: user._id,
    targetRole: "user",
    title: `KYC ${status}`,
    message:
      status === "verified"
        ? "Your KYC is verified. Withdrawals are now enabled."
        : `Your KYC was rejected. ${user.kyc.rejectionReason}`,
    type: status === "verified" ? "success" : "warning"
  });

  res.json({ success: true, message: "KYC status updated.", kyc: user.kyc });
});

const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, type = "info", targetRole = "all", userId = null } = req.body;

  const notification = await Notification.create({
    user: userId || null,
    title,
    message,
    type,
    targetRole
  });

  res.status(201).json({ success: true, notification });
});

module.exports = {
  transactionDecisionValidators,
  depositDecisionValidators,
  notificationValidators,
  paymentSettingsValidators,
  kycDecisionValidators,
  depositListValidators,
  getAnalytics,
  getUsers,
  getPendingTransactions,
  getDepositRequests,
  getPaymentSettings,
  updatePaymentSettings,
  updatePaymentQr,
  decideDepositRequest,
  decideTransaction,
  reviewKyc,
  sendNotification
};
