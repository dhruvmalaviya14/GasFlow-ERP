const express = require('express');
const router = express.Router();
const { readData } = require('../utils/dbHelper');
const { generateBillPDF } = require('../utils/pdfGenerator');
const { protect } = require('../middlewares/auth');

// @desc    Get complete chronological financial ledger for a hotel
// @route   GET /api/ledger/:hotelId
// @access  Private
router.get('/:hotelId', protect, async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const hotels = readData('hotels');
    const hotel = hotels.find(h => h._id === hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const ledger = readData('ledger');
    const ledgerEntries = ledger
      .filter(l => l.hotel === hotelId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      hotel: {
        name: hotel.name,
        rate: hotel.rate,
        pendingBalance: hotel.pendingBalance,
        totalPaid: hotel.totalPaid,
        filledCylinders: hotel.filledCylinders,
        emptyCylinders: hotel.emptyCylinders
      },
      ledger: ledgerEntries
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get bill details summary for popup
// @route   GET /api/ledger/bill/:hotelId
// @access  Private
router.get('/bill/:hotelId', protect, async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotels = readData('hotels');
    const hotel = hotels.find(h => h._id === hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const deliveries = readData('deliveries');
    const hotelDeliveries = deliveries.filter(d => d.hotel === hotelId);
    
    const totalCylinders = hotelDeliveries.reduce((acc, curr) => acc + curr.deliveredQty, 0);
    const totalAmount = hotelDeliveries.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({
      success: true,
      hotelName: hotel.name,
      rate: hotel.rate,
      totalCylinders,
      totalAmount,
      paid: hotel.totalPaid,
      pending: hotel.pendingBalance,
      status: hotel.pendingBalance <= 0 ? 'done' : 'pending'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Download invoice bill statement PDF
// @route   GET /api/ledger/bill/download/:hotelId
// @access  Private
router.get('/bill/download/:hotelId', protect, async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotels = readData('hotels');
    const hotel = hotels.find(h => h._id === hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const deliveries = readData('deliveries');
    const hotelDeliveries = deliveries.filter(d => d.hotel === hotelId);

    const totalCylinders = hotelDeliveries.reduce((acc, curr) => acc + curr.deliveredQty, 0);
    const totalAmount = hotelDeliveries.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Set Response headers for PDF stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_Statement_${hotel.name.replace(/\s+/g, '_')}.pdf`);

    generateBillPDF(res, {
      hotelName: hotel.name,
      address: hotel.address,
      contact: hotel.contact,
      rate: hotel.rate,
      totalCylinders,
      totalAmount,
      paid: hotel.totalPaid,
      pending: hotel.pendingBalance
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
