const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Investment = require("../models/Investment");

const getLiveStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalActiveInvestments, totalVolume] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Investment.countDocuments({ status: "active" }),
    Transaction.aggregate([
      { $match: { status: "completed", type: { $in: ["deposit", "investment"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalActiveInvestments,
      totalVolume: totalVolume[0]?.total || 0,
      trustedSince: 2022
    }
  });
});

module.exports = { getLiveStats };
