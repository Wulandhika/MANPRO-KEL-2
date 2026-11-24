const express = require("express");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const {
    adminOnly
} = require("../middleware/roleMiddleware");

const {
    createItem,
    getAllItems,
    getItemDetail,
    updateItem,
    deleteItem
} = require("../controllers/itemController");

const router = express.Router();

// ========================================
// SEMUA ENDPOINT WAJIB LOGIN
// ========================================

router.use(authMiddleware);

// ========================================
// USER DAN ADMIN
// ========================================

// Menampilkan katalog barang temuan
router.get("/", getAllItems);

// Mencari barang temuan
router.get("/search", getAllItems);

// Melihat detail barang temuan
router.get("/:id", getItemDetail);

// Melaporkan barang temuan
router.post("/", createItem);

// ========================================
// KHUSUS ADMIN
// ========================================

// Memperbarui barang temuan
router.put(
    "/:id",
    adminOnly,
    updateItem
);

// Mengarsipkan barang temuan
router.delete(
    "/:id",
    adminOnly,
    deleteItem
);

module.exports = router;