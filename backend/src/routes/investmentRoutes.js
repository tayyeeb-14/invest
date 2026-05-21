const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");
const {
  investValidators,
  getPlans,
  getMyInvestments,
  createInvestment,
  calculateProfit,
  getLevelStructure
} = require("../controllers/investmentController");

const router = express.Router();

router.get("/plans", getPlans);
router.get("/levels", getLevelStructure);
router.get("/calculator", calculateProfit);
router.get("/my", protect, getMyInvestments);
router.post("/invest", protect, investValidators, validateRequest, createInvestment);

module.exports = router;
