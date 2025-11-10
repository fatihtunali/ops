const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all booking flights
 * GET /api/booking-flights
 * Query params: booking_id, airline, payment_status, voucher_issued
 */
exports.getAll = async (req, res) => {
  try {
    const { booking_id, airline, payment_status, voucher_issued } = req.query;

    // Build query dynamically based on filters
    let sql = 'SELECT * FROM booking_flights WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (booking_id) {
      sql += ` AND booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    if (airline) {
      sql += ` AND LOWER(airline) = LOWER($${paramCount})`;
      params.push(airline);
      paramCount++;
    }

    if (payment_status) {
      sql += ` AND payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    if (voucher_issued !== undefined) {
      sql += ` AND voucher_issued = $${paramCount}`;
      params.push(voucher_issued === 'true');
      paramCount++;
    }

    sql += ' ORDER BY departure_date DESC';

    const result = await query(sql, params);

    // Format dates for all booking flights
    const bookingFlights = result.rows.map(flight => ({
      ...flight,
      departure_date: formatDateTime(flight.departure_date),
      arrival_date: formatDateTime(flight.arrival_date),
      created_at: formatDateTime(flight.created_at)
    }));

    res.json({
      success: true,
      count: bookingFlights.length,
      data: bookingFlights
    });
  } catch (error) {
    console.error('Get all booking flights error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking flights'
      }
    });
  }
};

/**
 * Get booking flight by ID
 * GET /api/booking-flights/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM booking_flights WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking flight not found'
        }
      });
    }

    const bookingFlight = {
      ...result.rows[0],
      departure_date: formatDateTime(result.rows[0].departure_date),
      arrival_date: formatDateTime(result.rows[0].arrival_date),
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      data: bookingFlight
    });
  } catch (error) {
    console.error('Get booking flight by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking flight'
      }
    });
  }
};

/**
 * Get all flights for a specific booking
 * GET /api/booking-flights/booking/:booking_id
 */
exports.getByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const result = await query(
      'SELECT * FROM booking_flights WHERE booking_id = $1 ORDER BY departure_date ASC',
      [booking_id]
    );

    // Format dates for all booking flights
    const bookingFlights = result.rows.map(flight => ({
      ...flight,
      departure_date: formatDateTime(flight.departure_date),
      arrival_date: formatDateTime(flight.arrival_date),
      created_at: formatDateTime(flight.created_at)
    }));

    res.json({
      success: true,
      count: bookingFlights.length,
      data: bookingFlights
    });
  } catch (error) {
    console.error('Get flights by booking ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking flights'
      }
    });
  }
};

/**
 * Create new booking flight
 * POST /api/booking-flights
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      airline,
      flight_number,
      departure_date,
      arrival_date,
      from_airport,
      to_airport,
      pax_count,
      cost_price,

      payment_status,
      paid_amount,
      pnr,
      ticket_numbers,
      voucher_issued,
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

    // Verify booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking not found'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be either "pending" or "paid"'
        }
      });
    }

    // Validate numeric fields
    if (pax_count && (isNaN(pax_count) || parseInt(pax_count) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passenger count must be a valid positive number'
        }
      });
    }

    if (cost_price && (isNaN(cost_price) || parseFloat(cost_price) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cost price must be a valid positive number'
        }
      });
    }

    if (cost_price && (isNaN(cost_price) || parseFloat(cost_price) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cost price must be a valid positive number'
        }
      });
    }

    if (paid_amount && (isNaN(paid_amount) || parseFloat(paid_amount) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Paid amount must be a valid positive number'
        }
      });
    }

    const result = await query(
      `INSERT INTO booking_flights (
        booking_id, airline, flight_number, departure_date, arrival_date,
        from_airport, to_airport, pax_count, cost_price,
        payment_status, paid_amount, pnr, ticket_numbers,
        voucher_issued, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        booking_id,
        airline || null,
        flight_number || null,
        departure_date || null,
        arrival_date || null,
        from_airport || null,
        to_airport || null,
        pax_count || null,
        cost_price || null,
        payment_status || 'pending',
        paid_amount || 0,
        pnr || null,
        ticket_numbers || null,
        voucher_issued || false,
        notes || null
      ]
    );

    const bookingFlight = {
      ...result.rows[0],
      departure_date: formatDateTime(result.rows[0].departure_date),
      arrival_date: formatDateTime(result.rows[0].arrival_date),
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.status(201).json({
      success: true,
      message: 'Booking flight created successfully',
      data: bookingFlight
    });
  } catch (error) {
    console.error('Create booking flight error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking ID'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking flight'
      }
    });
  }
};

/**
 * Update booking flight
 * PUT /api/booking-flights/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      airline,
      flight_number,
      departure_date,
      arrival_date,
      from_airport,
      to_airport,
      pax_count,
      cost_price,

      payment_status,
      paid_amount,
      pnr,
      ticket_numbers,
      voucher_issued,
      notes
    } = req.body;

    // Check if booking flight exists
    const checkResult = await query(
      'SELECT id FROM booking_flights WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking flight not found'
        }
      });
    }

    // Verify booking exists if booking_id is being updated
    if (booking_id !== undefined) {
      const bookingCheck = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Booking not found'
          }
        });
      }
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be either "pending" or "paid"'
        }
      });
    }

    // Validate numeric fields
    if (pax_count !== undefined && pax_count !== null) {
      if (isNaN(pax_count) || parseInt(pax_count) < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Passenger count must be a valid positive number'
          }
        });
      }
    }

    if (cost_price !== undefined && cost_price !== null) {
      if (isNaN(cost_price) || parseFloat(cost_price) < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cost price must be a valid positive number'
          }
        });
      }
    }


    if (paid_amount !== undefined && paid_amount !== null) {
      if (isNaN(paid_amount) || parseFloat(paid_amount) < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Paid amount must be a valid positive number'
          }
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (booking_id !== undefined) {
      updates.push(`booking_id = $${paramCount}`);
      params.push(booking_id);
      paramCount++;
    }
    if (airline !== undefined) {
      updates.push(`airline = $${paramCount}`);
      params.push(airline || null);
      paramCount++;
    }
    if (flight_number !== undefined) {
      updates.push(`flight_number = $${paramCount}`);
      params.push(flight_number || null);
      paramCount++;
    }
    if (departure_date !== undefined) {
      updates.push(`departure_date = $${paramCount}`);
      params.push(departure_date || null);
      paramCount++;
    }
    if (arrival_date !== undefined) {
      updates.push(`arrival_date = $${paramCount}`);
      params.push(arrival_date || null);
      paramCount++;
    }
    if (from_airport !== undefined) {
      updates.push(`from_airport = $${paramCount}`);
      params.push(from_airport || null);
      paramCount++;
    }
    if (to_airport !== undefined) {
      updates.push(`to_airport = $${paramCount}`);
      params.push(to_airport || null);
      paramCount++;
    }
    if (pax_count !== undefined) {
      updates.push(`pax_count = $${paramCount}`);
      params.push(pax_count || null);
      paramCount++;
    }
    if (cost_price !== undefined) {
      updates.push(`cost_price = $${paramCount}`);
      params.push(cost_price || null);
      paramCount++;
    }
    if (payment_status !== undefined) {
      updates.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
    }
    if (paid_amount !== undefined) {
      updates.push(`paid_amount = $${paramCount}`);
      params.push(paid_amount || 0);
      paramCount++;
    }
    if (pnr !== undefined) {
      updates.push(`pnr = $${paramCount}`);
      params.push(pnr || null);
      paramCount++;
    }
    if (ticket_numbers !== undefined) {
      updates.push(`ticket_numbers = $${paramCount}`);
      params.push(ticket_numbers || null);
      paramCount++;
    }
    if (voucher_issued !== undefined) {
      updates.push(`voucher_issued = $${paramCount}`);
      params.push(voucher_issued);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    params.push(id);
    const sql = `UPDATE booking_flights SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, params);

    const bookingFlight = {
      ...result.rows[0],
      departure_date: formatDateTime(result.rows[0].departure_date),
      arrival_date: formatDateTime(result.rows[0].arrival_date),
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      message: 'Booking flight updated successfully',
      data: bookingFlight
    });
  } catch (error) {
    console.error('Update booking flight error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking ID'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update booking flight'
      }
    });
  }
};

/**
 * Delete booking flight
 * DELETE /api/booking-flights/:id
 */
exports.deleteBookingFlight = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking flight exists and get booking_id
    const checkResult = await query(
      'SELECT id, booking_id FROM booking_flights WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking flight not found'
        }
      });
    }

    const bookingId = checkResult.rows[0].booking_id;

    // Hard delete the booking flight
    await query('DELETE FROM booking_flights WHERE id = $1', [id]);

    // Recalculate booking totals
    if (bookingId) {
      await query('SELECT calculate_booking_totals($1)', [bookingId]);
    }

    res.json({
      success: true,
      message: 'Booking flight deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking flight error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete booking flight'
      }
    });
  }
};
