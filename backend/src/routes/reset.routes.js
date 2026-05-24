const express = require('express');
const router = express.Router();
const resetController = require('../controllers/reset.controller');
const { protect, admin } = require('../middlewares/auth');

router.post('/reset-system', protect, admin, resetController.resetSystem);

module.exports = router;
