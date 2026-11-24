const express = require("express");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    getMyRecommendations,
    getRecommendationById,
    deleteRecommendation
} = require("../controllers/recommendationController");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getMyRecommendations
);

router.get(
    "/my",
    authMiddleware,
    getMyRecommendations
);

router.get(
    "/:id",
    authMiddleware,
    getRecommendationById
);

router.delete(
    "/:id",
    authMiddleware,
    deleteRecommendation
);

module.exports = router;