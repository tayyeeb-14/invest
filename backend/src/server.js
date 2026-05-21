require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { ensureSeedData } = require("./services/seedService");

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await ensureSeedData();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`TrustVest API running on port ${port}`);
  });
};

startServer();
