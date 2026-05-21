const mongoose = require("mongoose");

const paymentSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "default", unique: true, immutable: true },
    upiId: { type: String, required: true, trim: true, default: "trustvest@upi" },
    accountName: { type: String, required: true, trim: true, default: "TrustVest Financial" },
    bankName: { type: String, trim: true, default: "TrustVest Banking Partner" },
    accountNumberMasked: { type: String, trim: true, default: "XXXXXX1028" },
    qrImageUrl: { type: String, default: null },
    instructions: {
      type: String,
      trim: true,
      default: "Pay using UPI and upload screenshot with valid UTR for manual verification."
    },
    depositsEnabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema);
