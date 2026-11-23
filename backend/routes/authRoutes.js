const express = require("express");

const authController = require(
    "../controllers/authController"
);

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    validateRegister,
    validateLogin
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Registrasi pengguna
router.post(
    "/register",
    validateRegister,
    authController.register
);

// Login pengguna
router.post(
    "/login",
    validateLogin,
    authController.login
);

// Mengambil profil pengguna
router.get(
    "/me",
    authMiddleware,
    authController.getMe
);

module.exports = router;