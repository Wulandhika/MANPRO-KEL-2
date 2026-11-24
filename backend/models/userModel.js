const pool = require("../config/db");

const findByEmail = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    return result.rows[0];
};

const findById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, role, created_at
         FROM users WHERE id = $1`,
        [id]
    );

    return result.rows[0];
};

const createUser = async (name, email, password) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, password, "user"]
    );

    return result.rows[0];
};

module.exports = {
    findByEmail,
    findById,
    createUser
};

async function updateProfile(id, name) {
    const result = await pool.query(
        `UPDATE users
         SET name = $1
         WHERE id = $2
         RETURNING id, name, email, role, created_at`,
        [name, id]
    );

    return result.rows[0];
}

async function updatePassword(id, password) {
    await pool.query(
        `UPDATE users
         SET password = $1
         WHERE id = $2`,
        [password, id]
    );
}

module.exports.updateProfile = updateProfile;
module.exports.updatePassword = updatePassword;