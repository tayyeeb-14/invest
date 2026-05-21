const mongoose = require("mongoose");

const investmentPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    minAmount: { type: Number, required: true, min: 300 },
    maxAmount: { type: Number, required: true, min: 300 },
    dailyPercent: { type: Number, required: true, min: 1, max: 60 },
    durationDays: { type: Number, default: 30, min: 1, max: 365 },
    levelRequired: { type: Number, default: 1, min: 1, max: 5 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvestmentPlan", investmentPlanSchema);
