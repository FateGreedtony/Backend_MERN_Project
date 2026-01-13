const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { uploadFile } = require('../controller/FileController');

// Middleware untuk opload file dengan multer

// Vercel/serverless filesystem bersifat read-only, gunakan temp dir.
const uploadDir = path.join(os.tmpdir(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;