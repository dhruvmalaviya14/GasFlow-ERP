const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    // Return empty array or default state
    if (collection === 'users') {
      // Seed default users (bharat, lalo)
      const salt = bcrypt.genSaltSync(10);
      const hashedBharat = bcrypt.hashSync('bharat', salt);
      const hashedLalo = bcrypt.hashSync('lalo', salt);
      const defaultUsers = [
        { _id: 'u1', username: 'bharat', password: hashedBharat, name: 'Bharat (Admin)', role: 'admin', status: 'active' },
        { _id: 'u2', username: 'lalo', password: hashedLalo, name: 'Lalo (Staff)', role: 'staff', status: 'active' }
      ];
      fs.writeFileSync(filePath, JSON.stringify(defaultUsers, null, 2));
      return defaultUsers;
    }
    if (collection === 'inventory') {
      const defaultInventory = { filledStock: 0, emptyStock: 0, lowStockThreshold: 15 };
      fs.writeFileSync(filePath, JSON.stringify(defaultInventory, null, 2));
      return defaultInventory;
    }
    const emptyArray = [];
    fs.writeFileSync(filePath, JSON.stringify(emptyArray, null, 2));
    return emptyArray;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err.message);
    return [];
  }
};

const writeData = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err.message);
    return false;
  }
};

const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

module.exports = {
  readData,
  writeData,
  generateId
};
