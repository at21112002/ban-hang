
const db = require('../models/db'); // Kết nối CSDL

// Hiển thị danh sách blog
exports.getBlogs = async (req, res) => {
    try {
        const sql = `
            SELECT blogs.*, 
                   products.name AS product_name, 
                   categories.name AS category_name
            FROM blogs
            LEFT JOIN products ON blogs.idSP = products.idSP
            LEFT JOIN categories ON blogs.idDM = categories.idDM
        `;

        db.query(sql, (error, results) => {
            if (error) {
                console.error("Lỗi truy vấn MySQL:", error.message);
                return res.status(500).send("Lỗi khi tải blog");
            }

            // Kiểm tra dữ liệu lấy ra
            console.log("Blogs data:", results);

            res.render('admin/blogsadmin', { blogs: results }); // ❌ Không có `products`
        });
    } catch (error) {
        console.error("Lỗi getBlogs:", error.message);
        res.status(500).send("Lỗi khi tải blog");
    }
};





// Hiển thị form thêm blog
exports.getAddBlog = (req, res) => {
    try {
        db.query("SELECT idSP, name FROM products", (err, products) => {
            if (err) {
                console.error("Lỗi lấy danh sách sản phẩm:", err.message);
                return res.status(500).send("Lỗi khi tải sản phẩm");
            }

            db.query("SELECT idDM, name FROM categories", (err, categories) => {
                if (err) {
                    console.error("Lỗi lấy danh mục:", err.message);
                    return res.status(500).send("Lỗi khi tải danh mục");
                }

                res.render('admin/addBlog', { products, categories });
            });
        });
    } catch (error) {
        console.error("Lỗi không mong muốn:", error.message);
        res.status(500).send("Lỗi hệ thống");
    }
};


// Xử lý thêm blog
exports.postAddBlog = (req, res) => {
    const { title, content, idSP, idDM } = req.body;
    
    db.query(
        "INSERT INTO blogs (title, content, idSP, idDM, created_at) VALUES (?, ?, ?, ?, NOW())",
        [title, content, idSP || null, idDM || null],
        (err, result) => {
            if (err) {
                console.error("Lỗi khi thêm blog:", err.message);
                return res.status(500).send("Lỗi khi thêm blog");
            }
            res.redirect('/admin/blogsadmin');
        }
    );
};


// Hiển thị form sửa blog
exports.getEditBlog = (req, res) => {
    const blogId = req.params.id;
    
    db.query("SELECT * FROM blogs WHERE idBlog = ?", [blogId], (err, blogs) => {
        if (err) {
            console.error("Lỗi lấy blog:", err.message);
            return res.status(500).send("Lỗi khi tải blog");
        }

        const blog = blogs.length > 0 ? blogs[0] : null;

        db.query("SELECT idSP, name FROM products", (err, products) => {
            if (err) {
                console.error("Lỗi lấy danh sách sản phẩm:", err.message);
                return res.status(500).send("Lỗi khi tải sản phẩm");
            }

            db.query("SELECT idDM, name FROM categories", (err, categories) => {
                if (err) {
                    console.error("Lỗi lấy danh mục:", err.message);
                    return res.status(500).send("Lỗi khi tải danh mục");
                }

                res.render('admin/editBlog', { blog, products, categories });
            });
        });
    });
};


// Xử lý cập nhật blog
exports.postEditBlog = (req, res) => {
    const blogId = req.params.id;
    const { title, content, idSP, idDM } = req.body;

    db.query(
        "UPDATE blogs SET title = ?, content = ?, idSP = ?, idDM = ? WHERE idBlog = ?",
        [title, content, idSP || null, idDM || null, blogId],
        (err, result) => {
            if (err) {
                console.error("Lỗi cập nhật blog:", err.message);
                return res.status(500).send("Lỗi khi cập nhật blog");
            }
            res.redirect('/admin/blogsadmin');
        }
    );
};


// Xóa blog
exports.deleteBlog = (req, res) => {
    const blogId = req.params.id;

    db.query("DELETE FROM blogs WHERE idBlog = ?", [blogId], (err, result) => {
        if (err) {
            console.error("Lỗi xóa blog:", err.message);
            return res.status(500).send("Lỗi khi xóa blog");
        }
        res.redirect('/admin/blogsadmin');
    });
};


exports.blog = (req, res) => {
    res.render('blog');
};

