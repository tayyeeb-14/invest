require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { ensureSeedData } = require("./services/seedService");

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureSeedData();

    app.listen(port, () => {
      console.log(`TrustVest API running on port ${port}`);
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);
  }
};

startServer();