const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg).join(', ') });
    }

    const { username, email, password, phone, dob } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user - password will be hashed by the User model's pre-save middleware
      user = new User({ username, email, password, phone, dob });
      await user.save();

      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Signup failed. Please try again.' });
        }
        // Set cookie based on environment
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? 'None' : 'Lax',
          // domain: isProd ? '.yourdomain.com' : undefined, // Uncomment and set if needed
          maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ token });
      });
    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ message: 'Signup failed. Please try again.', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '1h' }, (err, token) => {
      if (err) throw err;
      // Set cookie based on environment
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        // domain: isProd ? '.yourdomain.com' : undefined, // Uncomment and set if needed
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile route error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

