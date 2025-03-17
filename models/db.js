require('dotenv').config();
const mysql = require('mysql2');

// Cấu hình kết nối với MySQL từ biến môi trường
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
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
