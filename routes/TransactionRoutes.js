const express = require('express');
const { createTransaction } = require('../controller/TransactionController.js');

const router = express.Router();

// Endpoint API
router.post('/', createTransaction);

module.exports = router;