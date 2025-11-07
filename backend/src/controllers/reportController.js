const { pool } = require('../config/database');
const excelService = require('../services/excelService');

/**
 * Report Controller
 * Handles financial reports and analytics
 */

// GET /api/reports/monthly-pl?month=2025-12
exports.getMonthlyPL = async (req, res) => {
  try {
    const { month } = req.query; // Format: YYYY-MM

    if (!month) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Month parameter is required (format: YYYY-MM)'
        }
      });
    }

    // Parse month
    const [year, monthNum] = month.split('-');
    const startDate = `${year}-${monthNum}-01`;
    const endDate = new Date(year, monthNum, 0); // Last day of month
    const endDateStr = `${year}-${monthNum}-${endDate.getDate()}`;

    // Get revenue from confirmed bookings
    const revenueQuery = await pool.query(`
      SELECT
        COUNT(*) as booking_count,
        COALESCE(SUM(total_sell_price), 0) as total_revenue,
        COALESCE(SUM(total_cost_price), 0) as total_costs,
        COALESCE(SUM(gross_profit), 0) as gross_profit
      FROM bookings
      WHERE is_confirmed = true
        AND confirmed_at >= $1
        AND confirmed_at <= $2
    `, [startDate, endDateStr]);

    // Get cost breakdown by service type
    const costsBreakdown = await pool.query(`
      SELECT
        COALESCE(SUM(bh.total_cost), 0) as hotel_costs,
        COALESCE(SUM(bt.total_cost), 0) as tour_costs,
        COALESCE(SUM(btr.cost_price), 0) as transfer_costs,
        COALESCE(SUM(bf.cost_price), 0) as flight_costs
      FROM bookings b
      LEFT JOIN booking_hotels bh ON b.id = bh.booking_id
      LEFT JOIN booking_tours bt ON b.id = bt.booking_id
      LEFT JOIN booking_transfers btr ON b.id = btr.booking_id
      LEFT JOIN booking_flights bf ON b.id = bf.booking_id
      WHERE b.is_confirmed = true
        AND b.confirmed_at >= $1
        AND b.confirmed_at <= $2
    `, [startDate, endDateStr]);

    // Get operational expenses
    const expensesQuery = await pool.query(`
      SELECT
        category,
        COALESCE(SUM(amount), 0) as total
      FROM operational_expenses
      WHERE expense_date >= $1
        AND expense_date <= $2
      GROUP BY category
    `, [startDate, endDateStr]);

    // Calculate total operational expenses
    const totalOpEx = expensesQuery.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

    // Format expenses by category
    const expensesByCategory = {};
    expensesQuery.rows.forEach(row => {
      expensesByCategory[row.category] = parseFloat(row.total);
    });

    const revenue = revenueQuery.rows[0];
    const costs = costsBreakdown.rows[0];

    res.json({
      success: true,
      data: {
        month: month,
        revenue: {
          total_bookings_revenue: parseFloat(revenue.total_revenue),
          booking_count: parseInt(revenue.booking_count)
        },
        direct_costs: {
          hotel_costs: parseFloat(costs.hotel_costs),
          tour_costs: parseFloat(costs.tour_costs),
          transfer_costs: parseFloat(costs.transfer_costs),
          flight_costs: parseFloat(costs.flight_costs),
          total: parseFloat(revenue.total_costs)
        },
        gross_profit: parseFloat(revenue.gross_profit),
        operational_expenses: {
          ...expensesByCategory,
          total: totalOpEx
        },
        net_profit: parseFloat(revenue.gross_profit) - totalOpEx
      }
    });

  } catch (error) {
    console.error('Error generating monthly P&L:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate monthly P&L report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/booking-profitability/:bookingId
exports.getBookingProfitability = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const bookingQuery = await pool.query(`
      SELECT
        b.*,
        c.name as client_name
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = $1
    `, [bookingId]);

    if (bookingQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    const booking = bookingQuery.rows[0];

    // Get all services breakdown
    const servicesQuery = await pool.query(`
      SELECT * FROM view_booking_services WHERE booking_id = $1
    `, [bookingId]);

    // Calculate totals by service type
    const servicesByType = {
      hotels: [],
      tours: [],
      transfers: [],
      flights: []
    };

    servicesQuery.rows.forEach(service => {
      if (servicesByType[service.service_type]) {
        servicesByType[service.service_type].push({
          name: service.service_name,
          date: service.service_date,
          cost_price: parseFloat(service.cost_price),
          sell_price: parseFloat(service.sell_price),
          margin: parseFloat(service.margin)
        });
      }
    });

    res.json({
      success: true,
      data: {
        booking_code: booking.booking_code,
        client_name: booking.client_name,
        travel_dates: {
          from: booking.travel_date_from,
          to: booking.travel_date_to
        },
        services: servicesByType,
        totals: {
          total_cost_price: parseFloat(booking.total_cost_price),
          total_sell_price: parseFloat(booking.total_sell_price),
          gross_profit: parseFloat(booking.gross_profit),
          margin_percentage: booking.total_sell_price > 0
            ? ((booking.gross_profit / booking.total_sell_price) * 100).toFixed(2)
            : 0
        },
        payment_info: {
          payment_status: booking.payment_status,
          amount_received: parseFloat(booking.amount_received),
          outstanding: parseFloat(booking.total_sell_price) - parseFloat(booking.amount_received)
        }
      }
    });

  } catch (error) {
    console.error('Error generating booking profitability:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate booking profitability report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/cash-flow?from_date=2025-12-01&to_date=2025-12-31
exports.getCashFlow = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'from_date and to_date parameters are required'
        }
      });
    }

    // Get client payments (money in)
    const clientPaymentsQuery = await pool.query(`
      SELECT
        cp.payment_date,
        cp.amount,
        cp.payment_method,
        b.booking_code,
        c.name as client_name
      FROM client_payments cp
      LEFT JOIN bookings b ON cp.booking_id = b.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE cp.payment_date >= $1 AND cp.payment_date <= $2
      ORDER BY cp.payment_date DESC
    `, [from_date, to_date]);

    // Get supplier payments (money out)
    const supplierPaymentsQuery = await pool.query(`
      SELECT
        sp.payment_date,
        sp.amount,
        sp.payment_method,
        sp.supplier_name,
        sp.supplier_type,
        b.booking_code
      FROM supplier_payments sp
      LEFT JOIN bookings b ON sp.booking_id = b.id
      WHERE sp.status = 'paid'
        AND sp.payment_date >= $1 AND sp.payment_date <= $2
      ORDER BY sp.payment_date DESC
    `, [from_date, to_date]);

    // Get operational expenses (money out)
    const expensesQuery = await pool.query(`
      SELECT
        expense_date as payment_date,
        amount,
        category,
        description,
        payment_method
      FROM operational_expenses
      WHERE expense_date >= $1 AND expense_date <= $2
      ORDER BY expense_date DESC
    `, [from_date, to_date]);

    // Calculate totals
    const totalMoneyIn = clientPaymentsQuery.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalMoneyOut = supplierPaymentsQuery.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0)
      + expensesQuery.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);

    res.json({
      success: true,
      data: {
        period: {
          from: from_date,
          to: to_date
        },
        summary: {
          total_money_in: totalMoneyIn,
          total_money_out: totalMoneyOut,
          net_cash_flow: totalMoneyIn - totalMoneyOut
        },
        money_in: {
          total: totalMoneyIn,
          count: clientPaymentsQuery.rows.length,
          transactions: clientPaymentsQuery.rows.map(row => ({
            date: row.payment_date,
            amount: parseFloat(row.amount),
            booking_code: row.booking_code,
            client_name: row.client_name,
            payment_method: row.payment_method
          }))
        },
        money_out: {
          total: totalMoneyOut,
          supplier_payments: {
            total: supplierPaymentsQuery.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0),
            count: supplierPaymentsQuery.rows.length,
            transactions: supplierPaymentsQuery.rows.map(row => ({
              date: row.payment_date,
              amount: parseFloat(row.amount),
              supplier_name: row.supplier_name,
              supplier_type: row.supplier_type,
              booking_code: row.booking_code,
              payment_method: row.payment_method
            }))
          },
          operational_expenses: {
            total: expensesQuery.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0),
            count: expensesQuery.rows.length,
            transactions: expensesQuery.rows.map(row => ({
              date: row.payment_date,
              amount: parseFloat(row.amount),
              category: row.category,
              description: row.description,
              payment_method: row.payment_method
            }))
          }
        }
      }
    });

  } catch (error) {
    console.error('Error generating cash flow report:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate cash flow report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/sales-by-client
exports.getSalesByClient = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    let whereClause = 'WHERE b.is_confirmed = true';
    const params = [];

    if (from_date && to_date) {
      whereClause += ' AND b.confirmed_at >= $1 AND b.confirmed_at <= $2';
      params.push(from_date, to_date);
    }

    const query = `
      SELECT
        c.id,
        c.name,
        c.type,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(b.total_sell_price), 0) as total_revenue,
        COALESCE(SUM(b.total_cost_price), 0) as total_costs,
        COALESCE(SUM(b.gross_profit), 0) as total_profit,
        COALESCE(AVG(b.total_sell_price), 0) as avg_booking_value
      FROM clients c
      LEFT JOIN bookings b ON c.id = b.client_id ${whereClause.replace('WHERE', 'AND')}
      GROUP BY c.id, c.name, c.type
      HAVING COUNT(b.id) > 0
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        period: from_date && to_date ? { from: from_date, to: to_date } : 'All time',
        clients: result.rows.map(row => ({
          client_id: row.id,
          client_name: row.name,
          client_type: row.type,
          booking_count: parseInt(row.booking_count),
          total_revenue: parseFloat(row.total_revenue),
          total_costs: parseFloat(row.total_costs),
          total_profit: parseFloat(row.total_profit),
          avg_booking_value: parseFloat(row.avg_booking_value),
          profit_margin_percentage: row.total_revenue > 0
            ? ((row.total_profit / row.total_revenue) * 100).toFixed(2)
            : 0
        }))
      }
    });

  } catch (error) {
    console.error('Error generating sales by client report:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate sales by client report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/sales-by-service
exports.getSalesByService = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (from_date && to_date) {
      dateFilter = 'AND b.confirmed_at >= $1 AND b.confirmed_at <= $2';
      params.push(from_date, to_date);
    }

    // Get data from all service tables using UNION
    const query = `
      WITH all_services AS (
        SELECT
          'hotel' as service_type,
          bh.booking_id,
          bh.cost_per_night * bh.nights * bh.number_of_rooms as total_cost,
          bh.sell_price as total_revenue,
          (bh.sell_price - (bh.cost_per_night * bh.nights * bh.number_of_rooms)) as margin
        FROM booking_hotels bh
        UNION ALL
        SELECT
          'tour' as service_type,
          bt.booking_id,
          bt.total_cost as total_cost,
          bt.sell_price as total_revenue,
          bt.margin as margin
        FROM booking_tours bt
        UNION ALL
        SELECT
          'transfer' as service_type,
          bt.booking_id,
          bt.cost_price as total_cost,
          bt.sell_price as total_revenue,
          bt.margin as margin
        FROM booking_transfers bt
        UNION ALL
        SELECT
          'flight' as service_type,
          bf.booking_id,
          bf.cost_price as total_cost,
          bf.sell_price as total_revenue,
          (bf.sell_price - bf.cost_price) as margin
        FROM booking_flights bf
      )
      SELECT
        service_type,
        COUNT(*) as service_count,
        COALESCE(SUM(total_cost), 0) as total_cost,
        COALESCE(SUM(total_revenue), 0) as total_revenue,
        COALESCE(SUM(margin), 0) as total_profit
      FROM all_services s
      JOIN bookings b ON s.booking_id = b.id
      WHERE b.is_confirmed = true ${dateFilter}
      GROUP BY service_type
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        period: from_date && to_date ? { from: from_date, to: to_date } : 'All time',
        services: result.rows.map(row => ({
          service_type: row.service_type,
          service_count: parseInt(row.service_count),
          total_cost: parseFloat(row.total_cost),
          total_revenue: parseFloat(row.total_revenue),
          total_profit: parseFloat(row.total_profit),
          profit_margin_percentage: row.total_revenue > 0
            ? ((row.total_profit / row.total_revenue) * 100).toFixed(2)
            : 0
        }))
      }
    });

  } catch (error) {
    console.error('Error generating sales by service report:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate sales by service report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/outstanding
exports.getOutstandingReport = async (req, res) => {
  try {
    // Get outstanding receivables (client payments not fully paid)
    const receivablesQuery = await pool.query(`
      SELECT
        b.booking_code,
        c.name as client_name,
        b.total_sell_price as total_amount,
        b.amount_received,
        (b.total_sell_price - COALESCE(b.amount_received, 0)) as outstanding_amount,
        b.payment_status,
        b.confirmed_at,
        CURRENT_DATE - b.confirmed_at::date as days_outstanding
      FROM bookings b
      JOIN clients c ON b.client_id = c.id
      WHERE b.is_confirmed = true
        AND (b.total_sell_price - COALESCE(b.amount_received, 0)) > 0
      ORDER BY days_outstanding DESC
    `);

    // Get outstanding payables (supplier payments pending)
    const payablesQuery = await pool.query(`
      SELECT
        b.booking_code,
        sp.supplier_name,
        sp.supplier_type,
        sp.amount,
        sp.due_date,
        sp.status,
        CASE
          WHEN sp.due_date < CURRENT_DATE AND sp.status = 'pending' THEN CURRENT_DATE - sp.due_date
          ELSE 0
        END as days_overdue
      FROM supplier_payments sp
      LEFT JOIN bookings b ON sp.booking_id = b.id
      WHERE sp.status = 'pending'
      ORDER BY days_overdue DESC NULLS LAST
    `);

    // Calculate totals
    const totalReceivables = receivablesQuery.rows.reduce(
      (sum, row) => sum + parseFloat(row.outstanding_amount), 0
    );
    const totalPayables = payablesQuery.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount), 0
    );

    res.json({
      success: true,
      data: {
        summary: {
          total_receivables: totalReceivables,
          total_payables: totalPayables,
          net_position: totalReceivables - totalPayables
        },
        receivables: {
          total: totalReceivables,
          count: receivablesQuery.rows.length,
          items: receivablesQuery.rows.map(row => ({
            booking_code: row.booking_code,
            client_name: row.client_name,
            total_amount: parseFloat(row.total_amount),
            amount_received: parseFloat(row.amount_received),
            outstanding_amount: parseFloat(row.outstanding_amount),
            payment_status: row.payment_status,
            confirmed_at: row.confirmed_at,
            days_outstanding: parseInt(row.days_outstanding)
          }))
        },
        payables: {
          total: totalPayables,
          count: payablesQuery.rows.length,
          items: payablesQuery.rows.map(row => ({
            booking_code: row.booking_code,
            supplier_name: row.supplier_name,
            supplier_type: row.supplier_type,
            amount: parseFloat(row.amount),
            due_date: row.due_date,
            status: row.status,
            days_overdue: row.days_overdue ? parseInt(row.days_overdue) : null
          }))
        }
      }
    });

  } catch (error) {
    console.error('Error generating outstanding report:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate outstanding report',
        details: error.message
      }
    });
  }
};

// GET /api/reports/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get current month stats
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, currentDate.getMonth() + 1, 0);
    const endDateStr = `${year}-${month}-${endDate.getDate()}`;

    // Active inquiries
    const inquiriesQuery = await pool.query(`
      SELECT COUNT(*) as count FROM bookings
      WHERE status IN ('inquiry', 'quoted')
    `);

    // This month's confirmed bookings
    const confirmedQuery = await pool.query(`
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(total_sell_price), 0) as revenue,
        COALESCE(SUM(gross_profit), 0) as profit
      FROM bookings
      WHERE is_confirmed = true
        AND confirmed_at >= $1
        AND confirmed_at <= $2
    `, [startDate, endDateStr]);

    // Outstanding payments
    const receivablesQuery = await pool.query(`
      SELECT COALESCE(SUM(outstanding_amount), 0) as total
      FROM view_outstanding_receivables
    `);

    const payablesQuery = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM view_outstanding_payables
    `);

    // Upcoming departures (next 7 days)
    const upcomingQuery = await pool.query(`
      SELECT
        b.booking_code,
        b.travel_date_from,
        c.name as client_name,
        b.pax_count
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.is_confirmed = true
        AND b.status IN ('confirmed', 'completed')
        AND b.travel_date_from >= CURRENT_DATE
        AND b.travel_date_from <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY b.travel_date_from
      LIMIT 10
    `);

    const confirmed = confirmedQuery.rows[0];

    res.json({
      success: true,
      data: {
        active_inquiries: parseInt(inquiriesQuery.rows[0].count),
        this_month: {
          confirmed_bookings: parseInt(confirmed.count),
          revenue: parseFloat(confirmed.revenue),
          gross_profit: parseFloat(confirmed.profit)
        },
        outstanding: {
          receivables: parseFloat(receivablesQuery.rows[0].total),
          payables: parseFloat(payablesQuery.rows[0].total)
        },
        upcoming_departures: upcomingQuery.rows.map(row => ({
          booking_code: row.booking_code,
          client_name: row.client_name,
          departure_date: row.travel_date_from,
          pax_count: row.pax_count
        }))
      }
    });

  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate dashboard statistics',
        details: error.message
      }
    });
  }
};

// Excel Export Endpoints

// POST /api/reports/export/monthly-pl
exports.exportMonthlyPL = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Month parameter is required (format: YYYY-MM)'
        }
      });
    }

    // Get P&L data
    req.query = { month };
    const plData = await new Promise((resolve, reject) => {
      const mockReq = { query: { month } };
      const mockRes = {
        json: (data) => resolve(data.data)
      };
      exports.getMonthlyPL(mockReq, mockRes).catch(reject);
    });

    // Generate Excel file
    const filePath = await excelService.exportMonthlyPL(plData);

    // Send file
    res.download(filePath, `monthly_pl_${month}.xlsx`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Optionally delete file after sending
      // fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error exporting monthly P&L:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export monthly P&L',
        details: error.message
      }
    });
  }
};

// POST /api/reports/export/cash-flow
exports.exportCashFlow = async (req, res) => {
  try {
    const { from_date, to_date } = req.body;

    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'from_date and to_date parameters are required'
        }
      });
    }

    // Get cash flow data
    const cashFlowData = await new Promise((resolve, reject) => {
      const mockReq = { query: { from_date, to_date } };
      const mockRes = {
        json: (data) => resolve(data.data)
      };
      exports.getCashFlow(mockReq, mockRes).catch(reject);
    });

    // Generate Excel file
    const filePath = await excelService.exportCashFlow(cashFlowData);

    // Send file
    res.download(filePath, `cash_flow_${from_date}_${to_date}.xlsx`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error exporting cash flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export cash flow',
        details: error.message
      }
    });
  }
};

// POST /api/reports/export/sales-by-client
exports.exportSalesByClient = async (req, res) => {
  try {
    const { from_date, to_date } = req.body;

    // Get sales by client data
    const salesData = await new Promise((resolve, reject) => {
      const mockReq = { query: { from_date, to_date } };
      const mockRes = {
        json: (data) => resolve(data.data)
      };
      exports.getSalesByClient(mockReq, mockRes).catch(reject);
    });

    // Generate Excel file
    const filePath = await excelService.exportSalesByClient(salesData);

    // Send file
    res.download(filePath, 'sales_by_client.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error exporting sales by client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export sales by client',
        details: error.message
      }
    });
  }
};

// POST /api/reports/export/outstanding
exports.exportOutstanding = async (req, res) => {
  try {
    // Get outstanding payments data
    const outstandingData = await new Promise((resolve, reject) => {
      const mockReq = {};
      const mockRes = {
        json: (data) => resolve(data.data)
      };
      exports.getOutstandingReport(mockReq, mockRes).catch(reject);
    });

    // Generate Excel file
    const filePath = await excelService.exportOutstandingPayments(outstandingData);

    // Send file
    res.download(filePath, 'outstanding_payments.xlsx', (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });
  } catch (error) {
    console.error('Error exporting outstanding payments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export outstanding payments',
        details: error.message
      }
    });
  }
};
