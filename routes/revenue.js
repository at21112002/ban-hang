const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// Route hiển thị doanh số
router.get('/revenue', revenueController.showRevenue);
router.get('/soldProductsrevenue', revenueController.showSoldProducts);

module.exports = router;
