const express = require("express");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
    getProducts,
    createProduct,
    getDetailProduct,
    deleteProduct,
    updateProduct,
} = require("../controller/ProductController.js");

// Midleware untuk upload file dengan multer
// Vercel/serverless filesystem bersifat read-only, gunakan temp dir.
const uploadDir = path.join(os.tmpdir(), "uploads", "products");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

const router = express.Router();

// Endpoint API
router.get("/", getProducts);
router.get("/:id", getDetailProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id", upload.single("thumbnail"), updateProduct);
router.post("/", upload.single("thumbnail"), createProduct);

module.exports = router;