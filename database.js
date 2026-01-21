const mysql = require('mysql2/promise');

// Create a pool instead of a single connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '$$Pk2005?',
  database: 'amazondb',
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