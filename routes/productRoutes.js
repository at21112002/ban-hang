const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');

router.get("/product/:idSP", productController.productDetail);
router.get('/products', productController.products);
router.get('/admin/productsadmin', productController.productsadmin);
router.get('/category/:idDM',  productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
const path = require('path');



router.get("/admin/productsadmin", (req, res) => {
    productController.Product.getAll((err, products) => {
        if (err) {
            console.error("Lỗi lấy sản phẩm:", err);
            return res.status(500).send("Lỗi server");
        }
        console.log("Danh sách sản phẩm:", products); // Debug dữ liệu
        res.render("admin/productsadmin", { products: products || [] });
    });
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Thư mục lưu ảnh
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file duy nhất
    }
});

const upload = multer({ storage: storage });
// Hiển thị form thêm sản phẩm
router.get("/admin/addProduct", (req, res) => {
    productController.Category.getAllDM((err, categories) => {
        if (err) {
            console.error("Lỗi lấy danh mục:", err);
            return res.status(500).send("Lỗi server");
        }
        res.render("admin/addProduct", { categories });
    });
});
// Xử lý thêm sản phẩm
router.post("/admin/productsadmin/add", upload.single("image"), (req, res) => {
    const { name, price, description, idDM, sizes } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = { name, price, description, image, idDM };
    const sizeList = JSON.parse(sizes); // sizes sẽ là JSON string từ form

    productController.Product.create(product, sizeList, (err) => {
        if (err) return res.status(500).send("Lỗi server");
        res.redirect("/admin/productsadmin");
    });
});


// Hiển thị form chỉnh sửa sản phẩm
router.get("/admin/productsadmin/edit/:idSP", (req, res) => {
    productController.Product.getById(req.params.idSP, (err, product) => {
        if (err) {
            console.error("Lỗi lấy sản phẩm:", err);
            return res.status(500).send("Lỗi server");
        }
        if (!product) {
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        
        res.render("admin/editProduct", { product });
    });
});
// Xử lý cập nhật sản phẩm
router.post("/admin/productsadmin/edit/:idSP", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, idDM, sizes, quantities } = req.body;
        let image = req.file ? `/uploads/${req.file.filename}` : req.body.oldImage;

        // Chuyển đổi dữ liệu sizes và quantities thành mảng đối tượng
        let sizeArray = [];
        if (Array.isArray(sizes) && Array.isArray(quantities)) {
            sizeArray = sizes.map((size, index) => ({
                size,
                quantity: parseInt(quantities[index], 10)
            }));
        }

        await productController.Product.update(req.params.idSP, { name, price, description, idDM, image }, sizeArray);
        res.redirect("/admin/productsadmin");
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
});





// Xóa sản phẩm
router.get("/admin/productsadmin/delete/:idSP", (req, res) => {
    productController.Product.delete(req.params.idSP, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi server");
        }
        res.redirect("/productsadmin");
    });
});

module.exports = router;
