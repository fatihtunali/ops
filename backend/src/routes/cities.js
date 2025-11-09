const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/citiesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all cities
router.get('/', citiesController.getAllCities);

// Search cities
router.get('/search', citiesController.searchCities);

// Get cities by region
router.get('/region/:region', citiesController.getCitiesByRegion);

module.exports = router;
