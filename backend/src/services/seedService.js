const InvestmentPlan = require("../models/InvestmentPlan");
const PaymentSettings = require("../models/PaymentSettings");
const User = require("../models/User");

const DEFAULT_PLANS = [
  {
    name: "Starter Shield",
    description: "Built for first-time investors with lower entry and stable returns.",
    minAmount: 300,
    maxAmount: 499,
    dailyPercent: 6,
    durationDays: 30,
    levelRequired: 1
  },
  {
    name: "Growth Plus",
    description: "Balanced growth plan for regular wallet users.",
    minAmount: 500,
    maxAmount: 699,
    dailyPercent: 9,
    durationDays: 35,
    levelRequired: 2
  },
  {
    name: "Prime Secure",
    description: "Higher confidence returns designed for committed investors.",
    minAmount: 700,
    maxAmount: 899,
    dailyPercent: 12,
    durationDays: 40,
    levelRequired: 3
  },
  {
    name: "Elite Yield",
    description: "Premium daily income strategy for advanced members.",
    minAmount: 900,
    maxAmount: 1099,
    dailyPercent: 16,
    durationDays: 45,
    levelRequired: 4
  },
  {
    name: "Institutional Edge",
    description: "Top-tier level offering for high-trust account holders.",
    minAmount: 1100,
    maxAmount: 200000,
    dailyPercent: 20,
    durationDays: 60,
    levelRequired: 5
  }
];

const ensureSeedData = async () => {
  const planCount = await InvestmentPlan.countDocuments();
  if (!planCount) {
    await InvestmentPlan.insertMany(DEFAULT_PLANS);
    // eslint-disable-next-line no-console
    console.log("Seeded default investment plans.");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        fullName: "TrustVest Admin",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        kyc: { status: "verified" }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded default admin account.");
    }
  }

  const paymentSettings = await PaymentSettings.findOne({ singletonKey: "default" });
  if (!paymentSettings) {
    await PaymentSettings.create({
      singletonKey: "default",
      upiId: "trustvest@upi",
      accountName: "TrustVest Financial Technologies",
      bankName: "National Commerce Bank",
      accountNumberMasked: "XXXXXX1028",
      depositsEnabled: true
    });
    // eslint-disable-next-line no-console
    console.log("Seeded default payment settings.");
  }
};

module.exports = { ensureSeedData };
