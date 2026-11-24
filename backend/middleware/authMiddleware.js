const jwt = require("jsonwebtoken");
const env = require("../config/env");
const db = require("../config/db");
const { errorResponse } = require("../utils/response");

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return errorResponse(
      res,
      "Silakan login terlebih dahulu",
      401
    );
  }

  const token = authorization.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded.id) {
      return errorResponse(res, "Token tidak valid", 401);
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        "Sesi login telah berakhir",
        401
      );
    }

    return errorResponse(res, "Token tidak valid", 401);
  }

  try {
    const result = await db.query(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return errorResponse(
        res,
        "Pengguna tidak ditemukan",
        401
      );
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return errorResponse(
        res,
        "Akun Anda telah dinonaktifkan",
        403
      );
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;