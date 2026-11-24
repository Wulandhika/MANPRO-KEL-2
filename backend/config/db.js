const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "manpro_kel2",
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Database error:", err.message);
});

module.exports = pool;