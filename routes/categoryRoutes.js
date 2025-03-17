const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Hiển thị danh sách danh mục

router.get("/categories", categoryController.getCategories);
router.get("/admin/categories", categoryController.getCategories);
// Xử lý thêm danh mục
router.post("/admin/categories/add", categoryController.addCategory);

// Xử lý sửa danh mục
router.post("/admin/categories/update", categoryController.updateCategory);

// Xử lý xóa danh mục
router.get("/admin/categories/delete/:id", categoryController.deleteCategory);

module.exports = router;

