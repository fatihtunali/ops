const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/operationalExpenseController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/operational-expenses/recurring
 * @desc    Get all recurring expenses
 * @access  Private
 */
router.get('/recurring', auth, expenseController.getRecurringExpenses);

/**
 * @route   GET /api/operational-expenses/by-category/:category
 * @desc    Get expenses by category
 * @access  Private
 */
router.get('/by-category/:category', auth, expenseController.getExpensesByCategory);

/**
 * @route   GET /api/operational-expenses
 * @desc    Get all operational expenses (with optional filters: category, from_date, to_date, is_recurring)
 * @access  Private
 */
router.get('/', auth, expenseController.getAllExpenses);

/**
 * @route   GET /api/operational-expenses/:id
 * @desc    Get single expense by ID
 * @access  Private
 */
router.get('/:id', auth, expenseController.getExpenseById);

/**
 * @route   POST /api/operational-expenses
 * @desc    Create new operational expense
 * @access  Private
 */
router.post('/', auth, expenseController.createExpense);

/**
 * @route   PUT /api/operational-expenses/:id
 * @desc    Update operational expense
 * @access  Private
 */
router.put('/:id', auth, expenseController.updateExpense);

/**
 * @route   DELETE /api/operational-expenses/:id
 * @desc    Delete operational expense (hard delete)
 * @access  Private
 */
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;
