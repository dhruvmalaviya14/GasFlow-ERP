const { readData } = require('../utils/dbHelper');

const connectDB = async () => {
  try {
    // Simply read data to trigger initial file seeding (users, inventory)
    readData('users');
    readData('inventory');
    console.log('Zero-Configuration Portable JSON Database Initialized Successfully!');
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
  }
};

module.exports = connectDB;
