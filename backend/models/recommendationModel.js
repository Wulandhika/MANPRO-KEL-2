const db = require("../config/db");

// Mengambil rekomendasi milik pengguna
const getRecommendationsByUser = async (userId) => {
    const result = await db.query(
        `SELECT *
         FROM recommendations
         WHERE user_id = $1
         ORDER BY similarity_score DESC`,
        [userId]
    );

    return result.rows;
};

// Mengambil detail rekomendasi
const getRecommendationById = async (id, userId) => {
    const result = await db.query(
        `SELECT *
         FROM recommendations
         WHERE id = $1
         AND user_id = $2`,
        [id, userId]
    );

    return result.rows[0];
};

// Menyimpan hasil rekomendasi dari AI
const createRecommendation = async ({
    user_id,
    report_id,
    item_id,
    similarity_score
}) => {
    const result = await db.query(
        `INSERT INTO recommendations
        (user_id, report_id, item_id, similarity_score)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [
            user_id,
            report_id,
            item_id,
            similarity_score
        ]
    );

    return result.rows[0];
};

// Menghapus rekomendasi
const deleteRecommendation = async (id, userId) => {
    const result = await db.query(
        `DELETE FROM recommendations
         WHERE id = $1
         AND user_id = $2
         RETURNING id`,
        [id, userId]
    );

    return result.rows[0];
};

module.exports = {
    getRecommendationsByUser,
    getRecommendationById,
    createRecommendation,
    deleteRecommendation
};