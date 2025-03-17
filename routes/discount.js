const express = require('express');
const router = express.Router();
const DiscountCode = require('../models/DiscountCode');
const discountController = require('../controllers/discountController');


router.get('/admin/discountsadmin', discountController.getAllDiscounts);
router.get('/discountsadmin', discountController.getAllDiscounts);

router.get('/admin/addDiscount', discountController.getAddForm);
router.post('/admin/addDiscount/add', discountController.createDiscount);

router.get('/admin/editDiscount/edit/:id', discountController.getEditForm);
router.post('/admin/editDiscount/edit/:id', discountController.updateDiscount);

router.get('/admin/discountsadmin/delete/:id', discountController.deleteDiscount);

module.exports = router;



