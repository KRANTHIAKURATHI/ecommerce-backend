const jwt = require('jsonwebtoken');

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkVjb21tZXJjZUFwcCIsImlhdCI6MTcwMzE2MDAwMH0xK2FzZGZnaGprbGxzcmU3MzJqaGdiZWh3NHI3YmhrOXdlMjNlMjNydTIzZjIz'; // Must match the one in Main.js

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    console.log('[AUTH] Authorization header:', req.headers.authorization?.substring(0, 20) + '...');
    
    if (!token) {
      console.log('[AUTH] No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token decoded:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};

module.exports = auth;
