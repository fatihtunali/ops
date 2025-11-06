const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/vehicles/available
 * @desc    Get all available vehicles
 * @access  Private
 */
router.get('/available', auth, vehicleController.getAvailableVehicles);

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles (with optional filters: status, type)
 * @access  Private
 */
router.get('/', auth, vehicleController.getAllVehicles);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get single vehicle by ID
 * @access  Private
 */
router.get('/:id', auth, vehicleController.getVehicleById);

/**
 * @route   POST /api/vehicles
 * @desc    Create new vehicle
 * @access  Private
 */
router.post('/', auth, vehicleController.createVehicle);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put('/:id', auth, vehicleController.updateVehicle);

/**
 * @route   DELETE /api/vehicles/:id
 * @desc    Delete vehicle (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;
