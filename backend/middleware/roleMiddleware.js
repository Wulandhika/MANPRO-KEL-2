const { errorResponse } = require("../utils/response");

// Middleware pembatasan akses berdasarkan role
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        // Memastikan pengguna sudah login
        if (!req.user) {
            return errorResponse(
                res,
                "Silakan login terlebih dahulu",
                401
            );
        }

        // Memastikan pengguna memiliki hak akses
        if (!allowedRoles.includes(req.user.role)) {
            return errorResponse(
                res,
                "Anda tidak memiliki hak akses",
                403
            );
        }

        next();
    };
};

// Middleware khusus administrator
const adminOnly = roleMiddleware("admin");

// Export middleware agar kompatibel dengan semua
// pola import yang digunakan pada routes
module.exports = roleMiddleware;
module.exports.roleMiddleware = roleMiddleware;
module.exports.adminOnly = adminOnly;