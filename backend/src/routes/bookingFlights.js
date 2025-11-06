const express = require('express');
const router = express.Router();
const bookingFlightController = require('../controllers/bookingFlightController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/booking-flights
 * @desc    Get all booking flights with optional filters (booking_id, airline, payment_status, voucher_issued)
 * @access  Private
 * @query   booking_id, airline, payment_status, voucher_issued
 */
router.get('/', auth, bookingFlightController.getAll);

/**
 * @route   GET /api/booking-flights/booking/:booking_id
 * @desc    Get all flights for a specific booking
 * @access  Private
 */
router.get('/booking/:booking_id', auth, bookingFlightController.getByBookingId);

/**
 * @route   GET /api/booking-flights/:id
 * @desc    Get single booking flight by ID
 * @access  Private
 */
router.get('/:id', auth, bookingFlightController.getById);

/**
 * @route   POST /api/booking-flights
 * @desc    Create new booking flight
 * @access  Private
 */
router.post('/', auth, bookingFlightController.create);

/**
 * @route   PUT /api/booking-flights/:id
 * @desc    Update booking flight
 * @access  Private
 */
router.put('/:id', auth, bookingFlightController.update);

/**
 * @route   DELETE /api/booking-flights/:id
 * @desc    Delete booking flight
 * @access  Private
 */
router.delete('/:id', auth, bookingFlightController.deleteBookingFlight);

module.exports = router;
