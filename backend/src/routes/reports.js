const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// All report routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/reports/monthly-pl
 * @desc    Get monthly Profit & Loss report
 * @query   month (YYYY-MM)
 * @access  Private
 */
router.get('/monthly-pl', reportController.getMonthlyPL);

/**
 * @route   GET /api/reports/booking-profitability/:bookingId
 * @desc    Get profitability breakdown for specific booking
 * @access  Private
 */
router.get('/booking-profitability/:bookingId', reportController.getBookingProfitability);

/**
 * @route   GET /api/reports/cash-flow
 * @desc    Get cash flow report (money in vs money out)
 * @query   from_date, to_date
 * @access  Private
 */
router.get('/cash-flow', reportController.getCashFlow);

/**
 * @route   GET /api/reports/sales-by-client
 * @desc    Get sales performance by client
 * @query   from_date, to_date (optional)
 * @access  Private
 */
router.get('/sales-by-client', reportController.getSalesByClient);

/**
 * @route   GET /api/reports/sales-by-service
 * @desc    Get sales breakdown by service type
 * @query   from_date, to_date (optional)
 * @access  Private
 */
router.get('/sales-by-service', reportController.getSalesByService);

/**
 * @route   GET /api/reports/sales-by-source
 * @desc    Get sales breakdown by booking source (agent vs direct)
 * @query   from_date, to_date (optional)
 * @access  Private
 */
router.get('/sales-by-source', reportController.getSalesBySource);

/**
 * @route   GET /api/reports/outstanding
 * @desc    Get outstanding receivables and payables
 * @access  Private
 */
router.get('/outstanding', reportController.getOutstandingReport);

/**
 * @route   GET /api/reports/dashboard-stats
 * @desc    Get dashboard statistics (KPIs, upcoming departures, etc.)
 * @access  Private
 */
router.get('/dashboard-stats', reportController.getDashboardStats);

/**
 * Excel Export Routes
 */

/**
 * @route   POST /api/reports/export/monthly-pl
 * @desc    Export monthly P&L report to Excel
 * @body    month (YYYY-MM)
 * @access  Private
 */
router.post('/export/monthly-pl', reportController.exportMonthlyPL);

/**
 * @route   POST /api/reports/export/cash-flow
 * @desc    Export cash flow report to Excel
 * @body    from_date, to_date
 * @access  Private
 */
router.post('/export/cash-flow', reportController.exportCashFlow);

/**
 * @route   POST /api/reports/export/sales-by-client
 * @desc    Export sales by client to Excel
 * @body    from_date, to_date (optional)
 * @access  Private
 */
router.post('/export/sales-by-client', reportController.exportSalesByClient);

/**
 * @route   POST /api/reports/export/outstanding
 * @desc    Export outstanding payments to Excel
 * @access  Private
 */
router.post('/export/outstanding', reportController.exportOutstanding);

module.exports = router;
