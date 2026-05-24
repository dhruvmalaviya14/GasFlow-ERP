const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const hotelRoutes = require('./hotel.routes');
const inventoryRoutes = require('./inventory.routes');
const deliveryRoutes = require('./delivery.routes');
const paymentRoutes = require('./payment.routes');
const ledgerRoutes = require('./ledger.routes');
const resetRoutes = require('./reset.routes');
const logRoutes = require('./log.routes');

router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/payments', paymentRoutes);
router.use('/ledger', ledgerRoutes);
router.use('/reset', resetRoutes);
router.use('/logs', logRoutes);

module.exports = router;
