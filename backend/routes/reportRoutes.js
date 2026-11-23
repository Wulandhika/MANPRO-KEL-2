const express = require("express");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    validateRequired
} = require("../middleware/validationMiddleware");

const {
    createReport,
    getMyReports,
    getReportDetail,
    updateReport,
    deleteReport
} = require("../controllers/reportController");

const router = express.Router();

// Validasi data wajib laporan
const reportValidation = validateRequired(
    "category",
    "item_name",
    "location",
    "lost_date",
    "time_range"
);

// Semua endpoint membutuhkan login
router.use(authMiddleware);

// Membuat laporan kehilangan
router.post(
    "/",
    reportValidation,
    createReport
);

// Mengambil laporan sendiri
router.get("/my", getMyReports);

// Mengambil detail laporan
router.get("/:id", getReportDetail);

// Memperbarui laporan
router.put(
    "/:id",
    reportValidation,
    updateReport
);

// Menghapus laporan
router.delete("/:id", deleteReport);

module.exports = router;