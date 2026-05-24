const { readData, writeData, generateId } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const getAllPayments = async () => {
  const payments = readData('payments');
  const hotels = readData('hotels');
  const users = readData('users');

  return payments.map(pmt => {
    const hotel = hotels.find(h => h._id === pmt.hotel);
    const user = users.find(u => u._id === pmt.receivedBy);
    return {
      ...pmt,
      hotel: hotel ? { name: hotel.name } : null,
      receivedBy: user ? { name: user.name } : null
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const recordPayment = async (paymentData, currentUser) => {
  const { hotelId, amount, paymentMethod, notes } = paymentData;

  if (!hotelId || !amount) {
    throw new AppError('Hotel and Payment Amount are required', 400);
  }

  const payAmt = Number(amount);
  if (payAmt <= 0) {
    throw new AppError('Payment amount must be greater than zero', 400);
  }

  // 1. Read local files
  const hotels = readData('hotels');
  const payments = readData('payments');
  const ledger = readData('ledger');
  const logs = readData('logs');

  // 2. Fetch specific Hotel
  const hotelIndex = hotels.findIndex(h => h._id === hotelId);
  if (hotelIndex === -1) {
    throw new AppError('Hotel not found', 404);
  }
  const hotel = hotels[hotelIndex];

  // 3. Decrement hotel pending dues and increment total settled payments
  const finalBalance = hotel.pendingBalance - payAmt;
  hotel.pendingBalance = finalBalance;
  hotel.totalPaid += payAmt;

  // 4. Create Payment Document
  const paymentId = generateId();
  const paymentNo = `PMT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  
  const newPayment = {
    _id: paymentId,
    paymentNo,
    hotel: hotelId,
    amount: payAmt,
    paymentMethod: paymentMethod || 'cash',
    receivedBy: currentUser.id || currentUser._id,
    notes,
    createdAt: new Date().toISOString()
  };
  payments.push(newPayment);

  // 5. Create Ledger Credit Entry
  const ledgerCredit = {
    _id: generateId(),
    hotel: hotelId,
    type: 'payment',
    referenceId: paymentId,
    debit: 0,
    credit: payAmt,
    runningBalance: finalBalance,
    notes: notes || `Direct hotel payment recorded. Method: ${paymentMethod || 'cash'}`,
    createdAt: new Date().toISOString()
  };
  ledger.push(ledgerCredit);

  // 6. Create Activity Log
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Recorded payment ${paymentNo} of Rs. ${payAmt} from ${hotel.name}`,
    createdAt: new Date().toISOString()
  });

  // 7. Write back changes
  writeData('hotels', hotels);
  writeData('payments', payments);
  writeData('ledger', ledger);
  writeData('logs', logs);

  return {
    payment: newPayment,
    outstandingDue: finalBalance
  };
};

const getPaymentStatus = async () => {
  const hotels = readData('hotels');
  return [...hotels].sort((a, b) => a.name.localeCompare(b.name)).map(h => {
    return {
      hotel_id: h._id,
      name: h.name,
      rate: h.rate,
      paid: h.totalPaid,
      pending: h.pendingBalance,
      status: h.pendingBalance <= 0 ? 'done' : 'pending'
    };
  });
};

module.exports = {
  getAllPayments,
  recordPayment,
  getPaymentStatus
};
