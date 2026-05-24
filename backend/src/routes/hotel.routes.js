const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const { protect, admin } = require('../middlewares/auth');

router.get('/', protect, hotelController.getAllHotels);
router.get('/:id', protect, hotelController.getHotelById);
router.post('/', protect, hotelController.createHotel);
router.put('/:id', protect, hotelController.updateHotel);
router.delete('/:id', protect, admin, hotelController.deleteHotel);

module.exports = router;
