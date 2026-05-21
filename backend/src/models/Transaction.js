const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["deposit", "withdrawal", "investment", "profit", "referral"]
    },
    direction: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "completed", "rejected"], default: "pending" },
    reference: { type: String, default: null },
    note: { type: String, default: null },
    meta: {
      paymentMethod: { type: String, default: null },
      upiId: { type: String, default: null },
      bankName: { type: String, default: null },
      accountNumberMasked: { type: String, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
