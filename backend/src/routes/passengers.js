const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/passengers
 * @desc    Get all passengers with optional booking_id filter
 * @access  Private
 * @query   booking_id: integer (optional) - Filter passengers by booking
 */
router.get('/', auth, passengerController.getAll);

/**
 * @route   GET /api/passengers/booking/:booking_id
 * @desc    Get all passengers for a specific booking
 * @access  Private
 */
router.get('/booking/:booking_id', auth, passengerController.getByBooking);

/**
 * @route   GET /api/passengers/:id
 * @desc    Get single passenger by ID
 * @access  Private
 */
router.get('/:id', auth, passengerController.getById);

/**
 * @route   POST /api/passengers
 * @desc    Create new passenger
 * @access  Private
 * @body    {
 *            booking_id: integer (required),
 *            name: string (required),
 *            passport_number: string (optional),
 *            nationality: string (optional),
 *            date_of_birth: string (optional, format: dd/mm/yyyy),
 *            special_requests: string (optional)
 *          }
 */
router.post('/', auth, passengerController.create);

/**
 * @route   PUT /api/passengers/:id
 * @desc    Update passenger
 * @access  Private
 * @body    Same as POST (all fields optional)
 */
router.put('/:id', auth, passengerController.update);

/**
 * @route   DELETE /api/passengers/:id
 * @desc    Delete passenger (hard delete)
 * @access  Private
 */
router.delete('/:id', auth, passengerController.deletePassenger);

module.exports = router;
