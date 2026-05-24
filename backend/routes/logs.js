const express = require('express');
const router = express.Router();
const { readData } = require('../utils/dbHelper');
const { protect } = require('../middlewares/auth');

// @desc    Get all activity logs
// @route   GET /api/logs
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const logs = readData('logs');
    const sorted = logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
