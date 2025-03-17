// models/db.js
const mysql = require('mysql2');

// Cấu hình kết nối với MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Username mặc định trong XAMPP
  password: '',      // Mật khẩu mặc định trong XAMPP (thường là rỗng)
  database: 'myshop1' // Tên cơ sở dữ liệu bạn muốn kết nối
});

// Kết nối đến cơ sở dữ liệu
connection.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL: ' + err.stack);
    return;
  }
  console.log('Kết nối MySQL thành công với ID ' + connection.threadId);
});

module.exports = connection;
