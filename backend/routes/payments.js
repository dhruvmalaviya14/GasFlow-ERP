const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect } = require('../middlewares/auth');

// @desc    Get all payment transactions
// @route   GET /api/payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const payments = readData('payments');
    const hotels = readData('hotels');
    const users = readData('users');

    const populated = payments.map(pmt => {
      const hotel = hotels.find(h => h._id === pmt.hotel);
      const user = users.find(u => u._id === pmt.receivedBy);
      return {
        ...pmt,
        hotel: hotel ? { name: hotel.name } : null,
        receivedBy: user ? { name: user.name } : null
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Record a new custom partial/full payment from hotel
// @route   POST /api/payments
// @access  Private
router.post('/', protect, async (req, res) => {
  const { hotelId, amount, paymentMethod, notes } = req.body;

  if (!hotelId || !amount) {
    return res.status(400).json({ success: false, message: 'Hotel and Payment Amount are required' });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
  }

  try {
    const hotels = readData('hotels');
    const payments = readData('payments');
    const ledger = readData('ledger');
    const logs = readData('logs');

    const index = hotels.findIndex(h => h._id === hotelId);
    if (index === -1) {
      return res.status(400).json({ success: false, message: 'Hotel not found' });
    }

    const hotel = hotels[index];
    const paymentNo = `PMT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Decrement hotel dues and increment paid totals
    const finalBalance = hotel.pendingBalance - Number(amount);
    hotel.pendingBalance = finalBalance;
    hotel.totalPaid += Number(amount);

    const paymentId = generateId();
    const newPayment = {
      _id: paymentId,
      paymentNo,
      hotel: hotelId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      receivedBy: req.user.id,
      notes,
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);

    // Create Credit Ledger history record
    const ledgerCredit = {
      _id: generateId(),
      hotel: hotelId,
      type: 'payment',
      referenceId: paymentId,
      debit: 0,
      credit: Number(amount),
      runningBalance: finalBalance,
      notes: notes || `Direct hotel payment recorded. Method: ${paymentMethod || 'cash'}`,
      createdAt: new Date().toISOString()
    };
    ledger.push(ledgerCredit);

    // Logs
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Recorded payment ${paymentNo} of Rs. ${amount} from ${hotel.name}`,
      createdAt: new Date().toISOString()
    });

    // Write back
    writeData('hotels', hotels);
    writeData('payments', payments);
    writeData('ledger', ledger);
    writeData('logs', logs);

    res.status(201).json({
      success: true,
      payment: newPayment,
      outstandingDue: finalBalance
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Get payment summaries for all hotels
// @route   GET /api/payments/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const hotels = readData('hotels');
    const result = hotels.map(h => {
      return {
        hotel_id: h._id,
        name: h.name,
        rate: h.rate,
        paid: h.totalPaid,
        pending: h.pendingBalance,
        status: h.pendingBalance <= 0 ? 'done' : 'pending'
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
