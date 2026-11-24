const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const {
    isValidName,
    isValidPassword
} = require("./authController");

const fail = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message
    });
};

// Melihat profil
const getProfile = async (req, res, next) => {
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
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                nim_nip: user.nim_nip,
                role: user.role,
                created_at: user.created_at
            }
        });

    } catch (error) {
        next(error);
    }
};

// Memperbarui profil
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body || {};

        if (!isValidName(name)) {
            return fail(
                res,
                400,
                "Nama harus 3-100 karakter tanpa angka atau simbol sembarangan"
            );
        }

        const user = await User.updateProfile(
            req.user.id,
            name.trim()
        );

        if (!user) {
            return fail(
                res,
                404,
                "Pengguna tidak ditemukan"
            );
        }

        return res.status(200).json({
            success: true,
            message: "Profil berhasil diperbarui",
            data: user
        });

    } catch (error) {
        next(error);
    }
};

// Mengubah password
const changePassword = async (req, res, next) => {
    try {
        const {
            oldPassword,
            newPassword
        } = req.body || {};

        if (
            typeof oldPassword !== "string" ||
            !oldPassword ||
            Buffer.byteLength(oldPassword, "utf8") > 72
        ) {
            return fail(
                res,
                400,
                "Password lama wajib diisi"
            );
        }

        if (!isValidPassword(newPassword)) {
            return fail(
                res,
                400,
                "Password baru minimal 8 karakter dan maksimal 72 byte"
            );
        }

        const user = await User.findByEmail(
            req.user.email
        );

        if (
            !user ||
            String(user.id) !== String(req.user.id)
        ) {
            return fail(
                res,
                404,
                "Pengguna tidak ditemukan"
            );
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return fail(
                res,
                400,
                "Password lama tidak sesuai"
            );
        }

        if (oldPassword === newPassword) {
            return fail(
                res,
                400,
                "Password baru harus berbeda dari password lama"
            );
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        await User.updatePassword(
            req.user.id,
            hashedPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password berhasil diubah"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};