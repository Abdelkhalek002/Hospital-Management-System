import dotenv from "dotenv";
import dbPool from "./config/db.js";
import { deActivateUser } from "./services/scheduler.service.js";

dotenv.config();
const { default: app } = await import("./app.js"); // es modules are hoisted (did this to solve .env load before app.js)

dbPool
  .getConnection()
  .then((connection) => {
    const dbName =
      process.env.NODE_ENV === "development"
        ? process.env.TEST_DB
        : process.env.PROD_DB;
    console.log(`(${dbName}) Database Connected!`);
    connection.release();
  })
  .catch((err) => {
    console.error("⚠️ Error connecting to the database: ", err.message);
  });

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}... `);
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
