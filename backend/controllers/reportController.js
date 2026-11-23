const Report = require("../models/reportModel");

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

    return required.every(
        (field) =>
            typeof body[field] === "string" &&
            body[field].trim().length > 0
    );
};

// Membuat laporan kehilangan
const createReport = async (req, res, next) => {
    try {
        if (!validateReport(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib"
            });
        }

        const report = await Report.create({
            ...req.body,
            user_id: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Laporan kehilangan berhasil dibuat",
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// Melihat semua laporan milik pengguna
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

// Melihat detail laporan
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

// Memperbarui laporan
const updateReport = async (req, res, next) => {
    try {
        if (!validateReport(req.body)) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib"
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

        return res.status(200).json({
            success: true,
            message: "Laporan berhasil diperbarui",
            data: report
        });

    } catch (error) {
        next(error);
    }
};

// Menghapus laporan
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

module.exports = {
    createReport,
    getMyReports,
    getReportDetail,
    updateReport,
    deleteReport
};