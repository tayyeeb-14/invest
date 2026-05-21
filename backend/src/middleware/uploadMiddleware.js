const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const secureFilename = (originalName) => {
  const ext = path.extname(originalName || "").toLowerCase() || ".jpg";
  return `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${ext}`;
};

const fileFilter = (_, file, cb) => {
  if (!imageMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
  }
  return cb(null, true);
};

const createUploader = (relativeDir, maxSizeMb = 4) => {
  const absoluteDir = path.join(__dirname, "..", "..", "uploads", relativeDir);
  ensureDir(absoluteDir);

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, absoluteDir),
    filename: (_, file, cb) => cb(null, secureFilename(file.originalname))
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMb * 1024 * 1024 }
  });
};

const depositScreenshotUpload = createUploader("deposits", 5);
const paymentQrUpload = createUploader("payment-settings", 4);

module.exports = { depositScreenshotUpload, paymentQrUpload };
