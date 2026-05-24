const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel is required'],
    index: true
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Delivery staff is required']
  },
  deliveredQty: {
    type: Number,
    required: [true, 'Delivered cylinder quantity is required'],
    min: [1, 'Must deliver at least 1 cylinder']
  },
  returnedEmptiesQty: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Returned empties cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paymentReceived: {
    type: Number,
    default: 0,
    min: [0, 'Payment received cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'gpay', 'bank_transfer', 'none'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['delivered', 'cancelled'],
    default: 'delivered'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;
