const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/clients
 * @desc    Get all clients with filters (type, status, search)
 * @access  Private
 * @query   type: 'agent' or 'direct'
 * @query   status: 'active' or 'inactive'
 * @query   search: search by name (case-insensitive)
 */
router.get('/', auth, clientController.getAll);

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client by ID
 * @access  Private
 */
router.get('/:id', auth, clientController.getById);

/**
 * @route   POST /api/clients
 * @desc    Create new client
 * @access  Private
 * @body    {
 *            client_code: string (optional, unique),
 *            name: string (required),
 *            type: 'agent' or 'direct' (required),
 *            email: string (optional),
 *            phone: string (optional),
 *            address: string (optional),
 *            commission_rate: decimal (optional, 0-100, for agents only),
 *            notes: string (optional),
 *            status: string (optional, default: 'active')
 *          }
 */
router.post('/', auth, clientController.create);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private
 * @body    Same as POST (all fields optional)
 */
router.put('/:id', auth, clientController.update);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client (soft delete - sets status to 'inactive')
 * @access  Private
 */
router.delete('/:id', auth, clientController.deleteClient);

module.exports = router;
