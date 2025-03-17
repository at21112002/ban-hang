const mysql = require('mysql2');
const db = require('../models/db');  // Kết nối database

// Chuyển db sang chế độ promise ngay trong controller
const promiseDb = db.promise();


// Hiển thị doanh số
exports.showRevenue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = `
      WHERE order_status = 'Đơn hàng đã được giao'
      AND user_confirmation = 'Đã nhận'
    `;
    
    // Thêm điều kiện ngày vào câu truy vấn nếu có
    if (startDate && endDate) {
      whereClause += ` AND DATE(order_date) BETWEEN ? AND ?`;
    } else if (startDate) {
      whereClause += ` AND DATE(order_date) >= ?`;
    } else if (endDate) {
      whereClause += ` AND DATE(order_date) <= ?`;
    }

    // Tính tổng doanh số
    const [totalRevenueResult] = await promiseDb.query(`
      SELECT SUM(total_price) AS totalRevenue
      FROM orders
      ${whereClause}
    `, [startDate, endDate]);

    const totalRevenue = totalRevenueResult[0].totalRevenue || 0;

    // Doanh số theo ngày
    const [dailyRevenueResult] = await promiseDb.query(`
      SELECT DATE(order_date) AS date, SUM(total_price) AS revenue
      FROM orders
      ${whereClause}
      GROUP BY DATE(order_date)
      ORDER BY DATE(order_date) DESC
    `, [startDate, endDate]);

    res.render('admin/revenue', {
      totalRevenue,
      dailyRevenue: dailyRevenueResult
    });

  } catch (error) {
    console.error('Lỗi khi lấy doanh số:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu doanh số');
  }
};

// Hiển thị sản phẩm đã bán
exports.showSoldProducts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = `WHERE o.order_status = 'Đơn hàng đã được giao' AND o.user_confirmation = 'Đã nhận'`;

    // Thêm điều kiện ngày vào câu truy vấn nếu có
    if (startDate && endDate) {
      whereClause += ` AND DATE(o.order_date) BETWEEN ? AND ?`;
    } else if (startDate) {
      whereClause += ` AND DATE(o.order_date) >= ?`;
    } else if (endDate) {
      whereClause += ` AND DATE(o.order_date) <= ?`;
    }

    // Truy vấn các sản phẩm đã bán
    const [soldProductsResult] = await promiseDb.query(`
      SELECT p.name, SUM(od.quantity) AS totalSold
      FROM order_items od
      JOIN orders o ON od.id = o.id
      JOIN products p ON od.idSP = p.idSP
      ${whereClause}
      GROUP BY p.name
      ORDER BY totalSold DESC
    `, [startDate, endDate]);
    

    res.render('admin/soldProductsrevenue', {
      soldProducts: soldProductsResult
    });

  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm bán:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu sản phẩm');
  }
};
