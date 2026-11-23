const Item = require("../models/itemModel");

// Validasi data barang
const validateItem = (body) => {
    const required = [
        "item_name",
        "category",
        "location",
        "storage_location",
        "found_date",
        "found_time"
    ];

    return required.every(
        (field) =>
            typeof body[field] === "string" &&
            body[field].trim().length > 0
    );
};

// Menambahkan barang temuan
const createItem = async (req, res, next) => {
    try {
        if (!validateItem(req.body || {})) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib"
            });
        }

        const item = await Item.create({
            ...req.body,
            created_by: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Barang temuan berhasil ditambahkan",
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// Menampilkan semua barang temuan
const getAllItems = async (req, res, next) => {
    try {
        const items = await Item.findAll(req.query);

        return res.status(200).json({
            success: true,
            message: "Data barang berhasil diambil",
            count: items.length,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

// Menampilkan detail barang
const getItemDetail = async (req, res, next) => {
    try {
        const item = await Item.findById(
            req.params.id
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Barang tidak ditemukan"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail barang berhasil diambil",
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// Memperbarui barang temuan
const updateItem = async (req, res, next) => {
    try {
        if (!validateItem(req.body || {})) {
            return res.status(400).json({
                success: false,
                message: "Lengkapi semua data wajib"
            });
        }

        const item = await Item.update(
            req.params.id,
            req.body
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Barang tidak ditemukan atau tidak dapat diubah"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Barang berhasil diperbarui",
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// Menghapus barang dari katalog
const deleteItem = async (req, res, next) => {
    try {
        const item = await Item.remove(
            req.params.id
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Barang tidak ditemukan atau tidak dapat dihapus"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Barang berhasil diarsipkan"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createItem,
    getAllItems,
    getItemDetail,
    updateItem,
    deleteItem
};