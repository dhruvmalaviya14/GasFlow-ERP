const inventoryService = require('../services/inventory.service');
const catchAsync = require('../utils/catchAsync');

const getInventory = catchAsync(async (req, res, next) => {
  const inventory = await inventoryService.getInventory();
  res.status(200).json(inventory);
});

const updateInventoryManual = catchAsync(async (req, res, next) => {
  const inventory = await inventoryService.updateInventoryManual(req.body, req.user);
  res.status(200).json({
    success: true,
    data: inventory
  });
});

const recordStockArrival = catchAsync(async (req, res, next) => {
  const inventory = await inventoryService.recordStockArrival(req.body, req.user);
  res.status(200).json({
    success: true,
    data: inventory
  });
});

module.exports = {
  getInventory,
  updateInventoryManual,
  recordStockArrival
};
