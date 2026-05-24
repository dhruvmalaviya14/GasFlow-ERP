const { readData, writeData, generateId } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const getAllHotels = async () => {
  const hotels = readData('hotels');
  return [...hotels].sort((a, b) => a.name.localeCompare(b.name));
};

const getHotelById = async (id) => {
  const hotels = readData('hotels');
  const hotel = hotels.find(h => h._id === id);
  if (!hotel) {
    throw new AppError('Hotel not found', 404);
  }
  return hotel;
};

const createHotel = async (hotelData, currentUser) => {
  const { name, address, contact, rate, creditLimit } = hotelData;

  if (!name || !address || !contact || rate === undefined) {
    throw new AppError('Please provide all required fields', 400);
  }

  const hotels = readData('hotels');
  const nameLower = name.toLowerCase();
  const hotelExists = hotels.some(h => h.name.toLowerCase() === nameLower);
  if (hotelExists) {
    throw new AppError('Hotel with this name already exists', 400);
  }

  const newHotel = {
    _id: generateId(),
    name,
    address,
    contact,
    rate: Number(rate),
    creditLimit: creditLimit !== undefined ? Number(creditLimit) : 50000,
    filledCylinders: 0,
    emptyCylinders: 0,
    pendingBalance: 0,
    totalPaid: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  hotels.push(newHotel);
  writeData('hotels', hotels);

  // Log activity
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Created hotel ${name}`,
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return newHotel;
};

const updateHotel = async (id, updateData, currentUser) => {
  const hotels = readData('hotels');
  const index = hotels.findIndex(h => h._id === id);
  if (index === -1) {
    throw new AppError('Hotel not found', 404);
  }

  const hotel = hotels[index];

  // Check unique name if updated
  if (updateData.name && updateData.name.toLowerCase() !== hotel.name.toLowerCase()) {
    const nameLower = updateData.name.toLowerCase();
    const existing = hotels.some(h => h.name.toLowerCase() === nameLower);
    if (existing) {
      throw new AppError('Another hotel with this name exists', 400);
    }
  }

  hotel.name = updateData.name || hotel.name;
  hotel.address = updateData.address || hotel.address;
  hotel.contact = updateData.contact || hotel.contact;
  hotel.rate = updateData.rate !== undefined ? Number(updateData.rate) : hotel.rate;
  hotel.creditLimit = updateData.creditLimit !== undefined ? Number(updateData.creditLimit) : hotel.creditLimit;
  hotel.updatedAt = new Date().toISOString();

  writeData('hotels', hotels);

  // Log activity
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Updated hotel details for ${hotel.name}`,
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return hotel;
};

const deleteHotel = async (id, currentUser) => {
  const hotels = readData('hotels');
  const index = hotels.findIndex(h => h._id === id);
  if (index === -1) {
    throw new AppError('Hotel not found', 404);
  }

  const hotel = hotels[index];

  // Prevent deleting hotels with outstanding stock/ledger balances
  if (hotel.pendingBalance > 0 || hotel.filledCylinders > 0 || hotel.emptyCylinders > 0) {
    throw new AppError('Cannot delete hotel with outstanding pending balance or gas cylinders', 400);
  }

  hotels.splice(index, 1);
  writeData('hotels', hotels);

  // Log activity
  const logs = readData('logs');
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Deleted hotel ${hotel.name}`,
    createdAt: new Date().toISOString()
  });
  writeData('logs', logs);

  return { success: true };
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
};
