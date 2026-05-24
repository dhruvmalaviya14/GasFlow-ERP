const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNo: {
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
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than zero']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'gpay_phonepe', 'cheque', 'other'],
    required: [true, 'Payment method is required']
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
