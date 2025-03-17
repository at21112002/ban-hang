const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/:id', (req, res) => {
    const idSP = req.params.id;
    const sql = "SELECT * FROM products WHERE idSP = ?";
    db.query(sql, [idSP], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Lỗi lấy sản phẩm");
        }
        if (result.length > 0) {
            res.render('productDetail', { product: result[0] });
        } else {
            res.send("Sản phẩm không tồn tại!");
        }
    });
});

module.exports = router;
