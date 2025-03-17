const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders1', orderController.getAllOrders);
router.get('/orders1/:id', orderController.getOrderDetails);
router.post('/orders1/:id/updateStatus', orderController.updateOrderStatus);

module.exports = router;
