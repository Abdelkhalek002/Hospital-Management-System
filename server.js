import dotenv from "dotenv";
import dbConnection from "./config/db.js";
import { deActivateUser } from "./services/cronExpireMiddleware.js";

dotenv.config({ path: "config.env" });
const { default: app } = await import("./app.js"); // es modules are hoisted (did this to solve .env load before app.js)

dbConnection.connect((err) => {
  if (err) {
    console.error("Unable to connect to MySQL:", err);
    return;
  }

  const dbName =
    process.env.NODE_ENV === "development"
      ? process.env.DEV_DB
      : process.env.NODE_ENV === "testing"
        ? process.env.TEST_DB
        : process.env.PROD_DB;
  console.log(`🚀 Connected to ( ${dbName} ) successfully! `);
});

const port =
  process.env.NODE_ENV === "testing" ? process.env.TEST_PORT : process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}... `);
});

// DEACTIVATE ACCOUNTS
deActivateUser();

// HANDLING REJECTIONS OUTSIDE EXPRESS
process.on("unhandledRejection", (err) => {
  console.log(`UNHANDLED REJECTION! ⚠️ : ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("shutting down....");
    process.exit(1);
  });
});
