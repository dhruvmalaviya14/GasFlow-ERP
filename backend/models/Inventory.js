const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  filledStock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Filled stock cannot be negative']
  },
  emptyStock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Empty stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    default: 15,
    min: [0, 'Threshold cannot be negative']
  }
}, {
  timestamps: true
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
