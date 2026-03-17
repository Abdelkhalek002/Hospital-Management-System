import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: "config.env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database:
    process.env.NODE_ENV === "development"
      ? process.env.TEST_DB
      : process.env.PROD_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  //keepAliveInitialDelayMs: 0,
});

export default pool;
