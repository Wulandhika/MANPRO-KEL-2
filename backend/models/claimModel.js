const db = require("../config/db");

const claimModel = {
    // Mengajukan klaim barang
    async createClaim(data) {
        const { user_id, item_id, description } = data;

        const result = await db.query(
            `INSERT INTO claims
            (user_id, item_id, description, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *`,
            [user_id, item_id, description]
        );

        return result.rows[0];
    },

    // Mengambil seluruh klaim
    async getAllClaims() {
        const result = await db.query(
            `SELECT * FROM claims
            ORDER BY created_at DESC`
        );

        return result.rows;
    },

    // Mengambil klaim berdasarkan pengguna
    async getClaimsByUser(userId) {
        const result = await db.query(
            `SELECT * FROM claims
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [userId]
        );

        return result.rows;
    },

    // Mengambil detail klaim
    async getClaimById(id) {
        const result = await db.query(
            `SELECT * FROM claims WHERE id = $1`,
            [id]
        );

        return result.rows[0];
    },

    // Memeriksa klaim yang masih diproses
    async checkExistingClaim(userId, itemId) {
        const result = await db.query(
            `SELECT * FROM claims
            WHERE user_id = $1
            AND item_id = $2
            AND status = 'pending'`,
            [userId, itemId]
        );

        return result.rows[0];
    },

    // Memperbarui status klaim
    async updateClaimStatus(id, status) {
        const result = await db.query(
            `UPDATE claims
            SET status = $1, updated_at = NOW()
            WHERE id = $2 AND status = 'pending'
            RETURNING *`,
            [status, id]
        );

        return result.rows[0];
    },

    // Membatalkan klaim milik pengguna
    async cancelClaim(id, userId) {
        const result = await db.query(
            `UPDATE claims
            SET status = 'cancelled',
                updated_at = NOW()
            WHERE id = $1
            AND user_id = $2
            AND status = 'pending'
            RETURNING *`,
            [id, userId]
        );

        return result.rows[0];
    }
};

module.exports = claimModel;