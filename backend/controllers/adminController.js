const adminModel = require("../models/adminModel");

const {
    successResponse
} = require("../utils/response");

// Dashboard admin
const getDashboard = async (req, res, next) => {
    try {
        const stats =
            await adminModel.getDashboardStats();

        return successResponse(
            res,
            "Statistik dashboard berhasil diambil",
            stats
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil seluruh laporan
const getAllReports = async (req, res, next) => {
    try {
        const reports =
            await adminModel.getAllReports();

        return successResponse(
            res,
            "Data laporan berhasil diambil",
            reports
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil seluruh barang
const getAllItems = async (req, res, next) => {
    try {
        const items =
            await adminModel.getAllItems();

        return successResponse(
            res,
            "Data barang berhasil diambil",
            items
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil seluruh klaim
const getAllClaims = async (req, res, next) => {
    try {
        const claims =
            await adminModel.getAllClaims();

        return successResponse(
            res,
            "Data klaim berhasil diambil",
            claims
        );

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getAllReports,
    getAllItems,
    getAllClaims
};