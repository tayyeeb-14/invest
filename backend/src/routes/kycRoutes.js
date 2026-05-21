const express = require("express");
const path = require("path");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { submitKyc } = require("../controllers/kycController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.join(__dirname, "..", "..", "uploads", "kyc")),
  filename: (_, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPG, PNG, and PDF files are allowed."));
  }
});

router.post("/upload", protect, upload.single("document"), submitKyc);

module.exports = router;
