const DiscountCode = require('../models/DiscountCode');

exports.getAllDiscounts = async (req, res) => {
    const discounts = await DiscountCode.getAll();
    res.render('admin/discountsadmin', { discounts });
};

exports.getAddForm = (req, res) => {
    res.render('admin/addDiscount');
};

exports.createDiscount = async (req, res) => {
    const { code, discount_percentage, expiration_date, quantitydiscount } = req.body;
    await DiscountCode.create(code, discount_percentage, expiration_date, quantitydiscount);
    res.redirect('/admin/discountsadmin');
};

exports.getEditForm = async (req, res) => {
    const discount = await DiscountCode.getById(req.params.id);
    res.render('admin/editDiscount', { discount });
};

exports.updateDiscount = async (req, res) => {
    const { code, discount_percentage, expiration_date, quantitydiscount } = req.body;
    await DiscountCode.update(req.params.id, code, discount_percentage, expiration_date, quantitydiscount);
    res.redirect('/admin/discountsadmin');
};

exports.deleteDiscount = async (req, res) => {
    await DiscountCode.delete(req.params.id);
    res.redirect('/admin/discountsadmin');
};