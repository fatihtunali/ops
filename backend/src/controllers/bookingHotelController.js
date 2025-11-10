const { query } = require('../config/database');
const { formatDate, formatDateTime, formatRowDates } = require('../utils/formatters');

/**
 * Get all booking hotels
 * GET /api/booking-hotels
 * Query params: booking_id, payment_status, check_in_from, check_in_to
 */
exports.getAll = async (req, res) => {
  try {
    const { booking_id, payment_status, check_in_from, check_in_to } = req.query;

    // Build query dynamically based on filters
    let sql = 'SELECT * FROM booking_hotels WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (booking_id) {
      sql += ` AND booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    if (payment_status) {
      sql += ` AND payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    if (check_in_from) {
      sql += ` AND check_in >= $${paramCount}`;
      params.push(check_in_from);
      paramCount++;
    }

    if (check_in_to) {
      sql += ` AND check_in <= $${paramCount}`;
      params.push(check_in_to);
      paramCount++;
    }

    sql += ' ORDER BY check_in DESC, id DESC';

    const result = await query(sql, params);

    // Format dates for all booking hotels
    const bookingHotels = result.rows.map(bh => formatRowDates(bh,
      ['check_in', 'check_out', 'payment_due_date'],
      ['created_at']
    ));

    res.json({
      success: true,
      count: bookingHotels.length,
      data: bookingHotels
    });
  } catch (error) {
    console.error('Get all booking hotels error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking hotels'
      }
    });
  }
};

/**
 * Get booking hotel by ID
 * GET /api/booking-hotels/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM booking_hotels WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking hotel not found'
        }
      });
    }

    const bookingHotel = formatRowDates(result.rows[0],
      ['check_in', 'check_out', 'payment_due_date'],
      ['created_at']
    );

    res.json({
      success: true,
      data: bookingHotel
    });
  } catch (error) {
    console.error('Get booking hotel by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking hotel'
      }
    });
  }
};

/**
 * Create new booking hotel
 * POST /api/booking-hotels
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      hotel_id,
      hotel_name,
      check_in,
      check_out,
      nights,
      room_type,
      number_of_rooms,
      cost_per_night,
      total_cost,
      payment_status,
      paid_amount,
      payment_due_date,
      confirmation_number,
      voucher_issued,
      notes
    } = req.body;

    // Validation: booking_id is required
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'booking_id is required'
        }
      });
    }

    // Check if booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking with the specified booking_id does not exist'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'payment_status must be either "pending" or "paid"'
        }
      });
    }

    // Validate numeric fields
    if (nights !== undefined && (isNaN(nights) || parseInt(nights) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'nights must be a valid positive number'
        }
      });
    }

    if (number_of_rooms !== undefined && (isNaN(number_of_rooms) || parseInt(number_of_rooms) < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'number_of_rooms must be a valid positive number'
        }
      });
    }

    if (cost_per_night !== undefined && (isNaN(cost_per_night) || parseFloat(cost_per_night) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'cost_per_night must be a valid positive number'
        }
      });
    }

    if (total_cost !== undefined && (isNaN(total_cost) || parseFloat(total_cost) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'total_cost must be a valid positive number'
        }
      });
    }

    if (paid_amount !== undefined && (isNaN(paid_amount) || parseFloat(paid_amount) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'paid_amount must be a valid positive number'
        }
      });
    }

    // If hotel_id is provided, fetch hotel_name from hotels table for historical accuracy
    let finalHotelName = hotel_name;
    if (hotel_id && !hotel_name) {
      const hotelResult = await query(
        'SELECT name FROM hotels WHERE id = $1',
        [hotel_id]
      );

      if (hotelResult.rows.length > 0) {
        finalHotelName = hotelResult.rows[0].name;
      }
    }

    const result = await query(
      `INSERT INTO booking_hotels (
        booking_id, hotel_id, hotel_name, check_in, check_out, nights,
        room_type, number_of_rooms, cost_per_night, total_cost,
        payment_status, paid_amount, payment_due_date,
        confirmation_number, voucher_issued, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        booking_id,
        hotel_id || null,
        finalHotelName || null,
        check_in || null,
        check_out || null,
        nights || null,
        room_type || null,
        number_of_rooms || null,
        cost_per_night || null,
        total_cost || null,
        payment_status || 'pending',
        paid_amount || 0,
        payment_due_date || null,
        confirmation_number || null,
        voucher_issued || false,
        notes || null
      ]
    );

    const bookingHotel = formatRowDates(result.rows[0],
      ['check_in', 'check_out', 'payment_due_date'],
      ['created_at']
    );

    res.status(201).json({
      success: true,
      message: 'Booking hotel created successfully',
      data: bookingHotel
    });
  } catch (error) {
    console.error('Create booking hotel error:', error);

    // Handle foreign key constraint errors
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking_id or hotel_id reference'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking hotel'
      }
    });
  }
};

/**
 * Update booking hotel
 * PUT /api/booking-hotels/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      hotel_id,
      hotel_name,
      check_in,
      check_out,
      nights,
      room_type,
      number_of_rooms,
      cost_per_night,
      total_cost,
      payment_status,
      paid_amount,
      payment_due_date,
      confirmation_number,
      voucher_issued,
      notes
    } = req.body;

    // Check if booking hotel exists
    const checkResult = await query(
      'SELECT * FROM booking_hotels WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking hotel not found'
        }
      });
    }

    const existingRecord = checkResult.rows[0];

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'payment_status must be either "pending" or "paid"'
        }
      });
    }

    // Validate numeric fields
    if (nights !== undefined && nights !== null && (isNaN(nights) || parseInt(nights) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'nights must be a valid positive number'
        }
      });
    }

    if (number_of_rooms !== undefined && number_of_rooms !== null && (isNaN(number_of_rooms) || parseInt(number_of_rooms) < 1)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'number_of_rooms must be a valid positive number'
        }
      });
    }

    if (cost_per_night !== undefined && cost_per_night !== null && (isNaN(cost_per_night) || parseFloat(cost_per_night) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'cost_per_night must be a valid positive number'
        }
      });
    }

    if (total_cost !== undefined && total_cost !== null && (isNaN(total_cost) || parseFloat(total_cost) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'total_cost must be a valid positive number'
        }
      });
    }

    if (sell_price !== undefined && sell_price !== null && (isNaN(sell_price) || parseFloat(sell_price) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sell_price must be a valid positive number'
        }
      });
    }

    if (paid_amount !== undefined && paid_amount !== null && (isNaN(paid_amount) || parseFloat(paid_amount) < 0)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'paid_amount must be a valid positive number'
        }
      });
    }

    // If hotel_id is being updated, fetch hotel_name from hotels table
    let finalHotelName = hotel_name;
    if (hotel_id !== undefined && hotel_id !== null && hotel_name === undefined) {
      const hotelResult = await query(
        'SELECT name FROM hotels WHERE id = $1',
        [hotel_id]
      );

      if (hotelResult.rows.length > 0) {
        finalHotelName = hotelResult.rows[0].name;
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
    if (hotel_id !== undefined) {
      updates.push(`hotel_id = $${paramCount}`);
      params.push(hotel_id || null);
      paramCount++;
    }
    if (finalHotelName !== undefined) {
      updates.push(`hotel_name = $${paramCount}`);
      params.push(finalHotelName || null);
      paramCount++;
    }
    if (check_in !== undefined) {
      updates.push(`check_in = $${paramCount}`);
      params.push(check_in || null);
      paramCount++;
    }
    if (check_out !== undefined) {
      updates.push(`check_out = $${paramCount}`);
      params.push(check_out || null);
      paramCount++;
    }
    if (nights !== undefined) {
      updates.push(`nights = $${paramCount}`);
      params.push(nights || null);
      paramCount++;
    }
    if (room_type !== undefined) {
      updates.push(`room_type = $${paramCount}`);
      params.push(room_type || null);
      paramCount++;
    }
    if (number_of_rooms !== undefined) {
      updates.push(`number_of_rooms = $${paramCount}`);
      params.push(number_of_rooms || null);
      paramCount++;
    }
    if (cost_per_night !== undefined) {
      updates.push(`cost_per_night = $${paramCount}`);
      params.push(cost_per_night || null);
      paramCount++;
    }
    if (total_cost !== undefined) {
      updates.push(`total_cost = $${paramCount}`);
      params.push(total_cost || null);
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
    if (payment_due_date !== undefined) {
      updates.push(`payment_due_date = $${paramCount}`);
      params.push(payment_due_date || null);
      paramCount++;
    }
    if (confirmation_number !== undefined) {
      updates.push(`confirmation_number = $${paramCount}`);
      params.push(confirmation_number || null);
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
    const sql = `UPDATE booking_hotels SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, params);

    const bookingHotel = formatRowDates(result.rows[0],
      ['check_in', 'check_out', 'payment_due_date'],
      ['created_at']
    );

    res.json({
      success: true,
      message: 'Booking hotel updated successfully',
      data: bookingHotel
    });
  } catch (error) {
    console.error('Update booking hotel error:', error);

    // Handle foreign key constraint errors
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking_id or hotel_id reference'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update booking hotel'
      }
    });
  }
};

/**
 * Delete booking hotel
 * DELETE /api/booking-hotels/:id
 */
exports.deleteBookingHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking hotel exists
    const checkResult = await query(
      'SELECT id FROM booking_hotels WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking hotel not found'
        }
      });
    }

    // Hard delete since this is a booking detail record
    await query(
      'DELETE FROM booking_hotels WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking hotel error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete booking hotel'
      }
    });
  }
};
