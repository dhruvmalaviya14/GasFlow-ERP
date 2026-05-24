const bcrypt = require('bcryptjs');
const { readData, writeData, generateId } = require('../utils/dbHelper');

const resetSystem = async (currentUser) => {
  // 1. Wipe deliveries, payments, ledger logs
  writeData('deliveries', []);
  writeData('payments', []);
  writeData('ledger', []);

  // 2. Zero hotel cylinders and balance accounts
  const hotels = readData('hotels');
  const resetHotels = hotels.map(h => {
    return {
      ...h,
      filledCylinders: 0,
      emptyCylinders: 0,
      pendingBalance: 0,
      totalPaid: 0,
      updatedAt: new Date().toISOString()
    };
  });
  writeData('hotels', resetHotels);

  // 3. Zero warehouse stock
  const inventory = {
    filledStock: 0,
    emptyStock: 0,
    lowStockThreshold: 15
  };
  writeData('inventory', inventory);

  // 4. Seed and restore default users
  const salt = bcrypt.genSaltSync(10);
  const hashedBharat = bcrypt.hashSync('bharat', salt);
  const hashedLalo = bcrypt.hashSync('lalo', salt);
  const defaultUsers = [
    { _id: 'u1', username: 'bharat', password: hashedBharat, name: 'Bharat (Admin)', role: 'admin', status: 'active' },
    { _id: 'u2', username: 'lalo', password: hashedLalo, name: 'Lalo (Staff)', role: 'staff', status: 'active' }
  ];
  writeData('users', defaultUsers);

  // 5. Log audit reset
  const logs = [];
  logs.push({
    _id: generateId(),
    user: currentUser ? currentUser.username : 'system',
    action: 'Executed administrative full system transactional reset.',
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return { success: true };
};

module.exports = {
  resetSystem
};
