const hotelService = require('../services/hotel.service');
const catchAsync = require('../utils/catchAsync');

const getAllHotels = catchAsync(async (req, res, next) => {
  const hotels = await hotelService.getAllHotels();
  res.status(200).json(hotels);
});

const getHotelById = catchAsync(async (req, res, next) => {
  const hotel = await hotelService.getHotelById(req.params.id);
  res.status(200).json(hotel);
});

const createHotel = catchAsync(async (req, res, next) => {
  const newHotel = await hotelService.createHotel(req.body, req.user);
  res.status(201).json({
    success: true,
    data: newHotel
  });
});

const updateHotel = catchAsync(async (req, res, next) => {
  const updatedHotel = await hotelService.updateHotel(req.params.id, req.body, req.user);
  res.status(200).json({
    success: true,
    data: updatedHotel
  });
});

const deleteHotel = catchAsync(async (req, res, next) => {
  const result = await hotelService.deleteHotel(req.params.id, req.user);
  res.status(200).json(result);
});

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
