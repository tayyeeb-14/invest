const mongoose = require("mongoose");
const dayjs = require("dayjs");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "InvestmentPlan", required: true },
    amount: { type: Number, required: true, min: 300 },
    levelAtPurchase: { type: Number, required: true, min: 1, max: 5 },
    dailyPercent: { type: Number, required: true, min: 1, max: 60 },
    durationDays: { type: Number, required: true, min: 1, max: 365 },
    estimatedDailyIncome: { type: Number, required: true, min: 0 },
    estimatedTotalReturn: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date }
  },
  { timestamps: true }
);

investmentSchema.pre("validate", function fillComputed(next) {
  this.estimatedDailyIncome = Number(((this.amount * this.dailyPercent) / 100).toFixed(2));
  this.estimatedTotalReturn = Number((this.estimatedDailyIncome * this.durationDays).toFixed(2));
  this.endsAt = dayjs(this.startsAt || new Date())
    .add(this.durationDays, "day")
    .toDate();
  next();
});

module.exports = mongoose.model("Investment", investmentSchema);
