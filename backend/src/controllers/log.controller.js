const { readData } = require('../utils/dbHelper');
const catchAsync = require('../utils/catchAsync');

const getActivityLogs = catchAsync(async (req, res, next) => {
  // Retrieve the latest 100 logs from filesystem JSON database
  const logs = readData('logs');
  const sorted = [...logs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 100);

  res.status(200).json(sorted);
});

module.exports = {
  getActivityLogs
};
