const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with filters
 * @access  Private
 * @query   status: 'inquiry', 'quoted', 'confirmed', 'completed', 'cancelled'
 * @query   is_confirmed: true or false
 * @query   client_id: integer (filter by client)
 * @query   travel_date_from: date (YYYY-MM-DD) - filter bookings with travel_date_from >= this date
 * @query   travel_date_to: date (YYYY-MM-DD) - filter bookings with travel_date_to <= this date
 */
router.get('/', auth, bookingController.getAll);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
router.get('/:id', auth, bookingController.getById);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking (booking_code is auto-generated)
 * @access  Private
 * @body    {
 *            client_id: integer (optional),
 *            pax_count: integer (optional),
 *            travel_date_from: date (optional, YYYY-MM-DD),
 *            travel_date_to: date (optional, YYYY-MM-DD),
 *            status: string (optional, default: 'inquiry'),
 *            is_confirmed: boolean (optional, default: false),
 *            total_sell_price: decimal (optional, default: 0),
 *            total_cost_price: decimal (optional, default: 0),
 *            gross_profit: decimal (optional, default: 0),
 *            payment_status: string (optional, default: 'pending'),
 *            amount_received: decimal (optional, default: 0),
 *            notes: string (optional)
 *          }
 */
router.post('/', auth, bookingController.create);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private
 * @body    Same as POST (all fields optional)
 */
router.put('/:id', auth, bookingController.update);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking (soft delete - sets status to 'cancelled')
 * @access  Private
 */
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
