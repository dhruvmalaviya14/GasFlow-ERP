const { readData, writeData, generateId } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const getInventory = async () => {
  return readData('inventory');
};

const updateInventoryManual = async (data, currentUser) => {
  const { filled, empty, lowStockThreshold } = data;

  if (filled === undefined || empty === undefined) {
    throw new AppError('Please provide both filled and empty stocks', 400);
  }

  const inventory = readData('inventory');
  inventory.filledStock = Number(filled);
  inventory.emptyStock = Number(empty);
  
  if (lowStockThreshold !== undefined) {
    inventory.lowStockThreshold = Number(lowStockThreshold);
  }

  writeData('inventory', inventory);

  // Log activity
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Manually updated inventory → Filled: ${filled}, Empty: ${empty}`,
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return inventory;
};

const recordStockArrival = async (data, currentUser) => {
  const { filledQty, emptySentQty, notes } = data;

  if (!filledQty) {
    throw new AppError('Please specify arrived filled quantity', 400);
  }

  const inventory = readData('inventory');
  inventory.filledStock += Number(filledQty);

  if (emptySentQty) {
    inventory.emptyStock = Math.max(0, inventory.emptyStock - Number(emptySentQty));
  }

  writeData('inventory', inventory);

  // Log activity
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Stock Arrived: Added ${filledQty} filled cylinders, Sent ${emptySentQty || 0} empty cylinders back to refinery. Notes: ${notes || 'None'}`,
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return inventory;
};

module.exports = {
  getInventory,
  updateInventoryManual,
  recordStockArrival
};
