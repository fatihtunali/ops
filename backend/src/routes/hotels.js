const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/hotels
 * @desc    Get all hotels with optional filters (city, country, status)
 * @access  Private
 * @query   city, country, status
 */
router.get('/', auth, hotelController.getAll);

/**
 * @route   GET /api/hotels/:id
 * @desc    Get single hotel by ID
 * @access  Private
 */
router.get('/:id', auth, hotelController.getById);

/**
 * @route   POST /api/hotels
 * @desc    Create new hotel
 * @access  Private
 */
router.post('/', auth, hotelController.create);

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel
 * @access  Private
 */
router.put('/:id', auth, hotelController.update);

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete hotel (soft delete - set status to inactive)
 * @access  Private
 */
router.delete('/:id', auth, hotelController.deleteHotel);

module.exports = router;
