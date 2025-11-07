const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All user routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @query   role, status, search
 * @access  Private (Admin only)
 */
router.get('/', userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', userController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/', userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Private (Admin only)
 */
router.put('/:id', userController.updateUser);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private (Admin only)
 */
router.put('/:id/password', userController.updatePassword);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', userController.deactivateUser);

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user
 * @access  Private (Admin only)
 */
router.put('/:id/activate', userController.activateUser);

module.exports = router;
