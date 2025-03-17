const db = require("../models/db");
const bcrypt = require("bcryptjs");

// Hàm xử lý đăng ký người dùng
exports.register = (req, res) => {
    const { tenusers, email, sdt, diachi, ngaysinh, provinceId, districtId, wardId, password, quyen } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = `INSERT INTO users (tenusers, email, sdt, diachi, ngaysinh, provinceId, districtId, wardId, quyen, password) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [tenusers, email, sdt, diachi, ngaysinh, provinceId, districtId, wardId, quyen, hashedPassword], (err, result) => {
        if (err) {
            console.error("Lỗi đăng ký người dùng: " + err.stack);
            return res.status(500).send("Lỗi hệ thống");
        }
        res.redirect("/login");
    });
};

// 🔹 Hàm xử lý đăng nhập người dùng
exports.login = (req, res) => {
    const { email, password } = req.body;

    // Kiểm tra xem email có tồn tại trong CSDL không
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Lỗi đăng nhập:", err);
            return res.status(500).send("Lỗi hệ thống");
        }

        if (results.length === 0) {
            return res.status(401).send("Email hoặc mật khẩu không đúng");
        }

        const user = results[0]; // Lấy thông tin người dùng

        // So sánh mật khẩu đã nhập với mật khẩu đã mã hóa trong DB
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send("Email hoặc mật khẩu không đúng");
        }

        // Lưu thông tin đăng nhập vào session
        req.session.user = {
            id: user.id,
            email: user.email,
            quyen: user.quyen
        };

        // 🔹 Sau khi đăng nhập, hợp nhất giỏ hàng từ session vào database
        if (req.session.cart && req.session.cart.length > 0) {
            for (const item of req.session.cart) {
                const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND idSP = ? AND size = ?";
                const [existingCart] = await db.promise().query(checkCartSql, [user.id, item.idSP, item.size]);

                if (existingCart.length > 0) {
                    const updateCartSql = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND idSP = ? AND size = ?";
                    await db.promise().query(updateCartSql, [item.quantity, user.id, item.idSP, item.size]);
                } else {
                    const insertCartSql = "INSERT INTO cart (idSP, size, quantity, image, name, price, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    await db.promise().query(insertCartSql, [item.idSP, item.size, item.quantity, item.image, item.name, item.price, user.id]);
                }
            }
            req.session.cart = []; // Xóa giỏ hàng session sau khi hợp nhất
        }


        // Chuyển hướng dựa vào quyền
        if (user.quyen === "admin") {
            res.redirect("/admin"); // Chuyển sang trang admin
        } else {
            res.redirect("/"); // Chuyển sang trang bán hàng
        }
    });
};

// 🔹 Hàm xử lý đăng xuất người dùng
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};

// Hiển thị trang đăng nhập
exports.showLoginPage = (req, res) => {
    res.render("login");
};
// Hàm hiển thị thông tin chi tiết người dùng
exports.getUserDetails = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Bạn chưa đăng nhập");
    }

    const userId = req.session.user.id;
    const sql = `
        SELECT tenusers, email, sdt, diachi, ngaysinh, provinceId, districtId, wardId, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at 
        FROM users 
        WHERE id = ?`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi lấy thông tin người dùng:", err);
            return res.status(500).send("Lỗi hệ thống");
        }

        if (results.length === 0) {
            return res.status(404).send("Không tìm thấy thông tin người dùng");
        }

        res.render("userDetails", { user: results[0] }); // Trả về trang userDetails với dữ liệu người dùng
    });
};

// 🔐 Hàm thay đổi mật khẩu người dùng
exports.changePassword = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Bạn chưa đăng nhập");
    }

    const userId = req.session.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
        return res.render("changePassword", { message: "Mật khẩu mới và xác nhận mật khẩu không khớp", status: "error" });
    }

    // Lấy mật khẩu hiện tại từ DB
    const getPasswordSql = "SELECT password FROM users WHERE id = ?";
    db.query(getPasswordSql, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi lấy mật khẩu hiện tại:", err);
            return res.render("changePassword", { message: "Lỗi hệ thống", status: "error" });
        }

        if (results.length === 0) {
            return res.render("changePassword", { message: "Không tìm thấy người dùng", status: "error" });
        }

        const currentPassword = results[0].password;

        // So sánh mật khẩu cũ nhập vào với mật khẩu trong DB
        if (!bcrypt.compareSync(oldPassword, currentPassword)) {
            return res.render("changePassword", { message: "Mật khẩu cũ không đúng", status: "error" });
        }

        // Mã hóa mật khẩu mới và cập nhật vào DB
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        const updatePasswordSql = "UPDATE users SET password = ? WHERE id = ?";
        
        db.query(updatePasswordSql, [hashedNewPassword, userId], (err) => {
            if (err) {
                console.error("Lỗi cập nhật mật khẩu:", err);
                return res.render("changePassword", { message: "Lỗi hệ thống", status: "error" });
            }

            // Thông báo thành công
            return res.render("changePassword", { message: "Thay đổi mật khẩu thành công!", status: "success" });
        });
    });
};
// Hàm xem chi tiết đơn hàng của người dùng đã đăng nhập
exports.getUserOrders = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Bạn chưa đăng nhập");
    }

    const userId = req.session.user.id;

    const sql = `
        SELECT 
            o.id AS order_id, o.order_date, o.total_price, o.payment_method, o.order_status, o.user_confirmation,
            oi.idSP, oi.size, oi.quantity, oi.price,
            p.name, p.image
        FROM 
            orders o
        JOIN 
            order_items oi ON o.id = oi.order_id
        JOIN 
            products p ON oi.idSP = p.idSP
        WHERE 
            o.user_id = ?
        ORDER BY 
            o.order_date DESC;
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Lỗi lấy danh sách đơn hàng:", err);
            return res.status(500).send("Lỗi hệ thống");
        }

        if (results.length === 0) {
            return res.render("userOrders", { orders: [], message: "Bạn chưa có đơn hàng nào!" });
        }

        // Gom nhóm đơn hàng theo order_id
        const orders = {};
        results.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    order_id: row.order_id,
                    order_date: new Date(row.order_date).toLocaleDateString('vi-VN'),
                    total_price: row.total_price,
                    payment_method: row.payment_method,
                    order_status: row.order_status,
                    user_confirmation: row.user_confirmation,
                    items: []
                };
            }
            orders[row.order_id].items.push({
                idSP: row.idSP,
                name: row.name,
                image: row.image,
                price: row.price,
                size: row.size,
                quantity: row.quantity
            });
        });

        res.render("userOrders", { orders: Object.values(orders) });
    });
};


// Hàm cập nhật user_confirmation
exports.updateUserConfirmation = (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Bạn chưa đăng nhập");
    }

    const { orderId, userConfirmation } = req.body;

    if (!orderId || typeof userConfirmation === 'undefined') {
        return res.status(400).send("Thiếu thông tin cần thiết");
    }

    let sql = `UPDATE orders SET user_confirmation = ? WHERE id = ?`;

    db.query(sql, [userConfirmation, orderId], (err, result) => {
        if (err) {
            console.error("Lỗi cập nhật user_confirmation:", err);
            return res.status(500).send("Lỗi hệ thống");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Không tìm thấy đơn hàng");
        }

        // Nếu user_confirmation là "Đã nhận", kiểm tra và cập nhật payment_method nếu cần
        if (userConfirmation === "Đã nhận") {
            const checkPaymentSql = `SELECT payment_method FROM orders WHERE id = ?`;
            db.query(checkPaymentSql, [orderId], (err, rows) => {
                if (err) {
                    console.error("Lỗi khi kiểm tra payment_method:", err);
                    return res.status(500).send("Lỗi hệ thống");
                }

                const currentPaymentMethod = rows[0].payment_method;

                // Nếu payment_method là "Chưa thanh toán", cập nhật thành "Đã thanh toán"
                if (currentPaymentMethod === "Chưa thanh toán") {
                    const updatePaymentSql = `UPDATE orders SET payment_method = 'Đã thanh toán' WHERE id = ?`;
                    db.query(updatePaymentSql, [orderId], (err) => {
                        if (err) {
                            console.error("Lỗi cập nhật payment_method:", err);
                            return res.status(500).send("Lỗi hệ thống khi cập nhật payment_method");
                        }
                        res.send("Cập nhật user_confirmation và payment_method thành công");
                    });
                } else {
                    res.send("Cập nhật user_confirmation thành công");
                }
            });
        } else {
            res.send("Cập nhật user_confirmation thành công");
        }
    });
};



