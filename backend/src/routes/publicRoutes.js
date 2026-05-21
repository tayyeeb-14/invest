const express = require("express");
const { getLiveStats } = require("../controllers/publicController");

const router = express.Router();

router.get("/live-stats", getLiveStats);

module.exports = router;
