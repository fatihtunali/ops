const express = require('express');
const router = express.Router();
const bookingTransferController = require('../controllers/bookingTransferController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/booking-transfers/booking/:bookingId
 * @desc    Get all transfers for a specific booking
 * @access  Private
 */
router.get('/booking/:bookingId', auth, bookingTransferController.getTransfersByBookingId);

/**
 * @route   GET /api/booking-transfers
 * @desc    Get all booking transfers (with optional filters: booking_id, operation_type, payment_status)
 * @access  Private
 */
router.get('/', auth, bookingTransferController.getAllBookingTransfers);

/**
 * @route   GET /api/booking-transfers/:id
 * @desc    Get single booking transfer by ID
 * @access  Private
 */
router.get('/:id', auth, bookingTransferController.getBookingTransferById);

/**
 * @route   POST /api/booking-transfers
 * @desc    Create new booking transfer
 * @access  Private
 */
router.post('/', auth, bookingTransferController.createBookingTransfer);

/**
 * @route   PUT /api/booking-transfers/:id
 * @desc    Update booking transfer
 * @access  Private
 */
router.put('/:id', auth, bookingTransferController.updateBookingTransfer);

/**
 * @route   DELETE /api/booking-transfers/:id
 * @desc    Delete booking transfer
 * @access  Private
 */
router.delete('/:id', auth, bookingTransferController.deleteBookingTransfer);

module.exports = router;
