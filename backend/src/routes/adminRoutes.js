const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");
const { paymentQrUpload } = require("../middleware/uploadMiddleware");
const {
  transactionDecisionValidators,
  depositDecisionValidators,
  notificationValidators,
  paymentSettingsValidators,
  kycDecisionValidators,
  depositListValidators,
  getAnalytics,
  getUsers,
  getPendingTransactions,
  getDepositRequests,
  getPaymentSettings,
  updatePaymentSettings,
  updatePaymentQr,
  decideDepositRequest,
  decideTransaction,
  reviewKyc,
  sendNotification
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.get("/transactions/pending", getPendingTransactions);
router.get("/deposits", depositListValidators, validateRequest, getDepositRequests);
router.get("/payment-settings", getPaymentSettings);
router.patch("/payment-settings", paymentSettingsValidators, validateRequest, updatePaymentSettings);
router.patch("/payment-settings/qr", paymentQrUpload.single("qrImage"), updatePaymentQr);
router.patch(
  "/deposits/:id/decision",
  depositDecisionValidators,
  validateRequest,
  decideDepositRequest
);
router.patch(
  "/transactions/:id/decision",
  transactionDecisionValidators,
  validateRequest,
  decideTransaction
);
router.patch("/kyc/:userId", kycDecisionValidators, validateRequest, reviewKyc);
router.post("/notifications", notificationValidators, validateRequest, sendNotification);

module.exports = router;
