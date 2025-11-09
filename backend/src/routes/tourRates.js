const express = require('express');
const router = express.Router();
const tourRatesController = require('../controllers/tourRatesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all tour rates
router.get('/', tourRatesController.getAllTourRates);

// Get single tour rate
router.get('/:id', tourRatesController.getTourRateById);

// Create new tour rate
router.post('/', tourRatesController.createTourRate);

// Update tour rate
router.put('/:id', tourRatesController.updateTourRate);

// Delete tour rate
router.delete('/:id', tourRatesController.deleteTourRate);

module.exports = router;
