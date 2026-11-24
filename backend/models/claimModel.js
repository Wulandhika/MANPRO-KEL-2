const pool = require("../config/db");

// Membuat error API
const apiError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    error.statusCode = status;
    return error;
};

// Memeriksa klaim yang sudah diajukan
const checkExistingClaim = async (userId, itemId) => {
    const result = await pool.query(
        `SELECT * FROM claims
         WHERE user_id = $1
         AND item_id = $2
         AND status IN ('pending', 'approved')
         LIMIT 1`,
        [userId, itemId]
    );

    return result.rows[0];
};

// Mengajukan klaim barang
const createClaim = async (data) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const item = await client.query(
            `SELECT id, status FROM items
             WHERE id = $1 FOR UPDATE`,
            [data.item_id]
        );

        if (!item.rows.length) {
            throw apiError("Barang tidak ditemukan", 404);
        }

        if (item.rows[0].status !== "available") {
            throw apiError("Barang sudah tidak tersedia", 409);
        }

        const existing = await client.query(
            `SELECT id FROM claims
             WHERE user_id = $1
             AND item_id = $2
             AND status IN ('pending', 'approved')`,
            [data.user_id, data.item_id]
        );

        if (existing.rows.length) {
            throw apiError("Klaim sudah pernah diajukan", 409);
        }

        const result = await client.query(
            `INSERT INTO claims (
                user_id,
                item_id,
                description,
                status
             )
             VALUES ($1, $2, $3, 'pending')
             RETURNING *`,
            [
                data.user_id,
                data.item_id,
                data.description
            ]
        );

        await client.query("COMMIT");

        return result.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Mengambil seluruh klaim
const getAllClaims = async () => {
    const result = await pool.query(
        `SELECT * FROM claims
         ORDER BY created_at DESC`
    );

    return result.rows;
};

// Mengambil klaim pengguna
const getClaimsByUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM claims
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

// Detail klaim
const getClaimById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM claims WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

// Menyetujui atau menolak klaim
const updateClaimStatus = async (id, status) => {
    if (!["approved", "rejected"].includes(status)) {
        throw apiError("Status klaim tidak valid", 400);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const initial = await client.query(
            `SELECT * FROM claims WHERE id = $1`,
            [id]
        );

        if (!initial.rows.length) {
            await client.query("ROLLBACK");
            return undefined;
        }

        const itemId = initial.rows[0].item_id;

        const item = await client.query(
            `SELECT * FROM items
             WHERE id = $1 FOR UPDATE`,
            [itemId]
        );

        if (
            status === "approved" &&
            (!item.rows.length ||
             item.rows[0].status !== "available")
        ) {
            throw apiError("Barang sudah tidak tersedia", 409);
        }

        const result = await client.query(
            `UPDATE claims
             SET status = $1,
                 updated_at = NOW()
             WHERE id = $2
             AND status = 'pending'
             RETURNING *`,
            [status, id]
        );

        if (!result.rows.length) {
            await client.query("ROLLBACK");
            return undefined;
        }

        const claim = result.rows[0];

        if (status === "approved") {

            // Barang tidak lagi tersedia
            await client.query(
                `UPDATE items
                 SET status = 'claimed',
                     updated_at = NOW()
                 WHERE id = $1`,
                [claim.item_id]
            );

            // Menolak klaim lain untuk barang yang sama
            const rejected = await client.query(
                `UPDATE claims
                 SET status = 'rejected',
                     updated_at = NOW()
                 WHERE item_id = $1
                 AND id <> $2
                 AND status = 'pending'
                 RETURNING user_id`,
                [claim.item_id, claim.id]
            );

            // Notifikasi untuk pemilik klaim lain
            for (const row of rejected.rows) {
                await client.query(
                    `INSERT INTO notifications
                     (user_id, title, message, type)
                     VALUES ($1, $2, $3, $4)`,
                    [
                        row.user_id,
                        "Klaim Ditolak",
                        "Barang telah diklaim oleh pengguna lain.",
                        "claim"
                    ]
                );
            }

            // Menghapus rekomendasi barang yang sudah diklaim
            await client.query(
                `DELETE FROM recommendations
                 WHERE item_id = $1`,
                [claim.item_id]
            );
        }

        // Mengirim notifikasi hasil klaim
        const approved = status === "approved";

        await client.query(
            `INSERT INTO notifications
             (user_id, title, message, type)
             VALUES ($1, $2, $3, $4)`,
            [
                claim.user_id,
                approved
                    ? "Klaim Disetujui"
                    : "Klaim Ditolak",
                approved
                    ? "Klaim barang kamu telah disetujui oleh admin FindIt."
                    : "Klaim barang kamu belum dapat disetujui oleh admin FindIt.",
                "claim"
            ]
        );

        await client.query("COMMIT");

        return claim;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Membatalkan klaim sendiri
const cancelClaim = async (id, userId) => {
    const result = await pool.query(
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
};

module.exports = {
    createClaim,
    checkExistingClaim,
    getAllClaims,
    getClaimsByUser,
    getClaimById,
    updateClaimStatus,
    cancelClaim
};