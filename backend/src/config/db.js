const { readData } = require('../utils/dbHelper');

const connectDB = async () => {
  try {
    // Simply read data to trigger initial local filesystem file seeding (users, inventory)
    readData('users');
    readData('inventory');
    console.log('------------------------------------------------------------');
    console.log('🚀 GASFLOW ERP RUNNING IN PORTABLE FLAT-FILE DATABASE MODE!');
    console.log('📁 Data is securely saved locally at: backend/data/');
    console.log('ℹ️ No local MongoDB server or service startup required.');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
  }
};

module.exports = connectDB;
