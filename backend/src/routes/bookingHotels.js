const express = require('express');
const router = express.Router();
const bookingHotelController = require('../controllers/bookingHotelController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/booking-hotels
 * @desc    Get all booking hotels with optional filters (booking_id, payment_status, check_in dates)
 * @access  Private
 * @query   booking_id, payment_status, check_in_from, check_in_to
 */
router.get('/', auth, bookingHotelController.getAll);

/**
 * @route   GET /api/booking-hotels/:id
 * @desc    Get single booking hotel by ID
 * @access  Private
 */
router.get('/:id', auth, bookingHotelController.getById);

/**
 * @route   POST /api/booking-hotels
 * @desc    Create new booking hotel
 * @access  Private
 */
router.post('/', auth, bookingHotelController.create);

/**
 * @route   PUT /api/booking-hotels/:id
 * @desc    Update booking hotel
 * @access  Private
 */
router.put('/:id', auth, bookingHotelController.update);

/**
 * @route   DELETE /api/booking-hotels/:id
 * @desc    Delete booking hotel (hard delete)
 * @access  Private
 */
router.delete('/:id', auth, bookingHotelController.deleteBookingHotel);

module.exports = router;
