const claimModel = require("../models/claimModel");

const {
    successResponse,
    errorResponse
} = require("../utils/response");

// Mengajukan klaim barang
const createClaim = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { item_id, description } = req.body;

        if (
            !item_id ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return errorResponse(
                res,
                "ID barang dan deskripsi wajib diisi",
                400
            );
        }

        const existingClaim =
            await claimModel.checkExistingClaim(
                userId,
                item_id
            );

        if (existingClaim) {
            return errorResponse(
                res,
                "Kamu sudah mengajukan klaim barang ini",
                409
            );
        }

        const claim = await claimModel.createClaim({
            user_id: userId,
            item_id,
            description: description.trim()
        });

        return successResponse(
            res,
            "Klaim barang berhasil diajukan",
            claim,
            201
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil seluruh klaim (Admin)
const getAllClaims = async (req, res, next) => {
    try {
        const claims = await claimModel.getAllClaims();

        return successResponse(
            res,
            "Data klaim berhasil diambil",
            claims
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil klaim milik pengguna
const getMyClaims = async (req, res, next) => {
    try {
        const claims =
            await claimModel.getClaimsByUser(req.user.id);

        return successResponse(
            res,
            "Riwayat klaim berhasil diambil",
            claims
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil detail klaim
const getClaimById = async (req, res, next) => {
    try {
        const claim = await claimModel.getClaimById(
            req.params.id
        );

        if (!claim) {
            return errorResponse(
                res,
                "Klaim tidak ditemukan",
                404
            );
        }

        if (
            String(claim.user_id) !== String(req.user.id) &&
            req.user.role !== "admin"
        ) {
            return errorResponse(
                res,
                "Kamu tidak memiliki akses",
                403
            );
        }

        return successResponse(
            res,
            "Detail klaim berhasil diambil",
            claim
        );

    } catch (error) {
        next(error);
    }
};

// Menyetujui klaim
const approveClaim = async (req, res, next) => {
    try {
        const claim =
            await claimModel.updateClaimStatus(
                req.params.id,
                "approved"
            );

        if (!claim) {
            return errorResponse(
                res,
                "Klaim tidak ditemukan atau sudah diproses",
                404
            );
        }

        return successResponse(
            res,
            "Klaim berhasil disetujui",
            claim
        );

    } catch (error) {
        next(error);
    }
};

// Menolak klaim
const rejectClaim = async (req, res, next) => {
    try {
        const claim =
            await claimModel.updateClaimStatus(
                req.params.id,
                "rejected"
            );

        if (!claim) {
            return errorResponse(
                res,
                "Klaim tidak ditemukan atau sudah diproses",
                404
            );
        }

        return successResponse(
            res,
            "Klaim berhasil ditolak",
            claim
        );

    } catch (error) {
        next(error);
    }
};

// Membatalkan klaim
const cancelClaim = async (req, res, next) => {
    try {
        const claim = await claimModel.cancelClaim(
            req.params.id,
            req.user.id
        );

        if (!claim) {
            return errorResponse(
                res,
                "Klaim tidak ditemukan atau tidak dapat dibatalkan",
                404
            );
        }

        return successResponse(
            res,
            "Klaim berhasil dibatalkan",
            claim
        );

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createClaim,
    getAllClaims,
    getMyClaims,
    getClaimById,
    approveClaim,
    rejectClaim,
    cancelClaim
};