const notificationModel = require(
    "../models/notificationModel"
);

const emailService = require(
    "./emailService"
);

// ==========================================
// FINDIT NOTIFICATION SERVICE
// ==========================================

const NOTIFICATION_TYPES = Object.freeze({
    MATCH: "match",
    CLAIM: "claim",
    REPORT: "report",
    SYSTEM: "system"
});

// Membuat notifikasi
const createNotification = async ({
    userId,
    title,
    message,
    type = NOTIFICATION_TYPES.SYSTEM
}) => {
    if (!userId || !title || !message) {
        throw new Error(
            "Data notifikasi belum lengkap"
        );
    }

    return notificationModel.createNotification({
        user_id: userId,
        title,
        message,
        type
    });
};

// Notifikasi rekomendasi barang
const notifyMatch = async ({
    userId,
    email,
    itemName,
    score
}) => {
    const notification =
        await createNotification({
            userId,
            title: "Barang yang Cocok Ditemukan",
            message:
                `Barang ${itemName} memiliki ` +
                `kemiripan ${score}% dengan ` +
                "laporan kamu.",
            type: NOTIFICATION_TYPES.MATCH
        });

    if (email) {
        await emailService.sendMatchEmail(
            email,
            itemName,
            score
        );
    }

    return notification;
};

// Notifikasi klaim disetujui
const notifyClaimApproved = async ({
    userId,
    email,
    itemName
}) => {
    const notification =
        await createNotification({
            userId,
            title: "Klaim Disetujui",
            message:
                `Klaim kamu untuk barang ` +
                `${itemName} telah disetujui.`,
            type: NOTIFICATION_TYPES.CLAIM
        });

    if (email) {
        await emailService.sendClaimStatusEmail(
            email,
            itemName,
            "approved"
        );
    }

    return notification;
};

// Notifikasi klaim ditolak
const notifyClaimRejected = async ({
    userId,
    email,
    itemName
}) => {
    const notification =
        await createNotification({
            userId,
            title: "Klaim Ditolak",
            message:
                `Klaim kamu untuk barang ` +
                `${itemName} telah ditolak.`,
            type: NOTIFICATION_TYPES.CLAIM
        });

    if (email) {
        await emailService.sendClaimStatusEmail(
            email,
            itemName,
            "rejected"
        );
    }

    return notification;
};

// Notifikasi laporan berhasil dibuat
const notifyReportCreated = async ({
    userId,
    itemName
}) => {
    return createNotification({
        userId,
        title: "Laporan Berhasil Dibuat",
        message:
            `Laporan barang ${itemName} ` +
            "berhasil dibuat.",
        type: NOTIFICATION_TYPES.REPORT
    });
};

// Notifikasi sistem
const notifySystem = async ({
    userId,
    title,
    message
}) => {
    return createNotification({
        userId,
        title,
        message,
        type: NOTIFICATION_TYPES.SYSTEM
    });
};

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    notifyMatch,
    notifyClaimApproved,
    notifyClaimRejected,
    notifyReportCreated,
    notifySystem
};