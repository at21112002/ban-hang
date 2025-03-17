const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Hiển thị trang đăng nhập & đăng ký
router.get("/login", (req, res) => {
    res.render("login");
});
router.get("/register", (req, res) => {
    res.render("register");
});

// Xử lý đăng ký
router.post("/register", authController.register);

// 🔹 Xử lý đăng nhập
router.post("/login", authController.login);  // Gọi đúng hàm login


router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Lỗi đăng xuất!");
        }
        res.redirect("/login");
    });
});
router.get("/user-details", authController.getUserDetails);
router.get("/change-password", (req, res) => res.render("changePassword"));
router.post("/change-password", authController.changePassword);
router.get('/orders', authController.getUserOrders);
router.post('/orders/update-confirmation', authController.updateUserConfirmation);
module.exports = router;