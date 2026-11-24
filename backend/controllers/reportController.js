
const Report = require("../models/reportModel");

const {
    processReportMatching
} = require("../services/matchingService");

// ==================================================
// FINDIT - REPORT CONTROLLER
// ==================================================

// Validasi data laporan
const validateReport = (body = {}) => {
    if (!body || typeof body !== "object") {
        return false;
    }

    const required = [
        "category",
        "item_name",
        "location",
        "lost_date",
        "time_range"
    ];

    const valid = required.every(
        (field) =>
            typeof body[field] === "string" &&
            body[field].trim().length > 0
    );

    if (!valid) {
        return false;
    }

    return Number.isFinite(
        new Date(body.lost_date).getTime()
    );
};

// ==================================================
// MENJALANKAN AI MATCHING
// ==================================================

const runMatching = async (report) => {
    try {
        return await processReportMatching(report);

    } catch (error) {
        console.error(
            "[REPORT AI ERROR]",
            error.message
        );

        // Laporan tetap berhasil dibuat meskipun
        // proses penyimpanan rekomendasi gagal.
        return {
            success: false,
            status: "failed",
            report_id: report.id,
            message: "Laporan tersimpan, tetapi pencocokan AI gagal",
            total_candidates: null,
            total_matches: null,
            recommendations: []
        };
    }
};

// ==================================================
// MEMBUAT LAPORAN KEHILANGAN
// ==================================================

const createReport = async (req, res, next) => {
    try {
        if (!validateReport(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib dan gunakan tanggal yang valid"
            });
        }

        // Menyimpan laporan ke database
        const report = await Report.create({
            ...req.body,
            user_id: req.user.id
        });

        // Menjalankan AI setelah laporan dibuat
        const matching = await runMatching(report);

        return res.status(201).json({
            success: true,
            message: matching.success
                ? "Laporan kehilangan berhasil dibuat"
                : "Laporan berhasil dibuat, tetapi pencocokan AI gagal",
            data: report,
            matching
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// MELIHAT SEMUA LAPORAN MILIK PENGGUNA
// ==================================================

const getMyReports = async (req, res, next) => {
    try {
        const reports = await Report.findByUserId(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Laporan berhasil diambil",
            data: reports
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// MELIHAT DETAIL LAPORAN
// ==================================================

const getReportDetail = async (req, res, next) => {
    try {
        const report = await Report.findById(
            req.params.id,
            req.user.id
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Laporan tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// MEMPERBARUI LAPORAN KEHILANGAN
// ==================================================

const updateReport = async (req, res, next) => {
    try {
        if (!validateReport(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib dan gunakan tanggal yang valid"
            });
        }

        const report = await Report.update(
            req.params.id,
            req.user.id,
            req.body
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Laporan tidak ditemukan atau tidak dapat diubah"
            });
        }

        // Memperbarui rekomendasi sesuai data laporan
        const matching = await runMatching(report);

        return res.status(200).json({
            success: true,
            message: matching.success
                ? "Laporan berhasil diperbarui"
                : "Laporan diperbarui, tetapi pencocokan AI gagal",
            data: report,
            matching
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// MENGHAPUS LAPORAN
// ==================================================

const deleteReport = async (req, res, next) => {
    try {
        const report = await Report.remove(
            req.params.id,
            req.user.id
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Laporan tidak ditemukan atau tidak dapat dihapus"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Laporan berhasil dihapus"
        });

    } catch (error) {
        next(error);
    }
};

// ==================================================
// EXPORT CONTROLLER
// ==================================================

module.exports = {
    createReport,
    getMyReports,
    getReportDetail,
    updateReport,
    deleteReport
};
