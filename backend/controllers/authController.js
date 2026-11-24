const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const ALLOWED_DOMAINS = [
    "umy.ac.id",
    "mail.umy.ac.id"
];

const ADMIN_EMAIL = "admin123@umy.ac.id";

const normalizeEmail = (email) => {
    return typeof email === "string"
        ? email.trim().toLowerCase()
        : "";
};

// Validasi email resmi UMY
const isValidUMYEmail = (email) => {
    if (
        !email ||
        email.length > 255 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return false;
    }

    const domain = email.split("@")[1];

    return ALLOWED_DOMAINS.includes(domain);
};

// Validasi nama lengkap
const isValidName = (name) => {
    if (typeof name !== "string") {
        return false;
    }

    const value = name.trim();

    return (
        value.length >= 3 &&
        value.length <= 100 &&
        /^[\p{L}\p{M}]+(?:[ .'\u2019-][\p{L}\p{M}]+)*\.?$/u.test(value)
    );
};

// Validasi NIM/NIP
const isValidNimNip = (value) => {
    return (
        typeof value === "string" &&
        /^\d{1,30}$/.test(value.trim())
    );
};

// Validasi password
const isValidPassword = (password) => {
    return (
        typeof password === "string" &&
        password.length >= 8 &&
        Buffer.byteLength(password, "utf8") <= 72 &&
        password.trim().length > 0
    );
};

// Menghindari pengiriman password
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    nim_nip: user.nim_nip,
    role: user.role,
    created_at: user.created_at
});

const fail = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};

// ========================================
// REGISTER
// ========================================

const register = async (req, res, next) => {
    try {
        const {
            name,
            password,
            confirmPassword
        } = req.body || {};

        const email = normalizeEmail(req.body?.email);
        const nimNip = req.body?.nim_nip;

        if (!isValidName(name)) {
            return fail(
                res,
                400,
                "Nama harus 3-100 karakter dan tidak boleh mengandung angka atau simbol sembarangan"
            );
        }

        if (!isValidUMYEmail(email)) {
            return fail(
                res,
                400,
                "Gunakan email resmi UMY (@umy.ac.id atau @mail.umy.ac.id)"
            );
        }

        if (email === ADMIN_EMAIL) {
            return fail(
                res,
                403,
                "Akun admin tidak dapat didaftarkan melalui registrasi umum"
            );
        }

        if (!isValidNimNip(nimNip)) {
            return fail(
                res,
                400,
                "NIM/NIP wajib diisi menggunakan angka, maksimal 30 digit"
            );
        }

        if (!isValidPassword(password)) {
            return fail(
                res,
                400,
                "Password minimal 8 karakter dan maksimal 72 byte"
            );
        }

        if (password !== confirmPassword) {
            return fail(
                res,
                400,
                "Konfirmasi password tidak sesuai"
            );
        }

        const existingEmail =
            await User.findByEmail(email);

        if (existingEmail) {
            return fail(
                res,
                409,
                "Email sudah terdaftar"
            );
        }

        const existingNim =
            await User.findByNimNip(nimNip.trim());

        if (existingNim) {
            return fail(
                res,
                409,
                "NIM/NIP sudah terdaftar"
            );
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const user = await User.createUser(
            name.trim(),
            email,
            hashedPassword,
            nimNip.trim()
        );

        return res.status(201).json({
            success: true,
            message: "Registrasi akun FindIt UMY berhasil",
            data: sanitizeUser(user)
        });

    } catch (error) {
        if (error.code === "23505") {
            return fail(
                res,
                409,
                "Email atau NIM/NIP sudah terdaftar"
            );
        }

        next(error);
    }
};

// ========================================
// LOGIN
// ========================================

const login = async (req, res, next) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = req.body?.password;

        if (!isValidUMYEmail(email)) {
            return fail(
                res,
                400,
                "Login hanya menggunakan email resmi UMY"
            );
        }

        if (
            typeof password !== "string" ||
            !password ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return fail(
                res,
                400,
                "Password tidak valid"
            );
        }

        const user = await User.findByEmail(email);

        if (!user) {
            return fail(
                res,
                401,
                "Email atau password salah"
            );
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return fail(
                res,
                401,
                "Email atau password salah"
            );
        }

        if (!user.is_active) {
            return fail(
                res,
                403,
                "Akun telah dinonaktifkan"
            );
        }

        if (!["user", "admin"].includes(user.role)) {
            return fail(
                res,
                403,
                "Role pengguna tidak valid"
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: {
                token,
                user: sanitizeUser(user)
            }
        });

    } catch (error) {
        next(error);
    }
};

// ========================================
// PROFIL
// ========================================

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return fail(
                res,
                404,
                "Pengguna tidak ditemukan"
            );
        }

        return res.status(200).json({
            success: true,
            message: "Profil berhasil diambil",
            data: sanitizeUser(user)
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    isValidName,
    isValidPassword
};