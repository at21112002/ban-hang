const Category = require("../models/categoryModel");

// Hiển thị danh sách danh mục
exports.getCategories = (req, res) => {
    Category.getAllCategories((err, results) => {
        if (err) throw err;
        res.render("admin/categories", { categories: results });
    });
};

// Xử lý thêm danh mục
exports.addCategory = (req, res) => {
    const { name } = req.body;
    Category.addCategory(name, (err) => {
        if (err) throw err;
        res.redirect("/admin/categories");
    });
};

// Xử lý sửa danh mục
exports.updateCategory = (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).send("Thiếu dữ liệu");
    }

    Category.updateCategory(id, name, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi cập nhật danh mục");
        }
        res.redirect("/admin/categories");
    });
};


// Xử lý xóa danh mục
exports.deleteCategory = (req, res) => {
    const { id } = req.params;
    Category.deleteCategory(id, (err) => {
        if (err) throw err;
        res.redirect("/admin/categories");
    });
};
