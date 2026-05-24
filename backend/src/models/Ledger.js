const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['delivery', 'payment', 'opening_balance', 'adjustment'],
    required: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  debit: {
    type: Number,
    default: 0
  },
  credit: {
    type: Number,
    default: 0
  },
  runningBalance: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Ledger = mongoose.model('Ledger', ledgerSchema);
module.exports = Ledger;
