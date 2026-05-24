const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { protect } = require('../middlewares/auth');

router.get('/', protect, logController.getActivityLogs);

module.exports = router;
