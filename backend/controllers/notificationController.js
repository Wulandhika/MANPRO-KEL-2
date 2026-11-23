const notificationModel = require(
    "../models/notificationModel"
);

const {
    successResponse,
    errorResponse
} = require("../utils/response");

// Mengambil notifikasi pengguna
const getMyNotifications = async (req, res, next) => {
    try {
        const notifications =
            await notificationModel
                .getNotificationsByUser(req.user.id);

        return successResponse(
            res,
            "Notifikasi berhasil diambil",
            notifications
        );

    } catch (error) {
        next(error);
    }
};

// Menghitung notifikasi belum dibaca
const getUnreadCount = async (req, res, next) => {
    try {
        const total =
            await notificationModel
                .countUnreadNotifications(req.user.id);

        return successResponse(
            res,
            "Jumlah notifikasi berhasil diambil",
            {
                unread_count: total
            }
        );

    } catch (error) {
        next(error);
    }
};

// Menandai notifikasi sudah dibaca
const markAsRead = async (req, res, next) => {
    try {
        const notification =
            await notificationModel.markAsRead(
                req.params.id,
                req.user.id
            );

        if (!notification) {
            return errorResponse(
                res,
                "Notifikasi tidak ditemukan",
                404
            );
        }

        return successResponse(
            res,
            "Notifikasi berhasil ditandai sudah dibaca",
            notification
        );

    } catch (error) {
        next(error);
    }
};

// Menandai seluruh notifikasi sudah dibaca
const markAllAsRead = async (req, res, next) => {
    try {
        const total =
            await notificationModel.markAllAsRead(
                req.user.id
            );

        return successResponse(
            res,
            "Semua notifikasi telah ditandai sudah dibaca",
            {
                updated_count: total
            }
        );

    } catch (error) {
        next(error);
    }
};

// Menghapus notifikasi pengguna
const deleteNotification = async (req, res, next) => {
    try {
        const notification =
            await notificationModel.deleteNotification(
                req.params.id,
                req.user.id
            );

        if (!notification) {
            return errorResponse(
                res,
                "Notifikasi tidak ditemukan",
                404
            );
        }

        return successResponse(
            res,
            "Notifikasi berhasil dihapus",
            notification
        );

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};