const pool = require("../config/db");

// Menambahkan barang temuan
const create = async (data) => {
    const result = await pool.query(
        `INSERT INTO items (
            item_name,
            category,
            color,
            brand,
            location,
            storage_location,
            found_date,
            found_time,
            description,
            status,
            created_by
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11
        )
        RETURNING *`,
        [
            data.item_name,
            data.category,
            data.color,
            data.brand,
            data.location,
            data.storage_location,
            data.found_date,
            data.found_time,
            data.description,
            "available",
            data.created_by
        ]
    );

    return result.rows[0];
};

// Menampilkan dan mencari barang
const findAll = async (filters = {}) => {
    let query = `
        SELECT
            id,
            item_name,
            category,
            color,
            brand,
            location,
            storage_location,
            found_date,
            found_time,
            status,
            created_at
        FROM items
        WHERE status = 'available'
    `;

    const values = [];

    if (filters.search) {
        values.push(`%${filters.search}%`);

        query += `
            AND (
                item_name ILIKE $${values.length}
                OR category ILIKE $${values.length}
                OR color ILIKE $${values.length}
                OR brand ILIKE $${values.length}
            )
        `;
    }

    if (filters.category) {
        values.push(filters.category);
        query += ` AND category = $${values.length}`;
    }

    if (filters.color) {
        values.push(filters.color);
        query += ` AND color = $${values.length}`;
    }

    if (filters.brand) {
        values.push(`%${filters.brand}%`);
        query += ` AND brand ILIKE $${values.length}`;
    }

    if (filters.location) {
        values.push(filters.location);
        query += ` AND location = $${values.length}`;
    }

    if (filters.start_date) {
        values.push(filters.start_date);
        query += ` AND found_date >= $${values.length}`;
    }

    if (filters.end_date) {
        values.push(filters.end_date);
        query += ` AND found_date <= $${values.length}`;
    }

    const sort =
        filters.sort === "oldest" ? "ASC" : "DESC";

    query += ` ORDER BY found_date ${sort}, id ${sort}`;

    const limit = Math.min(
        Math.max(parseInt(filters.limit, 10) || 9, 1),
        100
    );

    const page = Math.min(
        Math.max(parseInt(filters.page, 10) || 1, 1),
        10000
    );

    const offset = (page - 1) * limit;

    values.push(limit);
    query += ` LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await pool.query(query, values);

    return result.rows;
};

// Detail barang temuan
const findById = async (id) => {
    const result = await pool.query(
        `SELECT
            id,
            item_name,
            category,
            color,
            brand,
            location,
            storage_location,
            found_date,
            found_time,
            status,
            created_at
         FROM items
         WHERE id = $1
         AND status = 'available'`,
        [id]
    );

    return result.rows[0];
};

// Memperbarui barang temuan
const update = async (id, data) => {
    const result = await pool.query(
        `UPDATE items SET
            item_name = $1,
            category = $2,
            color = $3,
            brand = $4,
            location = $5,
            storage_location = $6,
            found_date = $7,
            found_time = $8,
            description = $9
         WHERE id = $10
         AND status = 'available'
         RETURNING *`,
        [
            data.item_name,
            data.category,
            data.color,
            data.brand,
            data.location,
            data.storage_location,
            data.found_date,
            data.found_time,
            data.description,
            id
        ]
    );

    return result.rows[0];
};

// Menghapus barang temuan dari katalog
const remove = async (id) => {
    const result = await pool.query(
        `UPDATE items
         SET status = 'archived'
         WHERE id = $1
         AND status = 'available'
         RETURNING id`,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    create,
    findAll,
    findById,
    update,
    remove
};