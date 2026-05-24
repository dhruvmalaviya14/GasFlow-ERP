const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect } = require('../middlewares/auth');

router.get('/', protect, inventoryController.getInventory);
router.post('/update', protect, inventoryController.updateInventoryManual);
router.post('/arrival', protect, inventoryController.recordStockArrival);

module.exports = router;
