const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect, admin } = require('../middlewares/auth');

// @desc    Completely reset transactional operational histories (Admin only)
// @route   POST /api/reset/reset-system
// @access  Private/Admin
router.post('/reset-system', protect, admin, async (req, res) => {
  try {
    // 1. Wipe deliveries, payments, ledgers, and logs by saving empty arrays
    writeData('deliveries', []);
    writeData('payments', []);
    writeData('ledger', []);

    // 2. Reset hotel counters (cylinder pools and balances) to zero
    const hotels = readData('hotels');
    const resetHotels = hotels.map(h => {
      return {
        ...h,
        filledCylinders: 0,
        emptyCylinders: 0,
        pendingBalance: 0,
        totalPaid: 0,
        updatedAt: new Date().toISOString()
      };
    });
    writeData('hotels', resetHotels);


    // 4. Log the administrative audit reset
    const logs = [];
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Executed administrative full system transactional reset.`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({ success: true, message: 'ERP database reset completed successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
