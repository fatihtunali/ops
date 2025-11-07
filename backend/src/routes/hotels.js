const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const seasonalRatesController = require('../controllers/hotelSeasonalRatesController');
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

// ============================================================
// SEASONAL RATES ROUTES
// ============================================================

/**
 * @route   GET /api/hotels/:hotelId/seasonal-rates
 * @desc    Get all seasonal rates for a hotel
 * @access  Private
 */
router.get('/:hotelId/seasonal-rates', auth, seasonalRatesController.getByHotelId);

/**
 * @route   GET /api/hotels/:hotelId/seasonal-rates/date/:date
 * @desc    Get rate for specific date (format: YYYY-MM-DD)
 * @access  Private
 */
router.get('/:hotelId/seasonal-rates/date/:date', auth, seasonalRatesController.getRateForDate);

/**
 * @route   POST /api/hotels/:hotelId/seasonal-rates
 * @desc    Create new seasonal rate period
 * @access  Private
 */
router.post('/:hotelId/seasonal-rates', auth, seasonalRatesController.create);

/**
 * @route   PUT /api/hotels/:hotelId/seasonal-rates/:rateId
 * @desc    Update seasonal rate period
 * @access  Private
 */
router.put('/:hotelId/seasonal-rates/:rateId', auth, seasonalRatesController.update);

/**
 * @route   DELETE /api/hotels/:hotelId/seasonal-rates/:rateId
 * @desc    Delete seasonal rate period
 * @access  Private
 */
router.delete('/:hotelId/seasonal-rates/:rateId', auth, seasonalRatesController.delete);

module.exports = router;
