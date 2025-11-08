const express = require('express');
const router = express.Router();
const vehicleTypeController = require('../controllers/vehicleTypeController');
const auth = require('../middleware/auth');

/**
 * Vehicle Types Routes
 * Base path: /api/vehicle-types
 */

// Get all vehicle types (authenticated users)
router.get('/', auth, vehicleTypeController.getAllVehicleTypes);

// Get single vehicle type by ID (authenticated users)
router.get('/:id', auth, vehicleTypeController.getVehicleTypeById);

module.exports = router;
