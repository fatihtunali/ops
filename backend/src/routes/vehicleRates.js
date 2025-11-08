const express = require('express');
const router = express.Router();
const vehicleRateController = require('../controllers/vehicleRateController');
const auth = require('../middleware/auth');

/**
 * Vehicle Rates Routes
 * Base path: /api/vehicle-rates
 */

// Get list of cities with vehicle rates
router.get('/cities', auth, vehicleRateController.getCities);

// Get suppliers for a specific city
router.get('/suppliers', auth, vehicleRateController.getSuppliersByCity);

// Get all vehicle rates (with filters)
router.get('/', auth, vehicleRateController.getAllVehicleRates);

// Get single vehicle rate by ID
router.get('/:id', auth, vehicleRateController.getVehicleRateById);

// Create new vehicle rate
router.post('/', auth, vehicleRateController.createVehicleRate);

// Update vehicle rate
router.put('/:id', auth, vehicleRateController.updateVehicleRate);

// Delete vehicle rate (soft delete)
router.delete('/:id', auth, vehicleRateController.deleteVehicleRate);

module.exports = router;
