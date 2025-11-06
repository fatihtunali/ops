const express = require('express');
const router = express.Router();
const supplierPaymentController = require('../controllers/supplierPaymentController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/supplier-payments/stats
 * @desc    Get supplier payment statistics
 * @access  Private
 */
router.get('/stats', auth, supplierPaymentController.getStats);

/**
 * @route   GET /api/supplier-payments
 * @desc    Get all supplier payments with optional filters (status, supplier_type, due_date_from, due_date_to, booking_id)
 * @access  Private
 * @query   status, supplier_type, due_date_from, due_date_to, booking_id
 */
router.get('/', auth, supplierPaymentController.getAll);

/**
 * @route   GET /api/supplier-payments/:id
 * @desc    Get single supplier payment by ID
 * @access  Private
 */
router.get('/:id', auth, supplierPaymentController.getById);

/**
 * @route   POST /api/supplier-payments
 * @desc    Create new supplier payment
 * @access  Private
 */
router.post('/', auth, supplierPaymentController.create);

/**
 * @route   PUT /api/supplier-payments/:id
 * @desc    Update supplier payment
 * @access  Private
 */
router.put('/:id', auth, supplierPaymentController.update);

/**
 * @route   DELETE /api/supplier-payments/:id
 * @desc    Delete supplier payment
 * @access  Private
 */
router.delete('/:id', auth, supplierPaymentController.deletePayment);

module.exports = router;
