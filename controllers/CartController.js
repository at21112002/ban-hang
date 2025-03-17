const db = require("../models/db");

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    const { idSP, size, quantity, image, name, price } = req.body;

    if (!idSP || !size || !quantity) {
        return res.status(400).json({ error: "Thiếu thông tin sản phẩm" });
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!req.session.user) {
        // 🔹 Chưa đăng nhập: Lưu vào session
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng session chưa
        const existingProduct = req.session.cart.find(item => item.idSP === idSP && item.size === size);
        
        if (existingProduct) {
            existingProduct.quantity += parseInt(quantity);
        } else {
            req.session.cart.push({ idSP, size, quantity: parseInt(quantity), image, name, price });
        }

        return res.json({ message: "Đã thêm vào giỏ hàng (Session)", cart: req.session.cart });
    }

    // 🔹 Đã đăng nhập: Lưu vào database
    try {
        const userId = req.session.user.id;

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng của user chưa
        const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND idSP = ? AND size = ?";
        const [existingCart] = await db.promise().query(checkCartSql, [userId, idSP, size]);

        if (existingCart.length > 0) {
            // Nếu sản phẩm đã có, cập nhật số lượng
            const updateCartSql = "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND idSP = ? AND size = ?";
            await db.promise().query(updateCartSql, [parseInt(quantity), userId, idSP, size]);
        } else {
            // Nếu chưa có, thêm mới vào giỏ hàng của user
            const insertCartSql = "INSERT INTO cart (idSP, size, quantity, image, name, price, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
            await db.promise().query(insertCartSql, [idSP, size, parseInt(quantity), image, name, price, userId]);
        }

        return res.json({ message: "Đã thêm vào giỏ hàng (Database)" });

    } catch (err) {
        console.error("Lỗi khi thêm vào giỏ hàng:", err);
        return res.status(500).json({ error: "Lỗi server" });
    }
};
exports.getCart = async (req, res) => {
    if (!req.session.user) {
        // 🔹 Nếu chưa đăng nhập, trả về giỏ hàng trong session
        return res.json({ cart: req.session.cart || [] });
    }

    try {
        const userId = req.session.user.id;
        const sql = "SELECT * FROM cart WHERE user_id = ?";
        const [cartItems] = await db.promise().query(sql, [userId]);

        return res.json({ cart: cartItems });
    } catch (err) {
        console.error("Lỗi khi lấy giỏ hàng:", err);
        return res.status(500).json({ error: "Lỗi server" });
    }
};
exports.viewCart = async (req, res) => {
    let cart = [];

    if (req.session.user) {
        // 🔹 Nếu đã đăng nhập, lấy giỏ hàng từ database
        const [cartItems] = await db.promise().query("SELECT * FROM cart WHERE user_id = ?", [req.session.user.id]);
        cart = cartItems;
    } else {
        // 🔹 Nếu chưa đăng nhập, lấy giỏ hàng từ session
        cart = req.session.cart || [];
    }

    res.render("cart", { cart });
};

// Xoá sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
    const { idSP, size } = req.body;

    if (!idSP || !size) {
        return res.status(400).json({ error: "Thiếu thông tin sản phẩm" });
    }

    if (!req.session.user) {
        // Xoá trong session nếu chưa đăng nhập
        req.session.cart = req.session.cart.filter(item => !(item.idSP === idSP && item.size === size));
        return res.json({ message: "Đã xoá sản phẩm khỏi giỏ hàng (Session)", cart: req.session.cart });
    }

    try {
        const userId = req.session.user.id;
        const deleteCartSql = "DELETE FROM cart WHERE user_id = ? AND idSP = ? AND size = ?";
        await db.promise().query(deleteCartSql, [userId, idSP, size]);

        return res.json({ message: "Đã xoá sản phẩm khỏi giỏ hàng (Database)" });
    } catch (err) {
        console.error("Lỗi khi xoá sản phẩm khỏi giỏ hàng:", err);
        return res.status(500).json({ error: "Lỗi server" });
    }
};

// Xoá toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
    if (!req.session.user) {
        req.session.cart = [];
        return res.json({ message: "Đã xoá toàn bộ giỏ hàng (Session)" });
    }

    try {
        const userId = req.session.user.id;
        const clearCartSql = "DELETE FROM cart WHERE user_id = ?";
        await db.promise().query(clearCartSql, [userId]);

        return res.json({ message: "Đã xoá toàn bộ giỏ hàng (Database)" });
    } catch (err) {
        console.error("Lỗi khi xoá toàn bộ giỏ hàng:", err);
        return res.status(500).json({ error: "Lỗi server" });
    }
};

// CartController.js


// Thêm mã giảm giá vào giỏ hàng
exports.applyDiscount = async (req, res) => {
    const { discountCode } = req.body;
    if (!discountCode) {
        return res.status(400).json({ error: "Vui lòng nhập mã giảm giá" });
    }

    try {
        // Kiểm tra mã giảm giá
        const [discount] = await db.promise().query(
            "SELECT * FROM discount_codes WHERE code = ? AND quantitydiscount > 0 AND expiration_date > NOW()",
            [discountCode]
        );

        if (discount.length === 0) {
            return res.status(400).json({ error: "Mã giảm giá không hợp lệ, hết lượt hoặc đã hết hạn." });
        }

        // Lấy giỏ hàng từ database
        const userId = req.session.user ? req.session.user.id : null;
        const [cartItems] = await db.promise().query(
            "SELECT * FROM cart WHERE user_id = ?",
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Giỏ hàng của bạn đang trống." });
        }

        // Tính tổng tiền
        let totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        // Áp dụng giảm giá
        const discountValue = discount[0].discount_percentage;
        const discountedTotal = totalPrice - (totalPrice * discountValue) / 100;
        req.session.discount = {
            code: discountCode,
            discount_percent: discountValue
        };

        res.json({
            message: "Áp dụng mã giảm giá thành công!",
            discountedTotal
        });

    } catch (err) {
        console.error("Lỗi khi áp dụng mã giảm giá:", err);
        return res.status(500).json({ error: "Lỗi server" });
    }
};


// Thanh toán giỏ hàng
const axios = require('axios');
const crypto = require('crypto');

// Thanh toán giỏ hàng
exports.checkout = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Bạn cần đăng nhập để thanh toán." });
    }

    const userId = req.session.user.id;
    const { paymentMethod } = req.body;

    if (!['Chưa thanh toán', 'Đã thanh toán online'].includes(paymentMethod)) {
        return res.status(400).json({ error: "Phương thức thanh toán không hợp lệ." });
    }

    try {
        const [cartItems] = await db.promise().query("SELECT * FROM cart WHERE user_id = ?", [userId]);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Giỏ hàng của bạn đang trống." });
        }

        let insufficientStock = [];

        for (const item of cartItems) {
            const [productSize] = await db.promise().query(
                "SELECT quantity FROM product_size WHERE idSP = ? AND size = ?",
                [item.idSP, item.size]
            );

            if (productSize.length === 0 || productSize[0].quantity < item.quantity) {
                insufficientStock.push({
                    name: item.name,
                    size: item.size,
                    available: productSize[0].quantity || 0
                });
            }
        }

        if (insufficientStock.length > 0) {
            return res.status(400).json({
                error: "Một số sản phẩm không đủ hàng.",
                insufficientStock
            });
        }

        let totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

        if (req.session.discount) {
            const discountAmount = (totalPrice * req.session.discount.discount_percent) / 100;
            totalPrice -= discountAmount;
            await db.promise().query("UPDATE discount_codes SET quantitydiscount = quantitydiscount - 1 WHERE code = ?", [req.session.discount.code]);
            req.session.discount = null;
        }

        const orderStatus = 'Đã tạo đơn hàng';

        const [orderResult] = await db.promise().query(
            "INSERT INTO orders (user_id, total_price, payment_method, order_status) VALUES (?, ?, ?, ?)",
            [userId, totalPrice, paymentMethod, orderStatus]
        );
        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await db.promise().query(
                "UPDATE product_size SET quantity = quantity - ? WHERE idSP = ? AND size = ?",
                [item.quantity, item.idSP, item.size]
            );

            await db.promise().query(
                "INSERT INTO order_items (order_id, idSP, size, quantity, price) VALUES (?, ?, ?, ?, ?)",
                [orderId, item.idSP, item.size, item.quantity, item.price]
            );
        }

        await db.promise().query("DELETE FROM cart WHERE user_id = ?", [userId]);

        if (paymentMethod === 'Đã thanh toán online') {
            const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            const partnerCode = 'MOMOBKUN20180529';
            const accessKey = 'klm05TvNBzhg7h7j';
            const serectkey = 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa';
            const orderInfo = "Thanh toán qua MoMo";
            const ipnUrl = "http://localhost:3000/cart";
            const redirectUrl = "http://localhost:3000/cart";
            const requestId = `${Date.now()}`;
            const momoOrderId = `DH${Date.now()}`;
            const requestType = "payWithATM";
            const extraData = "";

            const rawHash = `accessKey=${accessKey}&amount=${totalPrice}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            const signature = crypto.createHmac('sha256', serectkey).update(rawHash).digest('hex');

            const momoData = {
                partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId,
                amount: totalPrice,
                orderId: momoOrderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang: 'vi',
                extraData,
                requestType,
                signature
            };

            const response = await axios.post(endpoint, momoData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });

            if (response.data && response.data.payUrl) {
                return res.json({ message: "Đặt hàng thành công!", orderId, totalPrice, payUrl: response.data.payUrl });
            } else {
                return res.status(400).json({ error: "Không thể tạo liên kết thanh toán MoMo." });
            }
        }

        res.json({ message: "Đặt hàng thành công!", orderId, totalPrice });
    } catch (err) {
        console.error("Lỗi khi thanh toán:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
};
