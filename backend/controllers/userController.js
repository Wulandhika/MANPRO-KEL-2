const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Melihat profil pengguna
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profil berhasil diambil",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        next(error);
    }
};

// Mengubah profil pengguna
const updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.trim().length > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Nama harus berisi 1-100 karakter"
            });
        }

        const user = await User.updateProfile(
            req.user.id,
            name.trim()
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan"
            });
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

// Mengubah password pengguna
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (
            typeof oldPassword !== "string" ||
            typeof newPassword !== "string" ||
            !oldPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Password lama dan baru wajib diisi"
            });
        }

        if (
            newPassword.length < 8 ||
            Buffer.byteLength(newPassword, "utf8") > 72
        ) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter dan maksimal 72 byte"
            });
        }

        const user = await User.findByEmail(req.user.email);

        if (!user || String(user.id) !== String(req.user.id)) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak ditemukan"
            });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Password lama tidak sesuai"
            });
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