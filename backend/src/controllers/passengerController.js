const { query } = require('../config/database');
const { formatDate } = require('../utils/formatters');

/**
 * Get all passengers with optional booking_id filter
 * GET /api/passengers
 */
exports.getAll = async (req, res) => {
  try {
    const { booking_id } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        id,
        booking_id,
        name,
        passport_number,
        nationality,
        date_of_birth,
        special_requests
      FROM passengers
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by booking_id
    if (booking_id) {
      queryText += ` AND booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    // Order by id ascending
    queryText += ` ORDER BY id ASC`;

    const result = await query(queryText, params);

    // Format dates in results
    const passengers = result.rows.map(passenger => ({
      ...passenger,
      date_of_birth: formatDate(passenger.date_of_birth)
    }));

    res.json({
      success: true,
      data: passengers,
      count: passengers.length
    });
  } catch (error) {
    console.error('Get all passengers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve passengers'
      }
    });
  }
};

/**
 * Get single passenger by ID
 * GET /api/passengers/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        booking_id,
        name,
        passport_number,
        nationality,
        date_of_birth,
        special_requests
      FROM passengers
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Passenger not found'
        }
      });
    }

    const passenger = result.rows[0];

    // Format dates
    passenger.date_of_birth = formatDate(passenger.date_of_birth);

    res.json({
      success: true,
      data: passenger
    });
  } catch (error) {
    console.error('Get passenger by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve passenger'
      }
    });
  }
};

/**
 * Get all passengers for a specific booking
 * GET /api/passengers/booking/:booking_id
 */
exports.getByBooking = async (req, res) => {
  try {
    const { booking_id } = req.params;

    // First check if booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    const result = await query(
      `SELECT
        id,
        booking_id,
        name,
        passport_number,
        nationality,
        date_of_birth,
        special_requests
      FROM passengers
      WHERE booking_id = $1
      ORDER BY id ASC`,
      [booking_id]
    );

    // Format dates in results
    const passengers = result.rows.map(passenger => ({
      ...passenger,
      date_of_birth: formatDate(passenger.date_of_birth)
    }));

    res.json({
      success: true,
      data: passengers,
      count: passengers.length
    });
  } catch (error) {
    console.error('Get passengers by booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve passengers for booking'
      }
    });
  }
};

/**
 * Create new passenger
 * POST /api/passengers
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      name,
      passport_number,
      nationality,
      date_of_birth,
      special_requests
    } = req.body;

    // Validation - booking_id and name are required
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required'
        }
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passenger name is required'
        }
      });
    }

    // Check if booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found. Booking ID must exist in bookings table'
        }
      });
    }

    // Parse date_of_birth if provided (from dd/mm/yyyy to ISO format)
    let parsedDateOfBirth = null;
    if (date_of_birth) {
      const { parseDate } = require('../utils/formatters');
      parsedDateOfBirth = parseDate(date_of_birth);

      if (!parsedDateOfBirth) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid date format for date_of_birth. Use dd/mm/yyyy format'
          }
        });
      }
    }

    // Insert new passenger
    const result = await query(
      `INSERT INTO passengers (
        booking_id,
        name,
        passport_number,
        nationality,
        date_of_birth,
        special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        booking_id,
        name,
        passport_number,
        nationality,
        date_of_birth,
        special_requests`,
      [
        booking_id,
        name,
        passport_number || null,
        nationality || null,
        parsedDateOfBirth,
        special_requests || null
      ]
    );

    const newPassenger = result.rows[0];

    // Format dates
    newPassenger.date_of_birth = formatDate(newPassenger.date_of_birth);

    res.status(201).json({
      success: true,
      message: 'Passenger created successfully',
      data: newPassenger
    });
  } catch (error) {
    console.error('Create passenger error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking_id. Booking does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create passenger'
      }
    });
  }
};

/**
 * Update passenger
 * PUT /api/passengers/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      name,
      passport_number,
      nationality,
      date_of_birth,
      special_requests
    } = req.body;

    // Check if passenger exists
    const existingPassenger = await query(
      'SELECT id FROM passengers WHERE id = $1',
      [id]
    );

    if (existingPassenger.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Passenger not found'
        }
      });
    }

    // Validation
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passenger name cannot be empty'
        }
      });
    }

    // Check if new booking_id exists (if being updated)
    if (booking_id) {
      const bookingCheck = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found. Booking ID must exist in bookings table'
          }
        });
      }
    }

    // Parse date_of_birth if provided (from dd/mm/yyyy to ISO format)
    let parsedDateOfBirth = undefined;
    if (date_of_birth !== undefined) {
      if (date_of_birth === null || date_of_birth === '') {
        parsedDateOfBirth = null;
      } else {
        const { parseDate } = require('../utils/formatters');
        parsedDateOfBirth = parseDate(date_of_birth);

        if (!parsedDateOfBirth) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid date format for date_of_birth. Use dd/mm/yyyy format'
            }
          });
        }
      }
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (booking_id !== undefined) {
      updates.push(`booking_id = $${paramCount}`);
      params.push(booking_id);
      paramCount++;
    }

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (passport_number !== undefined) {
      updates.push(`passport_number = $${paramCount}`);
      params.push(passport_number || null);
      paramCount++;
    }

    if (nationality !== undefined) {
      updates.push(`nationality = $${paramCount}`);
      params.push(nationality || null);
      paramCount++;
    }

    if (parsedDateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount}`);
      params.push(parsedDateOfBirth);
      paramCount++;
    }

    if (special_requests !== undefined) {
      updates.push(`special_requests = $${paramCount}`);
      params.push(special_requests || null);
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

    // Add id parameter
    params.push(id);

    const result = await query(
      `UPDATE passengers
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         booking_id,
         name,
         passport_number,
         nationality,
         date_of_birth,
         special_requests`,
      params
    );

    const updatedPassenger = result.rows[0];

    // Format dates
    updatedPassenger.date_of_birth = formatDate(updatedPassenger.date_of_birth);

    res.json({
      success: true,
      message: 'Passenger updated successfully',
      data: updatedPassenger
    });
  } catch (error) {
    console.error('Update passenger error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking_id. Booking does not exist'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update passenger'
      }
    });
  }
};

/**
 * Delete passenger (hard delete - CASCADE on DELETE)
 * DELETE /api/passengers/:id
 */
exports.deletePassenger = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if passenger exists
    const existingPassenger = await query(
      'SELECT id, name FROM passengers WHERE id = $1',
      [id]
    );

    if (existingPassenger.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Passenger not found'
        }
      });
    }

    // Hard delete - permanently remove the passenger
    await query(
      'DELETE FROM passengers WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Passenger deleted successfully'
    });
  } catch (error) {
    console.error('Delete passenger error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete passenger'
      }
    });
  }
};
