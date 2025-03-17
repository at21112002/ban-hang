const Category = require("../models/categoryModel");
const db = require("../models/db");

const Product = {
    getAll1: (callback) => {
        const query = `
            SELECT p.*, ps.idSize, ps.size, ps.quantity 
            FROM products p 
            LEFT JOIN product_size ps ON p.idSP = ps.idSP
        `;
    
        db.query(query, (err, results) => {
            if (err) return callback(err);
    
            // Nhóm sản phẩm theo idSP
            const productsMap = new Map();
    
            results.forEach(row => {
                if (!productsMap.has(row.idSP)) {
                    productsMap.set(row.idSP, {
                        idSP: row.idSP,
                        name: row.name,
                        price: row.price,
                        description: row.description,
                        image: row.image,
                        sizes: []
                    });
                }
    
                if (row.idSize) {
                    productsMap.get(row.idSP).sizes.push({
                        idSize: row.idSize,
                        size: row.size,
                        quantity: row.quantity
                    });
                }
            });
    
            callback(null, Array.from(productsMap.values()));
        });
    }
}
// controllers/homeController.js
module.exports.getHomePage = (req, res) => {
    // Lấy danh mục
    Category.getAllCategories((err, categories) => {
        if (err) throw err;

        // Lấy sản phẩm
        Product.getAll1((err, products) => {
            if (err) throw err;

            // Truyền cả hai vào render trang home
            res.render("home", { categories, products });
        });
    });
};

