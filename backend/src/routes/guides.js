const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/guides/available
 * @desc    Get all available guides
 * @access  Private
 */
router.get('/available', auth, guideController.getAvailableGuides);

/**
 * @route   GET /api/guides
 * @desc    Get all guides with optional filters (availability_status, languages)
 * @access  Private
 */
router.get('/', auth, guideController.getAllGuides);

/**
 * @route   GET /api/guides/:id
 * @desc    Get single guide by ID
 * @access  Private
 */
router.get('/:id', auth, guideController.getGuideById);

/**
 * @route   POST /api/guides
 * @desc    Create a new guide
 * @access  Private
 */
router.post('/', auth, guideController.createGuide);

/**
 * @route   PUT /api/guides/:id
 * @desc    Update guide
 * @access  Private
 */
router.put('/:id', auth, guideController.updateGuide);

/**
 * @route   DELETE /api/guides/:id
 * @desc    Soft delete guide (set availability_status to inactive)
 * @access  Private
 */
router.delete('/:id', auth, guideController.deleteGuide);

module.exports = router;
