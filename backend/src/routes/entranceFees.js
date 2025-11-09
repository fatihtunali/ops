const express = require('express');
const router = express.Router();
const entranceFeesController = require('../controllers/entranceFeesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/entrance-fees/cities
 * @desc    Get distinct cities from entrance fees
 * @access  Private
 */
router.get('/cities', entranceFeesController.getCities);

/**
 * @route   GET /api/entrance-fees
 * @desc    Get all entrance fees (with filtering by city, season, attraction)
 * @access  Private
 * @query   city - Filter by city
 * @query   season_name - Filter by season name
 * @query   attraction_name - Search in attraction name
 * @query   is_active - Filter by active status (true/false)
 */
router.get('/', entranceFeesController.getAllEntranceFees);

/**
 * @route   GET /api/entrance-fees/:id
 * @desc    Get single entrance fee by ID
 * @access  Private
 */
router.get('/:id', entranceFeesController.getEntranceFeeById);

/**
 * @route   POST /api/entrance-fees
 * @desc    Create new entrance fee
 * @access  Private
 */
router.post('/', entranceFeesController.createEntranceFee);

/**
 * @route   PUT /api/entrance-fees/:id
 * @desc    Update entrance fee
 * @access  Private
 */
router.put('/:id', entranceFeesController.updateEntranceFee);

/**
 * @route   DELETE /api/entrance-fees/:id
 * @desc    Delete entrance fee (soft delete - sets is_active to false)
 * @access  Private
 */
router.delete('/:id', entranceFeesController.deleteEntranceFee);

module.exports = router;
