const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Lokasi penyimpanan foto
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Format gambar yang diperbolehkan
const allowedTypes = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + crypto.randomUUID();

        const extension = allowedTypes[file.mimetype];

        cb(null, uniqueName + extension);
    }
});

// Validasi format file
const fileFilter = (req, file, cb) => {
    if (
        !Object.prototype.hasOwnProperty.call(
            allowedTypes,
            file.mimetype
        )
    ) {
        const error = new Error(
            "File harus berformat JPG, JPEG, PNG, atau WEBP"
        );

        error.statusCode = 400;

        return cb(error);
    }

    cb(null, true);
};

// Konfigurasi Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    }
});

// Upload satu gambar
const uploadSingle = upload.single("image");

// Upload maksimal lima gambar
const uploadMultiple = upload.array("images", 5);

// Export middleware
module.exports = upload;

module.exports.upload = upload;
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;