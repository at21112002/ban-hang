const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');

router.get("/cart", cartController.viewCart);

router.post("/add", cartController.addToCart);
router.post('/cart/remove', cartController.removeFromCart);
router.post('/cart/clear', cartController.clearCart);
router.post('/cart/checkout', cartController.checkout);
router.post('/cart/apply-discount', cartController.applyDiscount);

module.exports = router;
