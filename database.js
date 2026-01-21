require('dotenv').config();
const mysql = require('mysql2/promise');

// Create a pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amazondb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function DBConnect() {
  try {
    // The pool automatically handles connecting and disconnecting
    return pool;
  } catch (error) {
    console.error('Failed to connect to the database pool:', error.message);
    throw error;
  }
}

module.exports = DBConnect;