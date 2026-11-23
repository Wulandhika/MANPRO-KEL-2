const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log("================================");
  console.log("FindIt Backend Server");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("Status: Running");
  try {
    const res = await pool.query("SELECT current_database(), current_user;");
    console.log(`Database: Connected to '${res.rows[0].current_database}' as user '${res.rows[0].current_user}'`);
  } catch (err) {
    console.error(`Database Connection Failed: ${err.message}`);
  }
  console.log("================================");
});