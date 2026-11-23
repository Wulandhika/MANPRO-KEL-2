require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("================================");
  console.log("FindIt Backend Server");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("Status: Running");
  console.log("================================");
});