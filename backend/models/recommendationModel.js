const db = require("../config/db");

const recommendationQuery = `
    SELECT
        r.id,
        r.user_id,
        r.report_id,
        r.item_id,
        r.similarity_score,
        r.similarity_score AS match_score,
        r.created_at,
        i.item_name,
        i.category,
        i.color,
        i.brand,
        i.location,
        i.storage_location,
        i.found_date,
        i.found_time,
        i.status
    FROM recommendations r
    INNER JOIN items i
        ON i.id = r.item_id
    INNER JOIN reports rp
        ON rp.id = r.report_id
        AND rp.user_id = r.user_id
`;

const getRecommendationsByUser = async (userId) => {
    const result = await db.query(
        `${recommendationQuery}
         WHERE r.user_id = $1
         AND i.status = 'available'
         AND rp.status = 'pending'
         ORDER BY r.similarity_score DESC, r.id ASC`,
        [userId]
    );

    return result.rows;
};

const getRecommendationById = async (id, userId) => {
    const result = await db.query(
        `${recommendationQuery}
         WHERE r.id = $1
         AND r.user_id = $2
         AND i.status = 'available'
         AND rp.status = 'pending'`,
        [id, userId]
    );

    return result.rows[0];
};

const createRecommendation = async ({
    user_id,
    report_id,
    item_id,
    similarity_score
}) => {
    const result = await db.query(
        `INSERT INTO recommendations (
            user_id,
            report_id,
            item_id,
            similarity_score
         )
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (report_id, item_id)
         DO UPDATE SET
             similarity_score = EXCLUDED.similarity_score
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