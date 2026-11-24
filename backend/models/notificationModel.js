const db = require("../config/db");

// Membuat notifikasi baru
const createNotification = async ({
    user_id,
    title,
    message,
    type = "system"
}) => {
    const result = await db.query(
        `INSERT INTO notifications
        (user_id, title, message, type, is_read)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING *`,
        [user_id, title, message, type]
    );

    return result.rows[0];
};

// Mengambil semua notifikasi pengguna
const getNotificationsByUser = async (userId) => {
    const result = await db.query(
        `SELECT *
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

// Menghitung notifikasi belum dibaca
const countUnreadNotifications = async (userId) => {
    const result = await db.query(
        `SELECT COUNT(*) AS total
        FROM notifications
        WHERE user_id = $1
        AND is_read = FALSE`,
        [userId]
    );

    return Number(result.rows[0].total);
};

// Menandai satu notifikasi sudah dibaca
const markAsRead = async (id, userId) => {
    const result = await db.query(
        `UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
        AND user_id = $2
        RETURNING *`,
        [id, userId]
    );

    return result.rows[0];
};

// Menandai seluruh notifikasi sudah dibaca
const markAllAsRead = async (userId) => {
    const result = await db.query(
        `UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
        AND is_read = FALSE`,
        [userId]
    );

    return result.rowCount;
};

// Menghapus notifikasi
const deleteNotification = async (id, userId) => {
    const result = await db.query(
        `DELETE FROM notifications
        WHERE id = $1
        AND user_id = $2
        RETURNING id`,
        [id, userId]
    );

    return result.rows[0];
};

module.exports = {
    createNotification,
    getNotificationsByUser,
    countUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};