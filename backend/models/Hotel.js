const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    unique: true,
    trim: true,
    index: true
  },
  address: {
    type: String,
    required: [true, 'Hotel address is required'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, 'Contact number/person is required'],
    trim: true
  },
  rate: {
    type: Number,
    required: [true, 'Standard rate per cylinder is required'],
    min: [0, 'Rate cannot be negative']
  },
  creditLimit: {
    type: Number,
    default: 50000,
    min: [0, 'Credit limit cannot be negative']
  },
  filledCylinders: {
    type: Number,
    default: 0,
    min: [0, 'Filled cylinder balance cannot be negative']
  },
  emptyCylinders: {
    type: Number,
    default: 0,
    min: [0, 'Empty cylinder balance cannot be negative']
  },
  pendingBalance: {
    type: Number,
    default: 0,
    index: true
  },
  totalPaid: {
    type: Number,
    default: 0,
    min: [0, 'Total paid cannot be negative']
  }
}, {
  timestamps: true
});

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
