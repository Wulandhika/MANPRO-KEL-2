const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "supersecretjwtkey_findit_manpro_kel2_2026";
}

module.exports = {
  PORT: Number(process.env.PORT || 5000),
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL:
    process.env.FRONTEND_URL || "http://localhost:5173",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME || "manpro_kel2",

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
};