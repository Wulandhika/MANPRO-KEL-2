require("dotenv").config();

const nodemailer = require("nodemailer");

// ==========================================
// FINDIT EMAIL SERVICE
// ==========================================

const isEmailConfigured = () => {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
};

// Membuat koneksi SMTP
const createTransporter = () => {
    const port = Number(
        process.env.SMTP_PORT || 587
    );

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Mengirim email
const sendEmail = async ({
    to,
    subject,
    text
}) => {
    if (!to || !subject || !text) {
        throw new Error(
            "Data email belum lengkap"
        );
    }

    if (!isEmailConfigured()) {
        return {
            success: false,
            skipped: true,
            message: "SMTP belum dikonfigurasi"
        };
    }

    try {
        const transporter =
            createTransporter();

        const result =
            await transporter.sendMail({
                from:
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,
                to,
                subject,
                text
            });

        return {
            success: true,
            messageId: result.messageId
        };

    } catch (error) {
        console.error(
            "[EMAIL ERROR]",
            error.code || error.message
        );

        return {
            success: false,
            message: "Email gagal dikirim"
        };
    }
};

// Email selamat datang
const sendWelcomeEmail = async (
    email,
    name
) => {
    return sendEmail({
        to: email,
        subject: "Selamat datang di FindIt",
        text:
            `Halo ${name},\n\n` +
            "Selamat datang di FindIt.\n" +
            "Akun kamu berhasil dibuat.\n\n" +
            "Salam,\nTim FindIt"
    });
};

// Email rekomendasi barang
const sendMatchEmail = async (
    email,
    itemName,
    score
) => {
    return sendEmail({
        to: email,
        subject: "Rekomendasi Barang FindIt",
        text:
            "Halo,\n\n" +
            "Kami menemukan barang yang kemungkinan cocok " +
            "dengan laporan kamu.\n\n" +
            `Barang: ${itemName}\n` +
            `Skor kemiripan: ${score}%\n\n` +
            "Silakan periksa aplikasi FindIt."
    });
};

// Email status klaim
const sendClaimStatusEmail = async (
    email,
    itemName,
    status
) => {
    const statusLabels = {
        approved: "Disetujui",
        rejected: "Ditolak",
        pending: "Menunggu verifikasi",
        cancelled: "Dibatalkan"
    };

    return sendEmail({
        to: email,
        subject: "Pembaruan Status Klaim FindIt",
        text:
            "Halo,\n\n" +
            `Barang: ${itemName}\n` +
            `Status klaim: ${
                statusLabels[status] || status
            }\n\n` +
            "Silakan periksa aplikasi FindIt."
    });
};

module.exports = {
    isEmailConfigured,
    sendEmail,
    sendWelcomeEmail,
    sendMatchEmail,
    sendClaimStatusEmail
};