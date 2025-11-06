const express = require('express');
const router = express.Router();
const tourSupplierController = require('../controllers/tourSupplierController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/tour-suppliers/stats/summary
 * @desc    Get tour supplier statistics
 * @access  Private
 */
router.get('/stats/summary', auth, tourSupplierController.getTourSupplierStats);

/**
 * @route   GET /api/tour-suppliers
 * @desc    Get all tour suppliers (with pagination, filtering, search)
 * @access  Private
 * @query   status - Filter by status (active/inactive)
 * @query   search - Search in name, contact_person, email, phone, services_offered
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/', auth, tourSupplierController.getAllTourSuppliers);

/**
 * @route   GET /api/tour-suppliers/:id
 * @desc    Get single tour supplier by ID
 * @access  Private
 */
router.get('/:id', auth, tourSupplierController.getTourSupplierById);

/**
 * @route   POST /api/tour-suppliers
 * @desc    Create new tour supplier
 * @access  Private
 */
router.post('/', auth, tourSupplierController.createTourSupplier);

/**
 * @route   PUT /api/tour-suppliers/:id
 * @desc    Update tour supplier
 * @access  Private
 */
router.put('/:id', auth, tourSupplierController.updateTourSupplier);

/**
 * @route   DELETE /api/tour-suppliers/:id
 * @desc    Delete tour supplier (soft delete - sets status to inactive)
 * @access  Private
 */
router.delete('/:id', auth, tourSupplierController.deleteTourSupplier);

module.exports = router;
