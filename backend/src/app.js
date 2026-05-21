const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const kycRoutes = require("./routes/kycRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again shortly."
  }
});

app.use("/api", apiLimiter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "TrustVest API is healthy." });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/investments", investmentRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/public", publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
