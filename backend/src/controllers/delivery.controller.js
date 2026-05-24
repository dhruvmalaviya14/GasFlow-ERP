const deliveryService = require('../services/delivery.service');
const catchAsync = require('../utils/catchAsync');

const getAllDeliveries = catchAsync(async (req, res, next) => {
  const populatedDeliveries = await deliveryService.getAllDeliveries();
  res.status(200).json(populatedDeliveries);
});

const createDelivery = catchAsync(async (req, res, next) => {
  const result = await deliveryService.createDelivery(req.body, req.user);
  res.status(201).json({
    success: true,
    ...result
  });
});

module.exports = {
  getAllDeliveries,
  createDelivery
};
