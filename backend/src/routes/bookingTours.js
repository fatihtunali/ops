const express = require('express');
const router = express.Router();
const bookingTourController = require('../controllers/bookingTourController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/booking-tours/stats/summary
 * @desc    Get booking tour statistics
 * @access  Private
 */
router.get('/stats/summary', auth, bookingTourController.getBookingTourStats);

/**
 * @route   GET /api/booking-tours/booking/:booking_id
 * @desc    Get all tours for a specific booking
 * @access  Private
 */
router.get('/booking/:booking_id', auth, bookingTourController.getBookingToursByBookingId);

/**
 * @route   GET /api/booking-tours
 * @desc    Get all booking tours (with pagination, filtering, search)
 * @access  Private
 * @query   booking_id - Filter by booking ID
 * @query   operation_type - Filter by operation type (supplier/self-operated)
 * @query   payment_status - Filter by payment status (pending/paid)
 * @query   tour_date_from - Filter tours from this date
 * @query   tour_date_to - Filter tours until this date
 * @query   search - Search in tour_name, confirmation_number, notes
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/', auth, bookingTourController.getAllBookingTours);

/**
 * @route   GET /api/booking-tours/:id
 * @desc    Get single booking tour by ID
 * @access  Private
 */
router.get('/:id', auth, bookingTourController.getBookingTourById);

/**
 * @route   POST /api/booking-tours
 * @desc    Create new booking tour
 * @access  Private
 */
router.post('/', auth, bookingTourController.createBookingTour);

/**
 * @route   PUT /api/booking-tours/:id
 * @desc    Update booking tour
 * @access  Private
 */
router.put('/:id', auth, bookingTourController.updateBookingTour);

/**
 * @route   DELETE /api/booking-tours/:id
 * @desc    Delete booking tour
 * @access  Private
 */
router.delete('/:id', auth, bookingTourController.deleteBookingTour);

module.exports = router;
