const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth');

router.get('/', protect, paymentController.getAllPayments);
router.post('/', protect, paymentController.recordPayment);
router.get('/status', protect, paymentController.getPaymentStatus);

module.exports = router;
