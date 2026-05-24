const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');

router.post('/login', authController.login);
router.get('/profile', protect, authController.getProfile);

module.exports = router;
