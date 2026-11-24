const express = require("express");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    adminOnly
} = require("../middleware/roleMiddleware");

const {
    getDashboard,
    getAllReports,
    getAllItems,
    getAllClaims
} = require("../controllers/adminController");

const {
    approveClaim,
    rejectClaim
} = require("../controllers/claimController");

const router = express.Router();

// Semua endpoint hanya dapat diakses admin
router.use(authMiddleware);
router.use(adminOnly);

// Dashboard admin
router.get(
    "/dashboard",
    getDashboard
);

// Mengambil seluruh laporan
router.get(
    "/reports",
    getAllReports
);

// Mengambil seluruh barang
router.get(
    "/items",
    getAllItems
);

// Mengambil seluruh klaim
router.get(
    "/claims",
    getAllClaims
);

// Menyetujui klaim
router.patch(
    "/claims/:id/approve",
    approveClaim
);

// Menolak klaim
router.patch(
    "/claims/:id/reject",
    rejectClaim
);

module.exports = router;