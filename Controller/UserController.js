const express = require('express');
const DBConnect = require('../database');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = 'your_super_secret_key_123'; 

// Helper to find or create user for Google OAuth
router.findOrCreateGoogleUser = async (profile) => {
  const emailID = profile.emails[0].value;
  const fullname = profile.displayName;
  const db = await DBConnect(); // Now returns the Pool

  try {
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM user WHERE emailID = ?', [emailID]);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create user (using placeholder for phonenumber since Google doesn't always provide it)
    const [result] = await db.query(
      'INSERT INTO user (fullname, emailID, password, phonenumber) VALUES (?, ?, ?, ?)',
      [fullname, emailID, 'OAUTH_USER', '0000000000']
    );

    return { user_id: result.insertId, emailID, fullname };
  } catch (error) {
    console.error('Database Error in OAuth:', error);
    throw error;
  }
};

// Existing Registration
router.post('/user', async (req, res) => {
  const { fullname, phonenumber, emailID, password } = req.body;
  if (!fullname || !phonenumber || !emailID || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = await DBConnect();
    const [existing] = await db.query('SELECT * FROM user WHERE emailID = ?', [emailID]);
    if (existing.length > 0) return res.status(409).json({ error: 'User already exists' });

    await db.query(
      'INSERT INTO user (fullname, phonenumber, emailID, password) VALUES (?, ?, ?, ?)',
      [fullname, phonenumber, emailID, password]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual Login with JWT (POST method)
router.post('/userlogin', async (req, res) => {
  const { emailID, password } = req.body; // Use req.body for POST
  try {
    const db = await DBConnect();
    const [result] = await db.query(
      'SELECT * FROM user WHERE emailID = ? AND password = ?',
      [emailID, password]
    );

    if (result.length > 0) {
      const user = result[0];
      const token = jwt.sign(
        { user_id: user.user_id, emailID: user.emailID }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token: token,
        user: { user_id: user.user_id, emailID: user.emailID, fullname: user.fullname }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET current user profile (requires authentication)
router.get('/userprofile', auth, async (req, res) => {
  try {
    const db = await DBConnect();
    const user_id = req.user.user_id;

    const [result] = await db.query(
      'SELECT user_id, fullname, emailID, phonenumber FROM user WHERE user_id = ?',
      [user_id]
    );

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;