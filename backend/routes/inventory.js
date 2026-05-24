const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect } = require('../middlewares/auth');

// @desc    Get farm inventory levels
// @route   GET /api/inventory
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const inventory = readData('inventory');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Manually update inventory levels
// @route   POST /api/inventory/update
// @access  Private
router.post('/update', protect, async (req, res) => {
  try {
    const { filled, empty, lowStockThreshold } = req.body;

    if (filled === undefined || empty === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide both filled and empty stocks' });
    }

    const inventory = readData('inventory');
    inventory.filledStock = Number(filled);
    inventory.emptyStock = Number(empty);
    if (lowStockThreshold !== undefined) {
      inventory.lowStockThreshold = Number(lowStockThreshold);
    }

    writeData('inventory', inventory);

    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Manually updated inventory → Filled: ${filled}, Empty: ${empty}`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Record company truck stock arrival
// @route   POST /api/inventory/arrival
// @access  Private
router.post('/arrival', protect, async (req, res) => {
  try {
    const { filledQty, emptySentQty, notes } = req.body;

    if (!filledQty) {
      return res.status(400).json({ success: false, message: 'Please specify arrived filled quantity' });
    }

    const inventory = readData('inventory');
    inventory.filledStock += Number(filledQty);
    if (emptySentQty) {
      inventory.emptyStock = Math.max(0, inventory.emptyStock - Number(emptySentQty));
    }

    writeData('inventory', inventory);

    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Stock Arrived: Added ${filledQty} filled cylinders, Sent ${emptySentQty || 0} empty cylinders back to refinery. Notes: ${notes || 'None'}`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
