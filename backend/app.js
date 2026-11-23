require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ==========================================
// GLOBAL CONFIGURATION
// ==========================================

app.disable("x-powered-by");

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

app.use(express.json({ limit: "1mb" }));

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

// ==========================================
// ROOT API
// ==========================================

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "FindIt Backend API berhasil berjalan",
        version: "1.0.0"
    });
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "FindIt API is healthy",
        status: "Running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ==========================================
// IMPORT ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ==========================================
// ROUTE VALIDATION
// ==========================================

const registerRoute = (
    endpoint,
    router,
    routeName,
    optional = false
) => {
    if (typeof router === "function") {
        app.use(endpoint, router);

        console.log(
            `[ROUTE OK] ${endpoint}`
        );

        return;
    }

    const message =
        `${routeName} belum mengekspor Express Router dengan benar`;

    if (!optional) {
        throw new TypeError(message);
    }

    console.warn(`[ROUTE WARNING] ${message}`);

    app.use(endpoint, (req, res) => {
        return res.status(501).json({
            success: false,
            message: `${routeName} sedang dalam pengembangan`
        });
    });
};

// ==========================================
// REGISTER API ROUTES
// ==========================================

// Authentication
registerRoute(
    "/api/auth",
    authRoutes,
    "authRoutes.js"
);

// User Management
registerRoute(
    "/api/users",
    userRoutes,
    "userRoutes.js"
);

// Lost Report
registerRoute(
    "/api/reports",
    reportRoutes,
    "reportRoutes.js"
);

// Found Item & Search
registerRoute(
    "/api/items",
    itemRoutes,
    "itemRoutes.js"
);

// Claim Barang
registerRoute(
    "/api/claims",
    claimRoutes,
    "claimRoutes.js"
);

// Notification
registerRoute(
    "/api/notifications",
    notificationRoutes,
    "notificationRoutes.js"
);

// Recommendation
registerRoute(
    "/api/recommendations",
    recommendationRoutes,
    "recommendationRoutes.js"
);

// Admin Dashboard & Verification
registerRoute(
    "/api/admin",
    adminRoutes,
    "adminRoutes.js",
    true
);

// ==========================================
// API NOT FOUND
// ==========================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
        method: req.method,
        path: req.path
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
    console.error(
        "Server Error:",
        err
    );

    if (res.headersSent) {
        return next(err);
    }

    // Ukuran upload terlalu besar
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            success: false,
            message: "Ukuran file maksimal 5 MB"
        });
    }

    // Format JSON tidak valid
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            success: false,
            message: "Format JSON tidak valid"
        });
    }

    // Request body terlalu besar
    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Ukuran request terlalu besar"
        });
    }

    // Duplicate data PostgreSQL
    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Data sudah terdaftar"
        });
    }

    // Foreign key PostgreSQL
    if (err.code === "23503") {
        return res.status(409).json({
            success: false,
            message: "Data memiliki relasi yang tidak valid"
        });
    }

    // Database belum tersedia
    if (
        err.code === "ECONNREFUSED" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND" ||
        err.code === "57P03"
    ) {
        return res.status(503).json({
            success: false,
            message: "Layanan database belum tersedia"
        });
    }

    // Global status code
    const errorStatus =
        err.statusCode || err.status;

    const statusCode =
        Number.isInteger(errorStatus) &&
        errorStatus >= 400 &&
        errorStatus <= 599
            ? errorStatus
            : 500;

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Terjadi kesalahan pada server"
                : err.message || "Permintaan tidak valid"
    });
});

// ==========================================
// EXPORT APPLICATION
// ==========================================

module.exports = app;