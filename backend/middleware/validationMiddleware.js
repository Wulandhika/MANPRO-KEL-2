const {
    validationResult,
    body
} = require("express-validator");

// Menangani hasil validasi
const validationMiddleware = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validasi data gagal",
            errors: errors.array().map((error) => ({
                field: error.path || error.param,
                message: error.msg
            }))
        });
    }

    next();
};

// Validasi registrasi
const validateRegister = [
    body("name")
        .isString()
        .withMessage("Nama harus berupa teks")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Nama wajib diisi")
        .isLength({ min: 3, max: 100 })
        .withMessage("Nama harus 3-100 karakter"),

    body("email")
        .isEmail()
        .withMessage("Format email tidak valid")
        .trim(),

    body("password")
        .isString()
        .withMessage("Password harus berupa teks")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Password minimal 8 karakter"),

    validationMiddleware
];

// Validasi login
const validateLogin = [
    body("email")
        .isEmail()
        .withMessage("Format email tidak valid")
        .trim(),

    body("password")
        .isString()
        .withMessage("Password harus berupa teks")
        .bail()
        .notEmpty()
        .withMessage("Password wajib diisi"),

    validationMiddleware
];

// Validasi laporan barang
const validateReport = [
    body("description")
        .isString()
        .withMessage("Deskripsi harus berupa teks")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Deskripsi wajib diisi"),

    body("location")
        .isString()
        .withMessage("Lokasi harus berupa teks")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Lokasi wajib diisi"),

    validationMiddleware
];

// Validasi pengajuan klaim
const validateClaim = [
    body("item_id")
        .isInt({ min: 1 })
        .withMessage("ID barang tidak valid"),

    body("description")
        .isString()
        .withMessage("Deskripsi harus berupa teks")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Deskripsi klaim wajib diisi"),

    validationMiddleware
];

// Validasi field wajib secara dinamis
const validateRequired = (...fields) => {
    return [
        ...fields.map((field) =>
            body(field)
                .exists({ values: "null" })
                .withMessage(`${field} wajib diisi`)
                .bail()
                .notEmpty({ ignore_whitespace: true })
                .withMessage(`${field} tidak boleh kosong`)
        ),

        validationMiddleware
    ];
};

// Export middleware
module.exports = validationMiddleware;

module.exports.validationMiddleware =
    validationMiddleware;

module.exports.validate = validationMiddleware;
module.exports.validateRegister = validateRegister;
module.exports.validateLogin = validateLogin;
module.exports.validateReport = validateReport;
module.exports.validateClaim = validateClaim;
module.exports.validateRequired = validateRequired;