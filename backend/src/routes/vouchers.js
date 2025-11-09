const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/vouchers
 * @desc    Get all vouchers with filters (booking_id, voucher_type, search)
 * @access  Private
 * @query   booking_id: integer (filter by booking)
 * @query   voucher_type: 'hotel', 'tour', 'transfer', or 'flight'
 * @query   search: search by voucher_number (case-insensitive)
 */
router.get('/', auth, voucherController.getAll);

/**
 * @route   GET /api/vouchers/booking/:bookingId/services
 * @desc    Get all services for a booking (for voucher selection)
 * @access  Private
 */
router.get('/booking/:bookingId/services', auth, voucherController.getBookingServices);

/**
 * @route   GET /api/vouchers/:id
 * @desc    Get single voucher by ID
 * @access  Private
 */
router.get('/:id', auth, voucherController.getById);

/**
 * @route   GET /api/vouchers/:id/download
 * @desc    Download voucher PDF
 * @access  Private
 */
router.get('/:id/download', auth, voucherController.downloadVoucher);

/**
 * @route   POST /api/vouchers
 * @desc    Create new voucher
 * @access  Private
 * @body    {
 *            booking_id: integer (required),
 *            voucher_type: 'hotel' | 'tour' | 'transfer' | 'flight' (required),
 *            service_id: integer (optional, references booking_hotels, booking_tours, etc.),
 *            pdf_path: string (optional, file path to generated PDF),
 *            sent_to: string (optional, email address where sent)
 *          }
 * @note    voucher_number is auto-generated in format: VC-YYYYMMDD-NNNN
 * @note    issued_date is automatically set to current timestamp
 * @note    sent_at is automatically set when sent_to is provided
 */
router.post('/', auth, voucherController.create);

/**
 * @route   PUT /api/vouchers/:id
 * @desc    Update voucher
 * @access  Private
 * @body    Same as POST (all fields optional)
 * @note    voucher_number cannot be changed (auto-generated on create)
 * @note    sent_at is automatically updated when sent_to is modified
 */
router.put('/:id', auth, voucherController.update);

/**
 * @route   DELETE /api/vouchers/:id
 * @desc    Delete voucher (hard delete)
 * @access  Private
 */
router.delete('/:id', auth, voucherController.deleteVoucher);

/**
 * @route   POST /api/vouchers/generate/hotel
 * @desc    Generate hotel voucher PDF
 * @access  Private
 * @body    { booking_id: integer, hotel_id: integer }
 */
router.post('/generate/hotel', auth, voucherController.generateHotelVoucher);

/**
 * @route   POST /api/vouchers/generate/tour
 * @desc    Generate tour voucher PDF
 * @access  Private
 * @body    { booking_id: integer, tour_id: integer }
 */
router.post('/generate/tour', auth, voucherController.generateTourVoucher);

/**
 * @route   POST /api/vouchers/generate/transfer
 * @desc    Generate transfer voucher PDF
 * @access  Private
 * @body    { booking_id: integer, transfer_id: integer }
 */
router.post('/generate/transfer', auth, voucherController.generateTransferVoucher);

/**
 * @route   POST /api/vouchers/generate/flight
 * @desc    Generate flight voucher PDF
 * @access  Private
 * @body    { booking_id: integer, flight_id: integer }
 */
router.post('/generate/flight', auth, voucherController.generateFlightVoucher);

module.exports = router;
