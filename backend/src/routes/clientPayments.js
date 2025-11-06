const express = require('express');
const router = express.Router();
const clientPaymentController = require('../controllers/clientPaymentController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/client-payments
 * @desc    Get all client payments with filters
 * @access  Private
 * @query   booking_id: integer (filter by booking)
 * @query   payment_date_from: date (filter from date, format: YYYY-MM-DD)
 * @query   payment_date_to: date (filter to date, format: YYYY-MM-DD)
 * @query   payment_method: string (filter by payment method)
 * @query   currency: string (filter by currency, e.g., 'USD', 'EUR')
 */
router.get('/', auth, clientPaymentController.getAll);

/**
 * @route   GET /api/client-payments/booking/:booking_id
 * @desc    Get all payments for a specific booking
 * @access  Private
 */
router.get('/booking/:booking_id', auth, clientPaymentController.getByBookingId);

/**
 * @route   GET /api/client-payments/:id
 * @desc    Get single client payment by ID
 * @access  Private
 */
router.get('/:id', auth, clientPaymentController.getById);

/**
 * @route   POST /api/client-payments
 * @desc    Create new client payment
 * @access  Private
 * @body    {
 *            booking_id: integer (required),
 *            payment_date: date (required, format: YYYY-MM-DD),
 *            amount: decimal (required, must be > 0),
 *            currency: string (optional, default: 'USD'),
 *            payment_method: string (optional, e.g., 'cash', 'credit_card', 'bank_transfer'),
 *            reference_number: string (optional, transaction/check number),
 *            notes: string (optional)
 *          }
 */
router.post('/', auth, clientPaymentController.create);

/**
 * @route   PUT /api/client-payments/:id
 * @desc    Update client payment
 * @access  Private
 * @body    Same as POST (all fields optional)
 */
router.put('/:id', auth, clientPaymentController.update);

/**
 * @route   DELETE /api/client-payments/:id
 * @desc    Delete client payment (hard delete)
 * @access  Private
 */
router.delete('/:id', auth, clientPaymentController.deletePayment);

module.exports = router;
