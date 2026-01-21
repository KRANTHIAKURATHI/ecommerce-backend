const express = require('express');
const pool = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();

// 1. GET ALL REVIEWS FOR A PRODUCT
router.get('/products/:product_id/reviews', async (req, res) => {
  try {
    const db = await pool();
    const { product_id } = req.params;
    const prod_id = parseInt(product_id) || 0;

    if (!prod_id) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    const [reviews] = await db.query(
      `SELECT r.review_id, r.product_id, r.user_id, r.rating, r.comment, 
              r.created_at, u.fullname
       FROM reviews r
       JOIN user u ON r.user_id = u.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [prod_id]
    );

    // Calculate average rating
    const [avgResult] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ?',
      [prod_id]
    );

    const avgRating = avgResult[0]?.avg_rating || 0;
    const totalReviews = avgResult[0]?.total_reviews || 0;

    res.json({
      success: true,
      reviews,
      avgRating: parseFloat(avgRating).toFixed(1),
      totalReviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. ADD A REVIEW (Requires Authentication)
router.post('/reviews', auth, async (req, res) => {
  try {
    const db = await pool();
    const user_id = parseInt(req.user.user_id) || 0;
    const { product_id, rating, comment } = req.body;
    const prod_id = parseInt(product_id) || 0;
    const rate = parseInt(rating) || 0;

    if (!user_id || !prod_id || !rate) {
      return res.status(400).json({ error: 'Invalid user_id, product_id, or rating' });
    }

    if (rate < 1 || rate > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    console.log(`Adding review - user_id: ${user_id}, product_id: ${prod_id}, rating: ${rate}`);

    // Check if user already reviewed this product
    const [existing] = await db.query(
      'SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ?',
      [user_id, prod_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this product' });
    }

    // Insert review
    const [result] = await db.query(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [prod_id, user_id, rate, comment || null]
    );

    console.log('Review added successfully:', result.insertId);

    res.json({
      success: true,
      message: 'Review added successfully',
      review_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. UPDATE A REVIEW (Requires Authentication - User's own review only)
router.put('/reviews/:review_id', auth, async (req, res) => {
  try {
    const db = await pool();
    const user_id = parseInt(req.user.user_id) || 0;
    const review_id = parseInt(req.params.review_id) || 0;
    const { rating, comment } = req.body;
    const rate = parseInt(rating) || 0;

    if (!review_id || !rate) {
      return res.status(400).json({ error: 'Invalid review_id or rating' });
    }

    if (rate < 1 || rate > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if review exists and belongs to user
    const [review] = await db.query(
      'SELECT review_id, user_id FROM reviews WHERE review_id = ?',
      [review_id]
    );

    if (review.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own reviews' });
    }

    // Update review
    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?',
      [rate, comment || null, review_id]
    );

    console.log('Review updated:', review_id);

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE A REVIEW (Requires Authentication - User's own review only)
router.delete('/reviews/:review_id', auth, async (req, res) => {
  try {
    const db = await pool();
    const user_id = parseInt(req.user.user_id) || 0;
    const review_id = parseInt(req.params.review_id) || 0;

    if (!review_id) {
      return res.status(400).json({ error: 'Invalid review_id' });
    }

    // Check if review exists and belongs to user
    const [review] = await db.query(
      'SELECT review_id, user_id FROM reviews WHERE review_id = ?',
      [review_id]
    );

    if (review.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    // Delete review
    await db.query('DELETE FROM reviews WHERE review_id = ?', [review_id]);

    console.log('Review deleted:', review_id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
