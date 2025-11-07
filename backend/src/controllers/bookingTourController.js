const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Calculate total cost based on operation type
 * @param {string} operation_type - 'supplier' or 'self-operated'
 * @param {object} costs - Object containing all cost fields
 * @returns {number} - Calculated total cost
 */
const calculateTotalCost = (operation_type, costs) => {
  if (operation_type === 'supplier') {
    return parseFloat(costs.supplier_cost || 0);
  } else if (operation_type === 'self-operated') {
    const guide_cost = parseFloat(costs.guide_cost || 0);
    const vehicle_cost = parseFloat(costs.vehicle_cost || 0);
    const entrance_fees = parseFloat(costs.entrance_fees || 0);
    const other_costs = parseFloat(costs.other_costs || 0);
    return guide_cost + vehicle_cost + entrance_fees + other_costs;
  }
  return 0;
};

/**
 * Calculate margin
 * @param {number} sell_price - Selling price
 * @param {number} total_cost - Total cost
 * @returns {number} - Calculated margin
 */
const calculateMargin = (sell_price, total_cost) => {
  const sell = parseFloat(sell_price || 0);
  const cost = parseFloat(total_cost || 0);
  return sell - cost;
};

/**
 * Get all booking tours
 * GET /api/booking-tours
 */
exports.getAllBookingTours = async (req, res) => {
  try {
    const {
      booking_id,
      operation_type,
      payment_status,
      tour_date_from,
      tour_date_to,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let sqlQuery = `
      SELECT
        bt.*,
        ts.name as supplier_name,
        g.name as guide_name,
        v.vehicle_number as vehicle_plate
      FROM booking_tours bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN guides g ON bt.guide_id = g.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by booking_id
    if (booking_id) {
      sqlQuery += ` AND bt.booking_id = $${paramIndex}`;
      params.push(booking_id);
      paramIndex++;
    }

    // Filter by operation_type
    if (operation_type) {
      sqlQuery += ` AND bt.operation_type = $${paramIndex}`;
      params.push(operation_type);
      paramIndex++;
    }

    // Filter by payment_status
    if (payment_status) {
      sqlQuery += ` AND bt.payment_status = $${paramIndex}`;
      params.push(payment_status);
      paramIndex++;
    }

    // Filter by tour_date range
    if (tour_date_from) {
      sqlQuery += ` AND bt.tour_date >= $${paramIndex}`;
      params.push(tour_date_from);
      paramIndex++;
    }

    if (tour_date_to) {
      sqlQuery += ` AND bt.tour_date <= $${paramIndex}`;
      params.push(tour_date_to);
      paramIndex++;
    }

    // Search functionality
    if (search) {
      sqlQuery += ` AND (
        bt.tour_name ILIKE $${paramIndex} OR
        bt.confirmation_number ILIKE $${paramIndex} OR
        bt.notes ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      sqlQuery.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM'),
      params
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    sqlQuery += ` ORDER BY bt.tour_date DESC, bt.created_at DESC`;

    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await query(sqlQuery, params);

    // Format dates
    const bookingTours = result.rows.map(tour => ({
      ...tour,
      tour_date: tour.tour_date ? tour.tour_date.toISOString().split('T')[0] : null,
      payment_due_date: tour.payment_due_date ? tour.payment_due_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(tour.created_at)
    }));

    res.json({
      success: true,
      data: bookingTours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Get all booking tours error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking tours'
      }
    });
  }
};

/**
 * Get single booking tour by ID
 * GET /api/booking-tours/:id
 */
exports.getBookingTourById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        bt.*,
        ts.name as supplier_name,
        g.name as guide_name,
        v.plate_number as vehicle_plate
      FROM booking_tours bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN guides g ON bt.guide_id = g.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE bt.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking tour not found'
        }
      });
    }

    const tour = result.rows[0];
    tour.tour_date = tour.tour_date ? tour.tour_date.toISOString().split('T')[0] : null;
    tour.payment_due_date = tour.payment_due_date ? tour.payment_due_date.toISOString().split('T')[0] : null;
    tour.created_at = formatDateTime(tour.created_at);

    res.json({
      success: true,
      data: tour
    });
  } catch (error) {
    console.error('Get booking tour by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking tour'
      }
    });
  }
};

/**
 * Create new booking tour
 * POST /api/booking-tours
 */
exports.createBookingTour = async (req, res) => {
  try {
    const {
      booking_id,
      tour_name,
      tour_date,
      duration,
      pax_count,
      operation_type,
      supplier_id,
      supplier_cost,
      guide_id,
      guide_cost,
      vehicle_id,
      vehicle_cost,
      entrance_fees,
      other_costs,
      sell_price,
      payment_status = 'pending',
      paid_amount = 0,
      payment_due_date,
      confirmation_number,
      voucher_issued = false,
      notes
    } = req.body;

    // Validation
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required'
        }
      });
    }

    if (!tour_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tour name is required'
        }
      });
    }

    if (!operation_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation type is required'
        }
      });
    }

    // Validate operation_type
    if (!['supplier', 'self-operated'].includes(operation_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation type must be either "supplier" or "self-operated"'
        }
      });
    }

    // Validate payment_status
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be either "pending" or "paid"'
        }
      });
    }

    // Validate supplier requirement for supplier operation
    if (operation_type === 'supplier' && !supplier_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Supplier ID is required for supplier operation type'
        }
      });
    }

    // Check if booking exists
    const bookingExists = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Calculate total_cost based on operation_type
    const total_cost = calculateTotalCost(operation_type, {
      supplier_cost,
      guide_cost,
      vehicle_cost,
      entrance_fees,
      other_costs
    });

    // Calculate margin
    const margin = calculateMargin(sell_price, total_cost);

    // Insert new booking tour
    const result = await query(
      `INSERT INTO booking_tours
       (booking_id, tour_name, tour_date, duration, pax_count, operation_type,
        supplier_id, supplier_cost, guide_id, guide_cost, vehicle_id, vehicle_cost,
        entrance_fees, other_costs, total_cost, sell_price, margin,
        payment_status, paid_amount, payment_due_date, confirmation_number,
        voucher_issued, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       RETURNING *`,
      [
        booking_id, tour_name, tour_date, duration, pax_count, operation_type,
        supplier_id, supplier_cost, guide_id, guide_cost, vehicle_id, vehicle_cost,
        entrance_fees, other_costs, total_cost, sell_price, margin,
        payment_status, paid_amount, payment_due_date, confirmation_number,
        voucher_issued, notes
      ]
    );

    const tour = result.rows[0];
    tour.tour_date = tour.tour_date ? tour.tour_date.toISOString().split('T')[0] : null;
    tour.payment_due_date = tour.payment_due_date ? tour.payment_due_date.toISOString().split('T')[0] : null;
    tour.created_at = formatDateTime(tour.created_at);

    res.status(201).json({
      success: true,
      message: 'Booking tour created successfully',
      data: tour
    });
  } catch (error) {
    console.error('Create booking tour error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking tour'
      }
    });
  }
};

/**
 * Update booking tour
 * PUT /api/booking-tours/:id
 */
exports.updateBookingTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      tour_name,
      tour_date,
      duration,
      pax_count,
      operation_type,
      supplier_id,
      supplier_cost,
      guide_id,
      guide_cost,
      vehicle_id,
      vehicle_cost,
      entrance_fees,
      other_costs,
      sell_price,
      payment_status,
      paid_amount,
      payment_due_date,
      confirmation_number,
      voucher_issued,
      notes
    } = req.body;

    // Check if booking tour exists
    const existingTour = await query(
      'SELECT * FROM booking_tours WHERE id = $1',
      [id]
    );

    if (existingTour.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking tour not found'
        }
      });
    }

    // Validation
    if (!tour_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tour name is required'
        }
      });
    }

    if (!operation_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation type is required'
        }
      });
    }

    // Validate operation_type
    if (!['supplier', 'self-operated'].includes(operation_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation type must be either "supplier" or "self-operated"'
        }
      });
    }

    // Validate payment_status
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be either "pending" or "paid"'
        }
      });
    }

    // Validate supplier requirement for supplier operation
    if (operation_type === 'supplier' && !supplier_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Supplier ID is required for supplier operation type'
        }
      });
    }

    // Calculate total_cost based on operation_type
    const total_cost = calculateTotalCost(operation_type, {
      supplier_cost,
      guide_cost,
      vehicle_cost,
      entrance_fees,
      other_costs
    });

    // Calculate margin
    const margin = calculateMargin(sell_price, total_cost);

    // Update booking tour
    const result = await query(
      `UPDATE booking_tours
       SET booking_id = $1,
           tour_name = $2,
           tour_date = $3,
           duration = $4,
           pax_count = $5,
           operation_type = $6,
           supplier_id = $7,
           supplier_cost = $8,
           guide_id = $9,
           guide_cost = $10,
           vehicle_id = $11,
           vehicle_cost = $12,
           entrance_fees = $13,
           other_costs = $14,
           total_cost = $15,
           sell_price = $16,
           margin = $17,
           payment_status = $18,
           paid_amount = $19,
           payment_due_date = $20,
           confirmation_number = $21,
           voucher_issued = $22,
           notes = $23
       WHERE id = $24
       RETURNING *`,
      [
        booking_id, tour_name, tour_date, duration, pax_count, operation_type,
        supplier_id, supplier_cost, guide_id, guide_cost, vehicle_id, vehicle_cost,
        entrance_fees, other_costs, total_cost, sell_price, margin,
        payment_status, paid_amount, payment_due_date, confirmation_number,
        voucher_issued, notes, id
      ]
    );

    const tour = result.rows[0];
    tour.tour_date = tour.tour_date ? tour.tour_date.toISOString().split('T')[0] : null;
    tour.payment_due_date = tour.payment_due_date ? tour.payment_due_date.toISOString().split('T')[0] : null;
    tour.created_at = formatDateTime(tour.created_at);

    res.json({
      success: true,
      message: 'Booking tour updated successfully',
      data: tour
    });
  } catch (error) {
    console.error('Update booking tour error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update booking tour'
      }
    });
  }
};

/**
 * Delete booking tour
 * DELETE /api/booking-tours/:id
 */
exports.deleteBookingTour = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking tour exists
    const existingTour = await query(
      'SELECT * FROM booking_tours WHERE id = $1',
      [id]
    );

    if (existingTour.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking tour not found'
        }
      });
    }

    // Delete booking tour (hard delete due to CASCADE constraint)
    await query('DELETE FROM booking_tours WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Booking tour deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking tour error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete booking tour'
      }
    });
  }
};

/**
 * Get booking tours by booking_id
 * GET /api/booking-tours/booking/:booking_id
 */
exports.getBookingToursByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const result = await query(
      `SELECT
        bt.*,
        ts.name as supplier_name,
        g.name as guide_name,
        v.plate_number as vehicle_plate
      FROM booking_tours bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN guides g ON bt.guide_id = g.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE bt.booking_id = $1
      ORDER BY bt.tour_date DESC, bt.created_at DESC`,
      [booking_id]
    );

    // Format dates
    const bookingTours = result.rows.map(tour => ({
      ...tour,
      tour_date: tour.tour_date ? tour.tour_date.toISOString().split('T')[0] : null,
      payment_due_date: tour.payment_due_date ? tour.payment_due_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(tour.created_at)
    }));

    res.json({
      success: true,
      data: bookingTours
    });
  } catch (error) {
    console.error('Get booking tours by booking ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking tours'
      }
    });
  }
};

/**
 * Get booking tour statistics
 * GET /api/booking-tours/stats/summary
 */
exports.getBookingTourStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE operation_type = 'supplier') as supplier_operated,
        COUNT(*) FILTER (WHERE operation_type = 'self-operated') as self_operated,
        COUNT(*) FILTER (WHERE payment_status = 'pending') as pending_payment,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid,
        COUNT(*) FILTER (WHERE voucher_issued = true) as vouchers_issued,
        COALESCE(SUM(total_cost), 0) as total_costs,
        COALESCE(SUM(sell_price), 0) as total_revenue,
        COALESCE(SUM(margin), 0) as total_margin,
        COALESCE(SUM(paid_amount), 0) as total_paid
      FROM booking_tours
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        supplier_operated: parseInt(stats.supplier_operated),
        self_operated: parseInt(stats.self_operated),
        pending_payment: parseInt(stats.pending_payment),
        paid: parseInt(stats.paid),
        vouchers_issued: parseInt(stats.vouchers_issued),
        total_costs: parseFloat(stats.total_costs),
        total_revenue: parseFloat(stats.total_revenue),
        total_margin: parseFloat(stats.total_margin),
        total_paid: parseFloat(stats.total_paid)
      }
    });
  } catch (error) {
    console.error('Get booking tour stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking tour statistics'
      }
    });
  }
};
