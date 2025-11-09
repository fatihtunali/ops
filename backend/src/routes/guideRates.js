const express = require('express');
const router = express.Router();
const guideRatesController = require('../controllers/guideRatesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Guide rates routes
router.get('/', guideRatesController.getAllGuideRates);
router.get('/:id', guideRatesController.getGuideRateById);
router.post('/', guideRatesController.createGuideRate);
router.put('/:id', guideRatesController.updateGuideRate);
router.delete('/:id', guideRatesController.deleteGuideRate);

module.exports = router;
