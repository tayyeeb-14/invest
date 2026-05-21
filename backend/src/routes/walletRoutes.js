const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");
const { depositScreenshotUpload } = require("../middleware/uploadMiddleware");
const {
  manualDepositValidators,
  withdrawValidators,
  transactionQueryValidators,
  getWalletSummary,
  getPaymentSettings,
  createManualDepositRequest,
  getMyDepositRequests,
  createWithdrawalRequest,
  getTransactionHistory
} = require("../controllers/walletController");

const router = express.Router();

router.get("/summary", protect, getWalletSummary);
router.get("/payment-settings", protect, getPaymentSettings);
router.get("/deposits/my", protect, getMyDepositRequests);
router.post(
  "/deposit",
  protect,
  depositScreenshotUpload.single("screenshot"),
  manualDepositValidators,
  validateRequest,
  createManualDepositRequest
);
router.post("/withdraw", protect, withdrawValidators, validateRequest, createWithdrawalRequest);
router.get(
  "/transactions",
  protect,
  transactionQueryValidators,
  validateRequest,
  getTransactionHistory
);

module.exports = router;
