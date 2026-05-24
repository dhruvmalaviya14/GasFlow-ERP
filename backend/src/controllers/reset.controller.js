const resetService = require('../services/reset.service');
const catchAsync = require('../utils/catchAsync');

const resetSystem = catchAsync(async (req, res, next) => {
  const result = await resetService.resetSystem(req.user);
  res.status(200).json({
    success: true,
    message: 'ERP database reset completed successfully'
  });
});

module.exports = {
  resetSystem
};
