const db = require('../models/db');

// Lấy danh sách tất cả đơn hàng
exports.getAllOrders = (req, res) => {
  const sql = `
    SELECT o.id, u.tenusers, o.total_price, o.payment_method, o.order_status, o.order_date, o.user_confirmation
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.order_date DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Lỗi khi lấy danh sách đơn hàng');
    }
    res.render('admin/orders1', { orders: results });
  });
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = (req, res) => {
    const orderId = req.params.id;
    const orderSql = `
      SELECT o.id, u.tenusers, u.sdt, u.diachi, u.provinceId, u.districtId, u.wardId, 
             o.total_price, o.payment_method, o.order_status, o.order_date
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
  
    const itemsSql = `
      SELECT p.idSP, p.image, oi.size, oi.quantity, oi.price
      FROM order_items oi
      JOIN products p ON oi.idSP = p.idSP
      WHERE oi.order_id = ?
    `;
  
    db.query(orderSql, [orderId], (err, orderResults) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Lỗi khi lấy thông tin đơn hàng');
      }
      if (orderResults.length === 0) {
        return res.status(404).send('Không tìm thấy đơn hàng');
      }
      db.query(itemsSql, [orderId], (err, itemsResults) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Lỗi khi lấy chi tiết đơn hàng');
        }
        res.render('admin/orderDetails', { order: orderResults[0], items: itemsResults });
      });
    });
  };
  exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const newStatus = req.body.order_status;
  
    const updateSql = `UPDATE orders SET order_status = ? WHERE id = ?`;
  
    db.query(updateSql, [newStatus, orderId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Lỗi khi cập nhật trạng thái đơn hàng');
      }
  
      // Lấy thông tin đơn hàng sau khi cập nhật
      db.query(
        `SELECT o.id, u.tenusers, u.sdt, u.diachi, u.provinceId, u.districtId, u.wardId, 
                o.total_price, o.payment_method, o.order_status, o.order_date, o.user_confirmation
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.id = ?`,
        [orderId],
        (err, orderResults) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Lỗi khi lấy thông tin đơn hàng');
          }
          const itemsSql = `
            SELECT p.idSP, p.image, oi.size, oi.quantity, oi.price
            FROM order_items oi
            JOIN products p ON oi.idSP = p.idSP
            WHERE oi.order_id = ?
          `;
          db.query(itemsSql, [orderId], (err, itemsResults) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Lỗi khi lấy chi tiết đơn hàng');
            }
            res.render('admin/orders1', { orders: orderResults, items: itemsResults });
          });
        }
      );
    });
  };
  