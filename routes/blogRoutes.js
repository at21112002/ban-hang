const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/blog', blogController.blog);

router.get('/blogsadmin', blogController.getBlogs);
router.get('/admin/blogsadmin', blogController.getBlogs);

router.get('/admin/addBlog', blogController.getAddBlog);
router.post('/admin/addBlog/add', blogController.postAddBlog);

router.get('/admin/editBlog/edit/:id', blogController.getEditBlog);
router.post('/admin/editBlog/edit/:id', blogController.postEditBlog);

router.get('/admin/blogsadmin/delete/:id', blogController.deleteBlog);

module.exports = router;
