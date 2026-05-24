const express = require('express');
const router = express.Router();
const { readData, writeData, generateId } = require('../utils/dbHelper');
const { protect, admin } = require('../middlewares/auth');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const hotels = readData('hotels');
    hotels.sort((a, b) => a.name.localeCompare(b.name));
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const hotels = readData('hotels');
    const hotel = hotels.find(h => h._id === req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, address, contact, rate, creditLimit } = req.body;

    if (!name || !address || !contact || rate === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const hotels = readData('hotels');
    const hotelExists = hotels.some(h => h.name.toLowerCase() === name.toLowerCase());
    if (hotelExists) {
      return res.status(400).json({ success: false, message: 'Hotel with this name already exists' });
    }

    const newHotel = {
      _id: generateId(),
      name,
      address,
      contact,
      rate: Number(rate),
      creditLimit: Number(creditLimit || 50000),
      filledCylinders: 0,
      emptyCylinders: 0,
      pendingBalance: 0,
      totalPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    hotels.push(newHotel);
    writeData('hotels', hotels);

    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Created hotel ${name}`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.status(201).json({ success: true, data: newHotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update hotel details
// @route   PUT /api/hotels/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, address, contact, rate, creditLimit } = req.body;
    const hotels = readData('hotels');
    const index = hotels.findIndex(h => h._id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check duplicate name
    if (name && name.toLowerCase() !== hotels[index].name.toLowerCase()) {
      const duplicate = hotels.some(h => h.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another hotel with this name exists' });
      }
    }

    hotels[index].name = name || hotels[index].name;
    hotels[index].address = address || hotels[index].address;
    hotels[index].contact = contact || hotels[index].contact;
    hotels[index].rate = rate !== undefined ? Number(rate) : hotels[index].rate;
    hotels[index].creditLimit = creditLimit !== undefined ? Number(creditLimit) : hotels[index].creditLimit;
    hotels[index].updatedAt = new Date().toISOString();

    writeData('hotels', hotels);

    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Updated hotel details for ${hotels[index].name}`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({ success: true, data: hotels[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const hotels = readData('hotels');
    const index = hotels.findIndex(h => h._id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const hotel = hotels[index];

    // Double check outstanding cylinders or outstanding balance
    if (hotel.pendingBalance > 0 || hotel.filledCylinders > 0 || hotel.emptyCylinders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hotel with outstanding pending balance or gas cylinders'
      });
    }

    hotels.splice(index, 1);
    writeData('hotels', hotels);

    const logs = readData('logs');
    logs.push({
      _id: generateId(),
      user: req.user.username,
      action: `Deleted hotel ${hotel.name}`,
      createdAt: new Date().toISOString()
    });
    writeData('logs', logs);

    res.json({ success: true, message: `Hotel ${hotel.name} removed successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
