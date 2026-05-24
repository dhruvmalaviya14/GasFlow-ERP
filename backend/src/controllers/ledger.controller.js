const ledgerService = require('../services/ledger.service');
const { generateBillPDF } = require('../utils/pdfGenerator');
const catchAsync = require('../utils/catchAsync');

const getLedgerByHotelId = catchAsync(async (req, res, next) => {
  const result = await ledgerService.getLedgerByHotelId(req.params.hotelId);
  res.status(200).json({
    success: true,
    ...result
  });
});

const getBillDetailsByHotelId = catchAsync(async (req, res, next) => {
  const result = await ledgerService.getBillDetailsByHotelId(req.params.hotelId);
  res.status(200).json({
    success: true,
    ...result
  });
});

const downloadBillPDF = catchAsync(async (req, res, next) => {
  const data = await ledgerService.getBillDetailsByHotelId(req.params.hotelId);

  // Set HTTP headers for PDF stream download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice_Statement_${data.hotelName.replace(/\s+/g, '_')}.pdf`);

  // Stream PDF directly to client response
  generateBillPDF(res, data);
});

const getAllLedgersCombined = catchAsync(async (req, res, next) => {
  const result = await ledgerService.getAllLedgersCombined();
  res.status(200).json({
    success: true,
    ...result
  });
});

module.exports = {
  getLedgerByHotelId,
  getBillDetailsByHotelId,
  downloadBillPDF,
  getAllLedgersCombined
};
