const express = require('express');
const connectDB = require('../database');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'your_super_secret_key_123';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

// GET Orders - Updated to fetch quantity
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const db = await connectDB();
    
    // 1. Get all orders for this user
    const [orders] = await db.query(
      'SELECT order_id, amount, order_date FROM orders WHERE user_id = ? ORDER BY order_date DESC', 
      [user_id]
    );

    if (orders.length === 0) return res.json([]);

    const order_ids = orders.map(o => o.order_id);
    const placeholders = order_ids.map(() => '?').join(', ');

    // 2. Fetch items including the quantity and unit price
    const [items] = await db.query(
      `SELECT oi.order_id, oi.quantity, p.product_id, p.product_name, p.amount AS price, p.imageURL
       FROM order_item oi
       JOIN product p ON oi.product_id = p.product_id
       WHERE oi.order_id IN (${placeholders})`, 
      order_ids
    );

    // 3. Group items by order_id
    const itemsByOrder = {};
    items.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        product_id: item.product_id,
        name: item.product_name,
        image: item.imageURL,
        price: item.price,
        quantity: item.quantity // Added quantity here
      });
    });

    const result = orders.map(order => ({
      ...order,
      products: itemsByOrder[order.order_id] || []
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// BUY NOW - Updated to save specific quantity
router.post('/orders/buy_now', verifyToken, async (req, res) => {
  const { product_id, amount, quantity } = req.body;
  const user_id = req.user.user_id;
  const db = await connectDB();

  try {
    // 1. Create the main order record
    const [order] = await db.query(
      'INSERT INTO orders (user_id, amount, order_date) VALUES (?, ?, NOW())',
      [user_id, amount]
    );
    
    // 2. Insert into order_item with the specified quantity
    await db.query(
      'INSERT INTO order_item (order_id, product_id, quantity) VALUES (?, ?, ?)',
      [order.insertId, product_id, quantity || 1]
    );

    res.json({ success: true, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;