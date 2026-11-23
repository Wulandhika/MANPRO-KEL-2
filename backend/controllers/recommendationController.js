const recommendationModel = require(
    "../models/recommendationModel"
);

const {
    successResponse,
    errorResponse
} = require("../utils/response");

// Mengambil rekomendasi pengguna
const getMyRecommendations = async (req, res, next) => {
    try {
        const recommendations =
            await recommendationModel
                .getRecommendationsByUser(req.user.id);

        return successResponse(
            res,
            "Rekomendasi berhasil diambil",
            recommendations
        );

    } catch (error) {
        next(error);
    }
};

// Mengambil detail rekomendasi
const getRecommendationById = async (req, res, next) => {
    try {
        const recommendation =
            await recommendationModel
                .getRecommendationById(
                    req.params.id,
                    req.user.id
                );

        if (!recommendation) {
            return errorResponse(
                res,
                "Rekomendasi tidak ditemukan",
                404
            );
        }

        return successResponse(
            res,
            "Detail rekomendasi berhasil diambil",
            recommendation
        );

    } catch (error) {
        next(error);
    }
};

// Menghapus rekomendasi
const deleteRecommendation = async (req, res, next) => {
    try {
        const recommendation =
            await recommendationModel
                .deleteRecommendation(
                    req.params.id,
                    req.user.id
                );

        if (!recommendation) {
            return errorResponse(
                res,
                "Rekomendasi tidak ditemukan",
                404
            );
        }

        return successResponse(
            res,
            "Rekomendasi berhasil dihapus",
            recommendation
        );

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyRecommendations,
    getRecommendationById,
    deleteRecommendation
};