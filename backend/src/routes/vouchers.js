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
 * @route   GET /api/vouchers/:id
 * @desc    Get single voucher by ID
 * @access  Private
 */
router.get('/:id', auth, voucherController.getById);

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

module.exports = router;
