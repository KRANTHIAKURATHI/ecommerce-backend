const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const userRoutes = require('./Controller/UserController');
const productRoutes = require('./Controller/ProductRoute');
const categoryRoutes = require('./Controller/CategoryRoute');
const cartRoutes = require('./Controller/CartRoute');
const orderRoutes = require('./Controller/OrderRoute');
const reviewRoutes = require('./Controller/ReviewRoute');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport (No sessions needed as we use JWT)
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Accessing the helper we put in UserController
      const user = await userRoutes.findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

app.use('/api/images', express.static(path.join(__dirname, 'images')));

// OAuth Routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { session: false }), 
  (req, res) => {
    // Create the JWT token
    const token = jwt.sign(
      { user_id: req.user.user_id, emailID: req.user.emailID }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    // Redirect to React frontend with token and userID in URL
    res.redirect(`${FRONTEND_URL}/login-success?token=${token}&userID=${req.user.user_id}`);
  }
);

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', cartRoutes); 
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);

app.get('/api/test', (req, res) => {
  res.send('API is working!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});