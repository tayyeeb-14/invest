const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 100 },
    utr: { type: String, required: true, trim: true },
    utrNormalized: { type: String, required: true, unique: true, index: true },
    screenshotUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNote: { type: String, default: null },
    creditedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null },
    paymentSnapshot: {
      upiId: { type: String, default: null },
      accountName: { type: String, default: null },
      bankName: { type: String, default: null },
      accountNumberMasked: { type: String, default: null },
      qrImageUrl: { type: String, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepositRequest", depositRequestSchema);
