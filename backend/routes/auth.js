const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect } = require('../middlewares/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyforgasdistributionerp2026', {
    expiresIn: '30d'
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    // Read users
    const users = readData('users');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(401).json({ success: false, message: 'Your account is currently inactive' });
    }

    // Log Activity
    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: user.username,
      action: `Logged into the system`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
