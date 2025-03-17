// Import các thư viện cần thiết
const express = require('express');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios'); // Dùng axios để gọi API
const Category = require("./models/categoryModel");
// Import các route
const productRoutes = require('./routes/productRoutes');
const blogRoutes = require('./routes/blogRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes'); // Route cho đăng ký, đăng nhập
const homeRoutes = require('./routes/index');  // Route cho trang chủ
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const discount  = require('./routes/discount');
const productDetailRoute = require('./routes/productDetail');
const orderRoutes = require('./routes/orderRoutes');
const revenue = require('./routes/revenue');


// Set view engine là EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Cấu hình thư mục views

// Sử dụng body-parser để xử lý dữ liệu từ form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sử dụng thư mục public cho các tệp tĩnh (CSS, JS, ảnh,...)
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình session cho người dùng
app.use(session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    res.locals.session = req.session; // Cho phép dùng session trong EJS
    next();
});


// Route lấy danh sách tỉnh
app.get('/api/provinces', async (req, res) => {
    try {
        const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu tỉnh' });
    }
});

// Route lấy danh sách huyện theo tỉnh
app.get('/api/districts/:provinceId', async (req, res) => {
    const provinceId = req.params.provinceId;
    try {
        const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provinceId}.htm`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu huyện' });
    }
});

// Route lấy danh sách xã theo huyện
app.get('/api/wards/:districtId', async (req, res) => {
    const districtId = req.params.districtId;
    try {
        const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy dữ liệu xã' });
    }
});
app.use((req, res, next) => {
    Category.getAllCategories((err, results) => {
        if (!err) {
            res.locals.categories = results; // Lưu danh mục vào biến cục bộ
        }
        next();
    });
});
// Sử dụng các routes
app.use('/', homeRoutes);   // Trang chủ
app.use('/', authRoutes);   // Trang đăng ký, đăng nhập
app.use('/', productRoutes);
app.use('/', categoryRoutes);
app.use('/', blogRoutes);
app.use('/', discount);
app.use('/productDetail', productDetailRoute);

app.use(aboutRoutes);
app.use("/api/cart", cartRoutes);
app.use("/", cartRoutes);
app.use("/", orderRoutes);
app.use("/", revenue);
app.use(adminRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
