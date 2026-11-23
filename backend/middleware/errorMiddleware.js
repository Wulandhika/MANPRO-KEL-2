const { errorResponse } = require("../utils/response");

const notFound = (req, res) => {
  return errorResponse(
    res,
    "Endpoint tidak ditemukan",
    404
  );
};

const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return errorResponse(
      res,
      "Ukuran file maksimal 5 MB",
      400
    );
  }

  if (err.type === "entity.parse.failed") {
    return errorResponse(
      res,
      "Format JSON tidak valid",
      400
    );
  }

  return errorResponse(
    res,
    "Terjadi kesalahan pada server",
    500
  );
};

module.exports = {
  notFound,
  errorHandler,
};