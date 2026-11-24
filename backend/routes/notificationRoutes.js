const express = require("express");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();

// Mengambil semua notifikasi pengguna
router.get(
    "/",
    authMiddleware,
    getMyNotifications
);

// Menghitung notifikasi belum dibaca
router.get(
    "/unread-count",
    authMiddleware,
    getUnreadCount
);

// Menandai semua notifikasi sudah dibaca
router.patch(
    "/read-all",
    authMiddleware,
    markAllAsRead
);

// Menandai satu notifikasi sudah dibaca
router.patch(
    "/:id/read",
    authMiddleware,
    markAsRead
);

// Menghapus notifikasi
router.delete(
    "/:id",
    authMiddleware,
    deleteNotification
);

module.exports = router;