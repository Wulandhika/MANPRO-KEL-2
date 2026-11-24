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

// PUBLIC ROUTES

// Menampilkan seluruh barang temuan
router.get("/", getAllItems);

// Pencarian barang temuan
router.get("/search", getAllItems);

// Detail barang temuan
router.get("/:id", getItemDetail);

// ADMIN ROUTES

// Menambahkan barang temuan
router.post(
    "/",
    authMiddleware,
    adminOnly,
    createItem
);

// Memperbarui barang temuan
router.put(
    "/:id",
    authMiddleware,
    adminOnly,
    updateItem
);

// Menghapus barang temuan
router.delete(
    "/:id",
    authMiddleware,
    adminOnly,
    deleteItem
);

module.exports = router;