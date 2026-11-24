const Item = require("../models/itemModel");

const {
    refreshAllMatching
} = require("../services/matchingService");

// Validasi barang temuan
const validateItem = (body = {}) => {
    const limits = {
        item_name: 255,
        category: 100,
        location: 255,
        storage_location: 255,
        found_date: 10,
        found_time: 8
    };

    const valid = Object.entries(limits).every(
        ([field, max]) =>
            typeof body[field] === "string" &&
            body[field].trim().length > 0 &&
            body[field].trim().length <= max
    );

    if (!valid) return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.found_date)) {
        return false;
    }

    const date = new Date(
        body.found_date + "T00:00:00Z"
    );

    if (
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== body.found_date
    ) {
        return false;
    }

    if (
        !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/
            .test(body.found_time)
    ) {
        return false;
    }

    const optional = {
        color: 100,
        brand: 100,
        description: 2000
    };

    return Object.entries(optional).every(
        ([field, max]) =>
            body[field] == null ||
            (
                typeof body[field] === "string" &&
                body[field].length <= max
            )
    );
};

// Menjalankan pencocokan ulang AI
const runMatching = async () => {
    try {
        return await refreshAllMatching();

    } catch (error) {
        console.error(
            "[ITEM AI ERROR]",
            error.message
        );

        return {
            success: false,
            status: "failed",
            message: "Data barang tersimpan, tetapi AI gagal diperbarui"
        };
    }
};

// Menambahkan barang temuan
const createItem = async (req, res, next) => {
    try {
        if (!validateItem(req.body || {})) {
            return res.status(400).json({
                success: false,
                message: "Data barang tidak lengkap atau tidak valid"
            });
        }

        const item = await Item.create({
            ...req.body,
            created_by: req.user.id
        });

        const matching = await runMatching();

        return res.status(201).json({
            success: true,
            message: "Barang temuan berhasil ditambahkan",
            data: item,
            matching
        });

    } catch (error) {
        next(error);
    }
};

// Menampilkan katalog barang
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
                message: "Data barang tidak lengkap atau tidak valid"
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

        const matching = await runMatching();

        return res.status(200).json({
            success: true,
            message: "Barang berhasil diperbarui",
            data: item,
            matching
        });

    } catch (error) {
        next(error);
    }
};

// Mengarsipkan barang
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

        const matching = await runMatching();

        return res.status(200).json({
            success: true,
            message: "Barang berhasil diarsipkan",
            matching
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