const { query } = require('../config/database');
const { formatDateTime, formatDate } = require('../utils/formatters');

/**
 * Get all bookings with filters
 * GET /api/bookings
 */
exports.getAll = async (req, res) => {
  try {
    const { status, is_confirmed, client_id, travel_date_from, travel_date_to, booked_by } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        b.id,
        b.booking_code,
        b.client_id,
        c.name as client_name,
        c.type as client_type,
        b.pax_count,
        b.travel_date_from,
        b.travel_date_to,
        b.status,
        b.is_confirmed,
        b.total_sell_price,
        b.total_cost_price,
        b.gross_profit,
        b.payment_status,
        b.amount_received,
        b.traveler_name,
        b.traveler_email,
        b.traveler_phone,
        b.booked_by,
        b.created_at,
        b.confirmed_at,
        b.completed_at,
        b.notes
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by status
    if (status && ['inquiry', 'quoted', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      queryText += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by is_confirmed
    if (is_confirmed !== undefined) {
      const confirmed = is_confirmed === 'true' || is_confirmed === true;
      queryText += ` AND b.is_confirmed = $${paramCount}`;
      params.push(confirmed);
      paramCount++;
    }

    // Filter by client_id
    if (client_id) {
      queryText += ` AND b.client_id = $${paramCount}`;
      params.push(client_id);
      paramCount++;
    }

    // Filter by travel_date_from (greater than or equal)
    if (travel_date_from) {
      queryText += ` AND b.travel_date_from >= $${paramCount}`;
      params.push(travel_date_from);
      paramCount++;
    }

    // Filter by travel_date_to (less than or equal)
    if (travel_date_to) {
      queryText += ` AND b.travel_date_to <= $${paramCount}`;
      params.push(travel_date_to);
      paramCount++;
    }

    // Filter by booked_by (agent/direct)
    if (booked_by && ['agent', 'direct'].includes(booked_by)) {
      queryText += ` AND b.booked_by = $${paramCount}`;
      params.push(booked_by);
      paramCount++;
    }

    // Order by created_at descending (newest first)
    queryText += ` ORDER BY b.created_at DESC`;

    const result = await query(queryText, params);

    // Format dates and decimals in results
    const bookings = result.rows.map(booking => ({
      ...booking,
      travel_date_from: formatDate(booking.travel_date_from),
      travel_date_to: formatDate(booking.travel_date_to),
      created_at: formatDateTime(booking.created_at),
      confirmed_at: formatDateTime(booking.confirmed_at),
      completed_at: formatDateTime(booking.completed_at),
      total_sell_price: booking.total_sell_price ? parseFloat(booking.total_sell_price) : 0,
      total_cost_price: booking.total_cost_price ? parseFloat(booking.total_cost_price) : 0,
      gross_profit: booking.gross_profit ? parseFloat(booking.gross_profit) : 0,
      amount_received: booking.amount_received ? parseFloat(booking.amount_received) : 0
    }));

    res.json({
      success: true,
      data: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve bookings'
      }
    });
  }
};

/**
 * Get single booking by ID
 * GET /api/bookings/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        b.id,
        b.booking_code,
        b.client_id,
        c.name as client_name,
        c.type as client_type,
        c.email as client_email,
        c.phone as client_phone,
        b.pax_count,
        b.travel_date_from,
        b.travel_date_to,
        b.status,
        b.is_confirmed,
        b.total_sell_price,
        b.total_cost_price,
        b.gross_profit,
        b.payment_status,
        b.amount_received,
        b.traveler_name,
        b.traveler_email,
        b.traveler_phone,
        b.booked_by,
        b.created_at,
        b.confirmed_at,
        b.completed_at,
        b.notes
      FROM bookings b
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    const booking = result.rows[0];

    // Format dates and decimals
    booking.travel_date_from = formatDate(booking.travel_date_from);
    booking.travel_date_to = formatDate(booking.travel_date_to);
    booking.created_at = formatDateTime(booking.created_at);
    booking.confirmed_at = formatDateTime(booking.confirmed_at);
    booking.completed_at = formatDateTime(booking.completed_at);
    booking.total_sell_price = booking.total_sell_price ? parseFloat(booking.total_sell_price) : 0;
    booking.total_cost_price = booking.total_cost_price ? parseFloat(booking.total_cost_price) : 0;
    booking.gross_profit = booking.gross_profit ? parseFloat(booking.gross_profit) : 0;
    booking.amount_received = booking.amount_received ? parseFloat(booking.amount_received) : 0;

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve booking'
      }
    });
  }
};

/**
 * Create new booking
 * POST /api/bookings
 */
exports.create = async (req, res) => {
  try {
    const {
      client_id,
      pax_count,
      travel_date_from,
      travel_date_to,
      status,
      is_confirmed,
      markup_percentage,
      total_sell_price,
      total_cost_price,
      gross_profit,
      payment_status,
      amount_received,
      traveler_name,
      traveler_email,
      traveler_phone,
      booked_by,
      notes
    } = req.body;

    // Validation - client_id is optional but if provided must be valid
    if (client_id) {
      const clientExists = await query(
        'SELECT id FROM clients WHERE id = $1',
        [client_id]
      );

      if (clientExists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid client_id - client does not exist'
          }
        });
      }
    }

    // Validate status if provided
    if (status && !['inquiry', 'quoted', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be one of: inquiry, quoted, confirmed, completed, cancelled'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'partial', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be one of: pending, partial, paid'
        }
      });
    }

    // Validate booked_by if provided
    if (booked_by && !['agent', 'direct'].includes(booked_by)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booked by must be one of: agent, direct'
        }
      });
    }

    // Validate pax_count if provided
    if (pax_count !== null && pax_count !== undefined) {
      const count = parseInt(pax_count);
      if (isNaN(count) || count < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Pax count must be a non-negative number'
          }
        });
      }
    }

    // Validate dates if both provided
    if (travel_date_from && travel_date_to) {
      const dateFrom = new Date(travel_date_from);
      const dateTo = new Date(travel_date_to);

      if (dateTo < dateFrom) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Travel date to must be after or equal to travel date from'
          }
        });
      }
    }

    // Insert new booking with auto-generated booking_code
    const result = await query(
      `INSERT INTO bookings (
        booking_code,
        client_id,
        pax_count,
        travel_date_from,
        travel_date_to,
        status,
        is_confirmed,
        markup_percentage,
        total_sell_price,
        total_cost_price,
        gross_profit,
        payment_status,
        amount_received,
        traveler_name,
        traveler_email,
        traveler_phone,
        booked_by,
        notes
      ) VALUES (
        generate_booking_code(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING
        id,
        booking_code,
        client_id,
        pax_count,
        travel_date_from,
        travel_date_to,
        status,
        is_confirmed,
        markup_percentage,
        total_sell_price,
        total_cost_price,
        gross_profit,
        payment_status,
        amount_received,
        traveler_name,
        traveler_email,
        traveler_phone,
        booked_by,
        created_at,
        confirmed_at,
        completed_at,
        notes`,
      [
        client_id || null,
        pax_count || null,
        travel_date_from || null,
        travel_date_to || null,
        status || 'inquiry',
        is_confirmed || false,
        markup_percentage || 0,
        total_sell_price || 0,
        total_cost_price || 0,
        gross_profit || 0,
        payment_status || 'pending',
        amount_received || 0,
        traveler_name || null,
        traveler_email || null,
        traveler_phone || null,
        booked_by || 'direct',
        notes || null
      ]
    );

    const newBooking = result.rows[0];

    // Format dates and decimals
    newBooking.travel_date_from = formatDate(newBooking.travel_date_from);
    newBooking.travel_date_to = formatDate(newBooking.travel_date_to);
    newBooking.created_at = formatDateTime(newBooking.created_at);
    newBooking.confirmed_at = formatDateTime(newBooking.confirmed_at);
    newBooking.completed_at = formatDateTime(newBooking.completed_at);
    newBooking.total_sell_price = newBooking.total_sell_price ? parseFloat(newBooking.total_sell_price) : 0;
    newBooking.total_cost_price = newBooking.total_cost_price ? parseFloat(newBooking.total_cost_price) : 0;
    newBooking.gross_profit = newBooking.gross_profit ? parseFloat(newBooking.gross_profit) : 0;
    newBooking.amount_received = newBooking.amount_received ? parseFloat(newBooking.amount_received) : 0;

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid client_id - client does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking'
      }
    });
  }
};

/**
 * Update booking
 * PUT /api/bookings/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      pax_count,
      travel_date_from,
      travel_date_to,
      status,
      is_confirmed,
      markup_percentage,
      total_sell_price,
      total_cost_price,
      gross_profit,
      payment_status,
      amount_received,
      traveler_name,
      traveler_email,
      traveler_phone,
      booked_by,
      notes
    } = req.body;

    // Check if booking exists
    const existingBooking = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [id]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Validation - client_id if provided
    if (client_id !== undefined && client_id !== null) {
      const clientExists = await query(
        'SELECT id FROM clients WHERE id = $1',
        [client_id]
      );

      if (clientExists.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid client_id - client does not exist'
          }
        });
      }
    }

    // Validate status if provided
    if (status && !['inquiry', 'quoted', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be one of: inquiry, quoted, confirmed, completed, cancelled'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'partial', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment status must be one of: pending, partial, paid'
        }
      });
    }

    // Validate booked_by if provided
    if (booked_by && !['agent', 'direct'].includes(booked_by)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booked by must be one of: agent, direct'
        }
      });
    }

    // Validate pax_count if provided
    if (pax_count !== null && pax_count !== undefined) {
      const count = parseInt(pax_count);
      if (isNaN(count) || count < 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Pax count must be a non-negative number'
          }
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (client_id !== undefined) {
      updates.push(`client_id = $${paramCount}`);
      params.push(client_id || null);
      paramCount++;
    }

    if (pax_count !== undefined) {
      updates.push(`pax_count = $${paramCount}`);
      params.push(pax_count || null);
      paramCount++;
    }

    if (travel_date_from !== undefined) {
      updates.push(`travel_date_from = $${paramCount}`);
      params.push(travel_date_from || null);
      paramCount++;
    }

    if (travel_date_to !== undefined) {
      updates.push(`travel_date_to = $${paramCount}`);
      params.push(travel_date_to || null);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (is_confirmed !== undefined) {
      updates.push(`is_confirmed = $${paramCount}`);
      params.push(is_confirmed);
      paramCount++;
    }

    if (markup_percentage !== undefined) {
      updates.push(`markup_percentage = $${paramCount}`);
      params.push(markup_percentage || 0);
      paramCount++;
    }

    if (total_sell_price !== undefined) {
      updates.push(`total_sell_price = $${paramCount}`);
      params.push(total_sell_price || 0);
      paramCount++;
    }

    if (total_cost_price !== undefined) {
      updates.push(`total_cost_price = $${paramCount}`);
      params.push(total_cost_price || 0);
      paramCount++;
    }

    if (gross_profit !== undefined) {
      updates.push(`gross_profit = $${paramCount}`);
      params.push(gross_profit || 0);
      paramCount++;
    }

    if (payment_status !== undefined) {
      updates.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
    }

    if (amount_received !== undefined) {
      updates.push(`amount_received = $${paramCount}`);
      params.push(amount_received || 0);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes || null);
      paramCount++;
    }

    if (traveler_name !== undefined) {
      updates.push(`traveler_name = $${paramCount}`);
      params.push(traveler_name || null);
      paramCount++;
    }

    if (traveler_email !== undefined) {
      updates.push(`traveler_email = $${paramCount}`);
      params.push(traveler_email || null);
      paramCount++;
    }

    if (traveler_phone !== undefined) {
      updates.push(`traveler_phone = $${paramCount}`);
      params.push(traveler_phone || null);
      paramCount++;
    }

    if (booked_by !== undefined) {
      updates.push(`booked_by = $${paramCount}`);
      params.push(booked_by);
      paramCount++;
    }

    // Handle confirmed_at timestamp
    if (status === 'confirmed' && is_confirmed === true) {
      updates.push(`confirmed_at = NOW()`);
    }

    // Handle completed_at timestamp
    if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
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

    // Add id parameter
    params.push(id);

    const result = await query(
      `UPDATE bookings
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         booking_code,
         client_id,
         pax_count,
         travel_date_from,
         travel_date_to,
         status,
         is_confirmed,
         total_sell_price,
         total_cost_price,
         gross_profit,
         payment_status,
         amount_received,
         traveler_name,
         traveler_email,
         traveler_phone,
         booked_by,
         created_at,
         confirmed_at,
         completed_at,
         notes`,
      params
    );

    const updatedBooking = result.rows[0];

    // Format dates and decimals
    updatedBooking.travel_date_from = formatDate(updatedBooking.travel_date_from);
    updatedBooking.travel_date_to = formatDate(updatedBooking.travel_date_to);
    updatedBooking.created_at = formatDateTime(updatedBooking.created_at);
    updatedBooking.confirmed_at = formatDateTime(updatedBooking.confirmed_at);
    updatedBooking.completed_at = formatDateTime(updatedBooking.completed_at);
    updatedBooking.total_sell_price = updatedBooking.total_sell_price ? parseFloat(updatedBooking.total_sell_price) : 0;
    updatedBooking.total_cost_price = updatedBooking.total_cost_price ? parseFloat(updatedBooking.total_cost_price) : 0;
    updatedBooking.gross_profit = updatedBooking.gross_profit ? parseFloat(updatedBooking.gross_profit) : 0;
    updatedBooking.amount_received = updatedBooking.amount_received ? parseFloat(updatedBooking.amount_received) : 0;

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid client_id - client does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update booking'
      }
    });
  }
};

/**
 * Delete booking (soft delete - set status to cancelled)
 * DELETE /api/bookings/:id
 */
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists
    const existingBooking = await query(
      'SELECT id, status FROM bookings WHERE id = $1',
      [id]
    );

    if (existingBooking.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Soft delete - set status to cancelled
    await query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    res.json({
      success: true,
      message: 'Booking deleted successfully (status set to cancelled)'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete booking'
      }
    });
  }
};
