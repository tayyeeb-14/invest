const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { generateReferralCode } = require("../utils/referral");

const walletSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0, min: 0 },
    totalDeposited: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    referralEarnings: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const kycSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["not_submitted", "pending", "verified", "rejected"],
      default: "not_submitted"
    },
    documentType: { type: String, default: null },
    documentUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    wallet: { type: walletSchema, default: () => ({}) },
    totalInvestment: { type: Number, default: 0, min: 0 },
    currentLevel: { type: Number, min: 1, max: 5, default: 1 },
    maxLevelUnlocked: { type: Number, min: 1, max: 5, default: 1 },
    referralCode: { type: String, unique: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralTeamCount: { type: Number, default: 0, min: 0 },
    kyc: { type: kycSchema, default: () => ({}) }
  },
  { timestamps: true }
);

userSchema.pre("validate", function nextHook(next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode(this.fullName);
  }
  next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
