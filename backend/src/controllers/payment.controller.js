const paymentService = require('../services/payment.service');
const catchAsync = require('../utils/catchAsync');

const getAllPayments = catchAsync(async (req, res, next) => {
  const populatedPayments = await paymentService.getAllPayments();
  res.status(200).json(populatedPayments);
});

const recordPayment = catchAsync(async (req, res, next) => {
  const result = await paymentService.recordPayment(req.body, req.user);
  res.status(201).json({
    success: true,
    ...result
  });
});

const getPaymentStatus = catchAsync(async (req, res, next) => {
  const statusSummary = await paymentService.getPaymentStatus();
  res.status(200).json(statusSummary);
});

module.exports = {
  getAllPayments,
  recordPayment,
  getPaymentStatus
};
