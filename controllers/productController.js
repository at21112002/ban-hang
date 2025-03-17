const db = require("../models/db");

const Product = {
    getAll: (callback) => {
        db.query("SELECT * FROM products", (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
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
    },
    

    getById: (idSP, callback) => {
        db.query(
            `SELECT p.*, ps.idSize, ps.size, ps.quantity 
             FROM products p 
             LEFT JOIN product_size ps ON p.idSP = ps.idSP 
             WHERE p.idSP = ?`, 
            [idSP], 
            (err, results) => {
                if (err) return callback(err);
                if (results.length === 0) return callback(null, null);

                const product = {
                    idSP: results[0].idSP,
                    name: results[0].name,
                    price: results[0].price,
                    description: results[0].description,
                    image: results[0].image,
                    sizes: results.filter(row => row.idSize)
                                  .map(row => ({ idSize: row.idSize, size: row.size, quantity: row.quantity }))
                };

                callback(null, product);
            }
        );
    },
    getById1: (idSP, callback) => {
        db.query(
            `SELECT p.*, ps.idSize, ps.size, ps.quantity 
             FROM products p 
             LEFT JOIN product_size ps ON p.idSP = ps.idSP 
             WHERE p.idSP = ?`, 
            [idSP], 
            (err, results) => {
                if (err) return callback(err);
                if (results.length === 0) return callback(null, null);
    
                const sizes = results.filter(row => row.idSize).map(row => ({
                    idSize: row.idSize,
                    size: row.size,
                    quantity: row.quantity
                }));
    
                const totalQuantity = sizes.reduce((sum, size) => sum + size.quantity, 0);
    
                const product = {
                    idSP: results[0].idSP,
                    name: results[0].name,
                    price: results[0].price,
                    description: results[0].description,
                    image: results[0].image,
                    sizes: sizes,
                    totalQuantity: totalQuantity // Tổng số lượng các size
                };
    
                callback(null, product);
            }
        );
    },
    

    create: (product, sizes, callback) => {
        db.query("INSERT INTO products SET ?", product, (err, result) => {
            if (err) return callback(err);
            
            const idSP = result.insertId;
            if (sizes.length > 0) {
                const sizeValues = sizes.map(size => [idSP, size.size, size.quantity]);
                db.query("INSERT INTO product_size (idSP, size, quantity) VALUES ?", [sizeValues], (err, sizeResult) => {
                    if (err) return callback(err);
                    callback(null, sizeResult);
                });
            } else {
                callback(null, result);
            }
        });
    },

    update: (idSP, product, sizes, callback) => {
        db.query("UPDATE products SET ? WHERE idSP = ?", [product, idSP], (err, result) => {
            if (err) return callback && typeof callback === 'function' ? callback(err) : console.error(err);
            
            db.query("DELETE FROM product_size WHERE idSP = ?", [idSP], (err) => {
                if (err) return callback && typeof callback === 'function' ? callback(err) : console.error(err);
    
                if (sizes.length > 0) {
                    const sizeValues = sizes.map(size => [idSP, size.size, size.quantity]);
                    db.query("INSERT INTO product_size (idSP, size, quantity) VALUES ?", [sizeValues], (err, sizeResult) => {
                        if (err) return callback && typeof callback === 'function' ? callback(err) : console.error(err);
                        callback && typeof callback === 'function' ? callback(null, sizeResult) : console.error('Callback is not a function');
                    });
                } else {
                    callback && typeof callback === 'function' ? callback(null, result) : console.error('Callback is not a function');
                }
            });
        });
    },

    delete: (idSP, callback) => {
        db.query("DELETE FROM product_size WHERE idSP = ?", [idSP], (err) => {
            if (err) return callback(err);
            db.query("DELETE FROM products WHERE idSP = ?", [idSP], callback);
        });
    },
    getProductsByCategory: (idDM, callback) => {
        const query = `
            SELECT p.*, ps.idSize, ps.size, ps.quantity 
            FROM products p 
            LEFT JOIN product_size ps ON p.idSP = ps.idSP 
            WHERE p.idDM = ?
        `;
        
        db.query(query, [idDM], (err, results) => {
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
                        idDM: row.idDM,
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
    },
    
    
    
};

const Category = {
    getAllDM: (callback) => {
        db.query("SELECT * FROM categories", (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = { Product, Category };




// Sửa lại cách export
// module.exports.products = (req, res) => {
//     res.render('products');
// };
module.exports.products = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    Product.getAll1((err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi server");
        }

        // Tính tổng số trang
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy dữ liệu cho trang hiện tại
        const productsOnPage = products.slice(offset, offset + limit);

        res.render("products", {
            products: productsOnPage,
            currentPage: page,
            totalPages: totalPages,
        });
    });
};


module.exports.productsadmin = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    Product.getAll((err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi server");
        }

        // Tính tổng số trang
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy dữ liệu cho trang hiện tại
        const productsOnPage = products.slice(offset, offset + limit);

        res.render("admin/productsadmin", {
            products: productsOnPage,
            currentPage: page,
            totalPages: totalPages,
        });
    });
};
module.exports.getProductsByCategory = (req, res) => {
    const idDM = req.params.idDM;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const offset = (page - 1) * limit;

    Product.getProductsByCategory(idDM, (err, products) => {
        if (err) {
            return res.status(500).send("Lỗi lấy sản phẩm");
        }

        // Tính tổng số trang
        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);

        // Lấy dữ liệu cho trang hiện tại
        const productsOnPage = products.slice(offset, offset + limit);

        res.render("productsByCategory", {
            products: productsOnPage,
            currentPage: page,
            totalPages: totalPages,
            idDM: idDM,
        });
    });
};


module.exports.productDetail = (req, res) => {
    const { idSP } = req.params;

    Product.getById1(idSP, (err, product) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Lỗi server");
        }
        if (!product) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }
        res.render("productDetail", { product });
    });
};



module.exports.searchProducts = (req, res) => {
  const searchQuery = req.query.q;
  
  // Truy vấn để tìm sản phẩm theo tên hoặc mô tả
  const searchSql = 'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?';
  const queryParams = [`%${searchQuery}%`, `%${searchQuery}%`];

  db.query(searchSql, queryParams, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).send('Lỗi máy chủ');
    }

    if (results.length === 0) {
      // Không tìm thấy sản phẩm nào
      return res.render('productsearch', { products: [], relatedProducts: [], searchQuery });
    }

    // Lấy idDM từ sản phẩm đầu tiên tìm được
    const idDM = results[0].idDM;

    // Truy vấn các sản phẩm cùng danh mục (trừ sản phẩm đã tìm thấy)
    const relatedSql = 'SELECT * FROM products WHERE idDM = ? AND idSP NOT IN (?)';
    const relatedParams = [idDM, results.map(p => p.idSP)];

    db.query(relatedSql, relatedParams, (err, relatedProducts) => {
      if (err) {
        console.error('Lỗi truy vấn sản phẩm liên quan:', err);
        return res.status(500).send('Lỗi máy chủ');
      }

      // Render ra productsearch.ejs với cả products và relatedProducts
      res.render('productsearch', { products: results, relatedProducts, searchQuery });
    });
  });
};






module.exports.Product = Product;
