const pool = require("../config/db");

const findByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};

const findByNimNip = async (nimNip) => {
    const result = await pool.query(
        "SELECT id FROM users WHERE nim_nip = $1",
        [nimNip]
    );

    return result.rows[0];
};

const findById = async (id) => {
    const result = await pool.query(
        `SELECT
            id,
            name,
            email,
            nim_nip,
            role,
            is_active,
            created_at
         FROM users
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

const createUser = async (
    name,
    email,
    password,
    nimNip
) => {
    const result = await pool.query(
        `INSERT INTO users (
            name,
            email,
            password,
            nim_nip,
            role
        )
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING
            id,
            name,
            email,
            nim_nip,
            role,
            is_active,
            created_at`,
        [name, email, password, nimNip]
    );

    return result.rows[0];
};

const updateProfile = async (id, name) => {
    const result = await pool.query(
        `UPDATE users
         SET name = $1
         WHERE id = $2
         RETURNING
            id,
            name,
            email,
            nim_nip,
            role,
            created_at`,
        [name, id]
    );

    return result.rows[0];
};

const updatePassword = async (id, password) => {
    await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [password, id]
    );
};

module.exports = {
    findByEmail,
    findByNimNip,
    findById,
    createUser,
    updateProfile,
    updatePassword
};