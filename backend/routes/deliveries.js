const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect } = require('../middlewares/auth');

// Helper to generate custom human-readable sequential invoice numbers
const generateDeliveryNo = (deliveriesCount) => {
  const year = new Date().getFullYear();
  return `DLV-${year}-${String(deliveriesCount + 1).padStart(4, '0')}`;
};

// @desc    Get all deliveries
// @route   GET /api/deliveries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const deliveries = readData('deliveries');
    const hotels = readData('hotels');
    const users = readData('users');

    // Manually populate references (hotel, staff)
    const populated = deliveries.map(dlv => {
      const hotel = hotels.find(h => h._id === dlv.hotel);
      const staff = users.find(u => u._id === dlv.staff);
      return {
        ...dlv,
        hotel: hotel ? { _id: hotel._id, name: hotel.name, rate: hotel.rate } : null,
        staff: staff ? { _id: staff._id, name: staff.name, username: staff.username } : null
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new unified delivery transaction
// @route   POST /api/deliveries
// @access  Private
router.post('/', protect, async (req, res) => {
  const { hotelId, deliveredQty, returnedEmptiesQty, paymentReceived, paymentMethod, notes } = req.body;

  if (!hotelId || deliveredQty === undefined || returnedEmptiesQty === undefined) {
    return res.status(400).json({ success: false, message: 'Hotel, Delivered Qty, and Returned Qty are required' });
  }

  if (Number(deliveredQty) < 0 || Number(returnedEmptiesQty) < 0) {
    return res.status(400).json({ success: false, message: 'Quantities cannot be negative' });
  }

  if (Number(deliveredQty) === 0 && Number(returnedEmptiesQty) === 0) {
    return res.status(400).json({ success: false, message: 'Specify at least 1 cylinder delivered or returned empty' });
  }

  try {
    // 1. Read files
    const hotels = readData('hotels');
    const inventory = readData('inventory');
    const deliveries = readData('deliveries');
    const ledger = readData('ledger');
    const payments = readData('payments');
    const logs = readData('logs');

    // 2. Fetch specific Hotel
    const hotelIndex = hotels.findIndex(h => h._id === hotelId);
    if (hotelIndex === -1) {
      return res.status(400).json({ success: false, message: 'Hotel not found' });
    }
    const hotel = hotels[hotelIndex];

    // 3. Validate farm stock
    if (inventory.filledStock < Number(deliveredQty)) {
      return res.status(400).json({ success: false, message: `Insufficient farm filled stock. Only ${inventory.filledStock} available.` });
    }

    // 4. Cylinder Exchange Logic
    const originalEmptyCylinders = hotel.emptyCylinders;
    const originalFilledCylinders = hotel.filledCylinders;
    const simulatedEmptyStock = originalEmptyCylinders + originalFilledCylinders;

    if (Number(returnedEmptiesQty) > simulatedEmptyStock) {
      return res.status(400).json({ success: false, message: `Hotel has only ${simulatedEmptyStock} empty cylinders outstanding. Cannot return ${returnedEmptiesQty}.` });
    }

    // 5. Cost calculations
    const totalAmount = hotel.rate * Number(deliveredQty);
    const deliveryNo = generateDeliveryNo(deliveries.length);

    // 6. Update inventory (Farm)
    inventory.filledStock -= Number(deliveredQty);
    inventory.emptyStock += Number(returnedEmptiesQty);

    // 7. Update Hotel cylinders
    hotel.filledCylinders = Number(deliveredQty);
    hotel.emptyCylinders = simulatedEmptyStock - Number(returnedEmptiesQty);

    // 8. Update Hotel pending balance & create ledger debit entry
    const initialPendingBalance = hotel.pendingBalance;
    const afterDeliveryBalance = initialPendingBalance + totalAmount;
    hotel.pendingBalance = afterDeliveryBalance;

    const deliveryId = generateId();
    const newDelivery = {
      _id: deliveryId,
      deliveryNo,
      hotel: hotelId,
      staff: req.user.id, // req.user has decoded id
      deliveredQty: Number(deliveredQty),
      returnedEmptiesQty: Number(returnedEmptiesQty),
      totalAmount,
      paymentReceived: Number(paymentReceived || 0),
      paymentMethod: paymentReceived > 0 ? paymentMethod : 'none',
      notes,
      createdAt: new Date().toISOString()
    };
    deliveries.push(newDelivery);

    // Create Ledger Debit entry
    const ledgerDebit = {
      _id: generateId(),
      hotel: hotelId,
      type: 'delivery',
      referenceId: deliveryId,
      debit: totalAmount,
      credit: 0,
      runningBalance: afterDeliveryBalance,
      notes: `Delivered ${deliveredQty} cylinders, collected ${returnedEmptiesQty} empties.`,
      createdAt: new Date().toISOString()
    };
    ledger.push(ledgerDebit);

    // 9. Handle payment collected during delivery
    let paymentRecord = null;
    let finalBalance = afterDeliveryBalance;

    if (Number(paymentReceived) > 0) {
      const paymentId = generateId();
      const paymentNo = `PMT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      
      paymentRecord = {
        _id: paymentId,
        paymentNo,
        hotel: hotelId,
        amount: Number(paymentReceived),
        paymentMethod: paymentMethod || 'cash',
        receivedBy: req.user.id,
        notes: `Paid during delivery ${deliveryNo}`,
        createdAt: new Date().toISOString()
      };
      payments.push(paymentRecord);

      finalBalance = afterDeliveryBalance - Number(paymentReceived);
      hotel.pendingBalance = finalBalance;
      hotel.totalPaid += Number(paymentReceived);

      // Create Ledger Credit entry
      const ledgerCredit = {
        _id: generateId(),
        hotel: hotelId,
        type: 'payment',
        referenceId: paymentId,
        debit: 0,
        credit: Number(paymentReceived),
        runningBalance: finalBalance,
        notes: `Payment received during delivery ${deliveryNo}`,
        createdAt: new Date().toISOString()
      };
      ledger.push(ledgerCredit);
    }

    // 10. Audit Log
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Recorded delivery ${deliveryNo} for ${hotel.name}: Delivered ${deliveredQty}, Returned ${returnedEmptiesQty}, Paid: ${paymentReceived || 0}`,
      createdAt: new Date().toISOString()
    });

    // 11. Write all changes to files (Commit transaction)
    writeData('hotels', hotels);
    writeData('inventory', inventory);
    writeData('deliveries', deliveries);
    writeData('ledger', ledger);
    writeData('payments', payments);
    writeData('logs', logs);

    res.status(201).json({
      success: true,
      delivery: newDelivery,
      payment: paymentRecord,
      outstandingDue: finalBalance
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
