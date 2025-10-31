const mysql = require('mysql2');
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'appaamma2203',   // update if needed
  database: process.env.DB_NAME || 'hospital_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
pool.getConnection((err, conn) => {
  if (err) {
    console.error('MySQL connection failed:', err.message || err);
  } else {
    console.log('MySQL connected (pool).');
    conn.release();
  }
});
module.exports = pool;
