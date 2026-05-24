const { readData } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const getLedgerByHotelId = async (hotelId) => {
  const hotels = readData('hotels');
  const hotel = hotels.find(h => h._id === hotelId);
  if (!hotel) {
    throw new AppError('Hotel not found', 404);
  }

  // Get chronological ledger records (newest first)
  const ledger = readData('ledger');
  const ledgerEntries = ledger
    .filter(l => l.hotel === hotelId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    hotel: {
      name: hotel.name,
      rate: hotel.rate,
      pendingBalance: hotel.pendingBalance,
      totalPaid: hotel.totalPaid,
      filledCylinders: hotel.filledCylinders,
      emptyCylinders: hotel.emptyCylinders
    },
    ledger: ledgerEntries
  };
};

const getBillDetailsByHotelId = async (hotelId) => {
  const hotels = readData('hotels');
  const hotel = hotels.find(h => h._id === hotelId);
  if (!hotel) {
    throw new AppError('Hotel not found', 404);
  }

  const deliveries = readData('deliveries');
  const hotelDeliveries = deliveries.filter(d => d.hotel === hotelId);
  
  const totalCylinders = hotelDeliveries.reduce((acc, curr) => acc + curr.deliveredQty, 0);
  const totalAmount = hotelDeliveries.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return {
    hotelName: hotel.name,
    address: hotel.address,
    contact: hotel.contact,
    rate: hotel.rate,
    totalCylinders,
    totalAmount,
    paid: hotel.totalPaid,
    pending: hotel.pendingBalance,
    status: hotel.pendingBalance <= 0 ? 'done' : 'pending'
  };
};

const getAllLedgersCombined = async () => {
  const hotels = readData('hotels');
  const ledger = readData('ledger');

  // Sum up all metrics from all hotels
  let pendingBalance = 0;
  let totalPaid = 0;
  let filledCylinders = 0;
  let emptyCylinders = 0;

  hotels.forEach(h => {
    pendingBalance += Number(h.pendingBalance || 0);
    totalPaid += Number(h.totalPaid || 0);
    filledCylinders += Number(h.filledCylinders || 0);
    emptyCylinders += Number(h.emptyCylinders || 0);
  });

  // Map each ledger entry to include its hotel name
  const ledgerEntries = ledger
    .map(entry => {
      const hotel = hotels.find(h => h._id === entry.hotel);
      return {
        ...entry,
        hotelName: hotel ? hotel.name : 'Unknown Hotel'
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    hotel: {
      name: "All Restaurants Combined",
      rate: "Variable",
      pendingBalance,
      totalPaid,
      filledCylinders,
      emptyCylinders
    },
    ledger: ledgerEntries
  };
};

module.exports = {
  getLedgerByHotelId,
  getBillDetailsByHotelId,
  getAllLedgersCombined
};
