const pool = require("../config/db");

const create = async (data) => {
    const result = await pool.query(
        `INSERT INTO reports (
            user_id,
            category,
            item_name,
            color,
            brand,
            location,
            lost_date,
            time_range,
            description,
            status
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10
        )
        RETURNING *`,
        [
            data.user_id,
            data.category,
            data.item_name,
            data.color,
            data.brand,
            data.location,
            data.lost_date,
            data.time_range,
            data.description,
            "pending"
        ]
    );

    return result.rows[0];
};

const findByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM reports
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

const findById = async (id, userId) => {
    const result = await pool.query(
        `SELECT * FROM reports
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );

    return result.rows[0];
};

const update = async (id, userId, data) => {
    const result = await pool.query(
        `UPDATE reports SET
            category = $1,
            item_name = $2,
            color = $3,
            brand = $4,
            location = $5,
            lost_date = $6,
            time_range = $7,
            description = $8,
            status = 'pending'
         WHERE id = $9
         AND user_id = $10
         AND status = 'pending'
         RETURNING *`,
        [
            data.category,
            data.item_name,
            data.color,
            data.brand,
            data.location,
            data.lost_date,
            data.time_range,
            data.description,
            id,
            userId
        ]
    );

    return result.rows[0];
};

const remove = async (id, userId) => {
    const result = await pool.query(
        `DELETE FROM reports
         WHERE id = $1
         AND user_id = $2
         AND status = 'pending'
         RETURNING id`,
        [id, userId]
    );

    return result.rows[0];
};

module.exports = {
    create,
    findByUserId,
    findById,
    update,
    remove
};