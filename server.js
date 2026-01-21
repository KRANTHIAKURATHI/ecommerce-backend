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

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_key_123'; // Matches UserController

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport (No sessions needed as we use JWT)
app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Cloud Console ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET", // Replace with your Secret
    callbackURL: "http://localhost:5000/api/auth/google/callback"
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
    res.redirect(`http://localhost:5173/login-success?token=${token}&userID=${req.user.user_id}`);
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