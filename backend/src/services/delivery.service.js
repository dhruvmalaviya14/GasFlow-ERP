const { readData, writeData, generateId } = require('../utils/dbHelper');
const AppError = require('../utils/AppError');

const generateDeliveryNo = (deliveriesCount) => {
  const year = new Date().getFullYear();
  return `DLV-${year}-${String(deliveriesCount + 1).padStart(4, '0')}`;
};

const getAllDeliveries = async () => {
  const deliveries = readData('deliveries');
  const hotels = readData('hotels');
  const users = readData('users');

  // Populates hotel and staff details manually from memory arrays
  return deliveries.map(dlv => {
    const hotel = hotels.find(h => h._id === dlv.hotel);
    const staff = users.find(u => u._id === dlv.staff);
    return {
      ...dlv,
      hotel: hotel ? { _id: hotel._id, name: hotel.name, rate: hotel.rate } : null,
      staff: staff ? { _id: staff._id, name: staff.name, username: staff.username } : null
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const createDelivery = async (deliveryData, currentUser) => {
  const { hotelId, deliveredQty, returnedEmptiesQty, paymentReceived, paymentMethod, notes } = deliveryData;

  if (!hotelId || deliveredQty === undefined || returnedEmptiesQty === undefined) {
    throw new AppError('Hotel, Delivered Qty, and Returned Qty are required', 400);
  }

  const dQty = Number(deliveredQty);
  const rQty = Number(returnedEmptiesQty);
  const payRec = Number(paymentReceived || 0);

  if (dQty < 0 || rQty < 0) {
    throw new AppError('Quantities cannot be negative', 400);
  }

  if (dQty === 0 && rQty === 0) {
    throw new AppError('Specify at least 1 cylinder delivered or returned empty', 400);
  }

  // 1. Read flat files database
  const hotels = readData('hotels');
  const inventory = readData('inventory');
  const deliveries = readData('deliveries');
  const ledger = readData('ledger');
  const payments = readData('payments');
  const logs = readData('logs');

  // 2. Fetch specific Hotel
  const hotelIndex = hotels.findIndex(h => h._id === hotelId);
  if (hotelIndex === -1) {
    throw new AppError('Hotel not found', 404);
  }
  const hotel = hotels[hotelIndex];

  // 3. Validate warehouse filled stock availability
  if (inventory.filledStock < dQty) {
    throw new AppError(`Insufficient warehouse filled stock. Only ${inventory.filledStock} available.`, 400);
  }

  // 4. Cylinder exchange logic
  const originalEmptyCylinders = hotel.emptyCylinders;
  const originalFilledCylinders = hotel.filledCylinders;
  const simulatedEmptyStock = originalEmptyCylinders + originalFilledCylinders;

  if (rQty > simulatedEmptyStock) {
    throw new AppError(`Hotel has only ${simulatedEmptyStock} empty cylinders outstanding. Cannot return ${rQty}.`, 400);
  }

  // 5. Cost calculations & Serial billing number
  const totalAmount = hotel.rate * dQty;
  const deliveryNo = generateDeliveryNo(deliveries.length);

  // 6. Update inventory (Warehouse)
  inventory.filledStock -= dQty;
  inventory.emptyStock += rQty;

  // 7. Update Hotel outstanding cylinder pools
  hotel.filledCylinders = dQty;
  hotel.emptyCylinders = simulatedEmptyStock - rQty;

  // 8. Update Hotel pending credit balance
  const initialPendingBalance = hotel.pendingBalance;
  const afterDeliveryBalance = initialPendingBalance + totalAmount;
  hotel.pendingBalance = afterDeliveryBalance;

  // 9. Record Delivery Document
  const deliveryId = generateId();
  const newDelivery = {
    _id: deliveryId,
    deliveryNo,
    hotel: hotelId,
    staff: currentUser.id || currentUser._id,
    deliveredQty: dQty,
    returnedEmptiesQty: rQty,
    totalAmount,
    paymentReceived: payRec,
    paymentMethod: payRec > 0 ? paymentMethod : 'none',
    notes,
    createdAt: new Date().toISOString()
  };
  deliveries.push(newDelivery);

  // 10. Record Ledger Debit entry
  const ledgerDebit = {
    _id: generateId(),
    hotel: hotelId,
    type: 'delivery',
    referenceId: deliveryId,
    debit: totalAmount,
    credit: 0,
    runningBalance: afterDeliveryBalance,
    notes: `Delivered ${dQty} cylinders, collected ${rQty} empties.`,
    createdAt: new Date().toISOString()
  };
  ledger.push(ledgerDebit);

  let paymentRecord = null;
  let finalBalance = afterDeliveryBalance;

  // 11. Process direct payment collected during cylinder release
  if (payRec > 0) {
    const paymentId = generateId();
    const paymentNo = `PMT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    paymentRecord = {
      _id: paymentId,
      paymentNo,
      hotel: hotelId,
      amount: payRec,
      paymentMethod: paymentMethod || 'cash',
      receivedBy: currentUser.id || currentUser._id,
      notes: `Paid during delivery ${deliveryNo}`,
      createdAt: new Date().toISOString()
    };
    payments.push(paymentRecord);

    finalBalance = afterDeliveryBalance - payRec;
    hotel.pendingBalance = finalBalance;
    hotel.totalPaid += payRec;

    // Record Ledger Credit entry
    const ledgerCredit = {
      _id: generateId(),
      hotel: hotelId,
      type: 'payment',
      referenceId: paymentId,
      debit: 0,
      credit: payRec,
      runningBalance: finalBalance,
      notes: `Payment received during delivery ${deliveryNo}`,
      createdAt: new Date().toISOString()
    };
    ledger.push(ledgerCredit);
  }

  // 12. Record Activity Log
  logs.push({
    _id: generateId(),
    user: currentUser.username,
    action: `Recorded delivery ${deliveryNo} for ${hotel.name}: Delivered ${dQty}, Returned ${rQty}, Paid: ${payRec}`,
    createdAt: new Date().toISOString()
  });

  // 13. Write changes back to the flat-files (Commit transaction)
  writeData('hotels', hotels);
  writeData('inventory', inventory);
  writeData('deliveries', deliveries);
  writeData('ledger', ledger);
  writeData('payments', payments);
  writeData('logs', logs);

  return {
    delivery: newDelivery,
    payment: paymentRecord,
    outstandingDue: finalBalance
  };
};

module.exports = {
  getAllDeliveries,
  createDelivery
};
