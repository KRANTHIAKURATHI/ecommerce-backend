const express = require('express');
const connectDB = require('../database');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = 'your_super_secret_key_123'; 

// --- JWT Middleware ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

// --- Protected Routes ---

// 1. Fetch all products (no auth required for browsing)
router.get('/products', async (req, res) => {
  try {
    const db = await connectDB(); // Returns the pool
    const [products] = await db.query(
      `SELECT 
          p.product_id, 
          p.product_name, 
          p.amount, 
          p.imageURL, 
          c.category_name 
       FROM product p
       LEFT JOIN category c ON p.category_id = c.category_id`
    );
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Search products by name (no auth required for searching)
router.get('/products/search/query', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) return res.json([]);

    const db = await connectDB();
    const [results] = await db.query(
      `SELECT 
          p.product_id, 
          p.product_name, 
          p.amount, 
          p.imageURL, 
          c.category_name 
       FROM product p
       LEFT JOIN category c ON p.category_id = c.category_id
       WHERE p.product_name LIKE ? 
       LIMIT 5`,
      [`%${searchTerm}%`]
    );

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
});

// 3. Fetch a single product by ID (no auth required)
router.get('/products/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const db = await connectDB();

    const [product] = await db.query(
      `SELECT 
          p.product_id, 
          p.product_name, 
          p.amount, 
          p.imageURL, 
          c.category_name 
       FROM product p
       LEFT JOIN category c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Fetch products by category (no auth required)
router.get('/products/category_id/:category_id', async (req, res) => {
  try {
    const { category_id } = req.params;
    const db = await connectDB();

    const [products] = await db.query(
      `SELECT 
          p.product_id, 
          p.product_name, 
          p.amount, 
          p.imageURL, 
          c.category_name 
       FROM product p
       LEFT JOIN category c ON p.category_id = c.category_id
       WHERE p.category_id = ?`,
      [category_id]
    );

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;