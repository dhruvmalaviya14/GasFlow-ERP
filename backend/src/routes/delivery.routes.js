const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { protect } = require('../middlewares/auth');

router.get('/', protect, deliveryController.getAllDeliveries);
router.post('/', protect, deliveryController.createDelivery);

module.exports = router;
