const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.quyen === "admin") {
        return next();
    }
    res.redirect("/"); // Nếu không phải admin, quay về trang chính
}

// Trang admin
router.get("/admin", isAdmin, adminController.admin);

module.exports = router;
