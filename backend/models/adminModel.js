const db = require("../config/db");

// Statistik dashboard admin
const getDashboardStats = async () => {
    const result = await db.query(`
        SELECT
            (SELECT COUNT(*) FROM users)::int AS total_users,
            (SELECT COUNT(*) FROM reports)::int AS total_reports,
            (SELECT COUNT(*) FROM items)::int AS total_items,
            (SELECT COUNT(*) FROM claims)::int AS total_claims,
            (
                SELECT COUNT(*)
                FROM claims
                WHERE status = 'pending'
            )::int AS pending_claims,
            (
                SELECT COUNT(*)
                FROM claims
                WHERE status = 'approved'
            )::int AS approved_claims,
            (
                SELECT COUNT(*)
                FROM claims
                WHERE status = 'rejected'
            )::int AS rejected_claims
    `);

    return result.rows[0];
};

// Mengambil seluruh laporan
const getAllReports = async () => {
    const result = await db.query(`
        SELECT *
        FROM reports
        ORDER BY created_at DESC
    `);

    return result.rows;
};

// Mengambil seluruh barang
const getAllItems = async () => {
    const result = await db.query(`
        SELECT *
        FROM items
        ORDER BY created_at DESC
    `);

    return result.rows;
};

// Mengambil seluruh klaim
const getAllClaims = async () => {
    const result = await db.query(`
        SELECT *
        FROM claims
        ORDER BY created_at DESC
    `);

    return result.rows;
};

module.exports = {
    getDashboardStats,
    getAllReports,
    getAllItems,
    getAllClaims
};