const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledger.controller');
const { protect } = require('../middlewares/auth');

router.get('/', protect, ledgerController.getAllLedgersCombined);
router.get('/:hotelId', protect, ledgerController.getLedgerByHotelId);
router.get('/bill/:hotelId', protect, ledgerController.getBillDetailsByHotelId);
router.get('/bill/download/:hotelId', protect, ledgerController.downloadBillPDF);

module.exports = router;
