const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Memastikan data sensitif tidak dikirim
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
});

// Registrasi pengguna
const register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password
        } = req.body || {};

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Nama, email, dan password wajib diisi"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(normalizedEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Format email tidak valid"
            });
        }

        if (
            password.length < 8 ||
            Buffer.byteLength(password) > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter dan maksimal 72 byte"
            });
        }

        const existingUser =
            await User.findByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 12);

        const user = await User.createUser(
            name.trim(),
            normalizedEmail,
            hashedPassword
        );

        return res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: sanitizeUser(user)
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        next(error);
    }
};

// Login pengguna
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password ||
            Buffer.byteLength(password) > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Email atau password tidak valid"
            });
        }

        const user = await User.findByEmail(
            email.trim().toLowerCase()
        );

        if (
            !user ||
            !await bcrypt.compare(
                password,
                user.password
            )
        ) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error(
                "JWT_SECRET belum dikonfigurasi"
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

// Mengambil profil pengguna
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan"
            });
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
    getMe
};