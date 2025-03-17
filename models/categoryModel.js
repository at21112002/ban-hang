const db = require("../models/db");

// Lấy tất cả danh mục
exports.getAllCategories = (callback) => {
    db.query("SELECT * FROM categories", callback);
};

// Thêm danh mục mới
exports.addCategory = (name, callback) => {
    db.query("INSERT INTO categories (name) VALUES (?)", [name], callback);
};

// Sửa danh mục
exports.updateCategory = (id, name, callback) => {
    db.query("UPDATE categories SET name = ? WHERE idDM = ?", [name, id], callback);
};

// Xóa danh mục
exports.deleteCategory = (id, callback) => {
    db.query("DELETE FROM categories WHERE idDM = ?", [id], callback);
};
