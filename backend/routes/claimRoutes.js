const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    adminOnly
} = require("../middleware/roleMiddleware");

const {
    createClaim,
    getAllClaims,
    getMyClaims,
    getClaimById,
    approveClaim,
    rejectClaim,
    cancelClaim
} = require("../controllers/claimController");

const router = express.Router();

// Mengajukan klaim
router.post(
    "/",
    authMiddleware,
    createClaim
);

// Mengambil semua klaim (Admin)
router.get(
    "/",
    authMiddleware,
    adminOnly,
    getAllClaims
);

// Mengambil klaim sendiri
router.get(
    "/my",
    authMiddleware,
    getMyClaims
);

// Mengambil detail klaim
router.get(
    "/:id",
    authMiddleware,
    getClaimById
);

// Menyetujui klaim (Admin)
router.patch(
    "/:id/approve",
    authMiddleware,
    adminOnly,
    approveClaim
);

// Menolak klaim (Admin)
router.patch(
    "/:id/reject",
    authMiddleware,
    adminOnly,
    rejectClaim
);

// Membatalkan klaim sendiri
router.patch(
    "/:id/cancel",
    authMiddleware,
    cancelClaim
);

module.exports = router;