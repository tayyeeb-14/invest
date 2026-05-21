const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Notification = require("../models/Notification");

const submitKyc = asyncHandler(async (req, res) => {
  const { documentType } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("KYC document file is required.");
  }

  if (!documentType) {
    res.status(400);
    throw new Error("documentType is required.");
  }

  const user = await User.findById(req.user._id);
  user.kyc = {
    status: "pending",
    documentType,
    documentUrl: `/uploads/kyc/${req.file.filename}`,
    submittedAt: new Date(),
    reviewedAt: null,
    rejectionReason: null
  };
  await user.save();

  await Notification.create({
    user: user._id,
    targetRole: "user",
    title: "KYC submitted",
    message: "Your KYC has been submitted and is waiting for review.",
    type: "info"
  });

  res.status(201).json({
    success: true,
    message: "KYC submitted successfully.",
    kyc: user.kyc
  });
});

module.exports = { submitKyc };
