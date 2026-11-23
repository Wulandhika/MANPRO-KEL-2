const express = require("express");
const router = express.Router();

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/userController");

// Semua endpoint membutuhkan login
router.use(authMiddleware);

// Melihat profil
router.get("/profile", getProfile);

// Mengubah profil
router.put("/profile", updateProfile);

// Mengubah password
router.put("/password", changePassword);

module.exports = router;