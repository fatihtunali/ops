const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all hotels
 * GET /api/hotels
 * Query params: city, country, status
 */
exports.getAll = async (req, res) => {
  try {
    const { city, country, status } = req.query;

    // Build query dynamically based on filters
    let sql = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (city) {
      sql += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(city);
      paramCount++;
    }

    if (country) {
      sql += ` AND LOWER(country) = LOWER($${paramCount})`;
      params.push(country);
      paramCount++;
    }

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);

    // Format dates for all hotels
    const hotels = result.rows.map(hotel => ({
      ...hotel,
      created_at: formatDateTime(hotel.created_at)
    }));

    res.json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Get all hotels error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch hotels'
      }
    });
  }
};

/**
 * Get hotel by ID
 * GET /api/hotels/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM hotels WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hotel not found'
        }
      });
    }

    const hotel = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Get hotel by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch hotel'
      }
    });
  }
};

/**
 * Create new hotel
 * POST /api/hotels
 */
exports.create = async (req, res) => {
  try {
    const {
      name,
      city,
      country,
      contact_person,
      contact_email,
      contact_phone,
      notes,
      status
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Hotel name is required'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "active" or "inactive"'
        }
      });
    }

    const result = await query(
      `INSERT INTO hotels (
        name, city, country, contact_person, contact_email,
        contact_phone, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        city || null,
        country || null,
        contact_person || null,
        contact_email || null,
        contact_phone || null,
        notes || null,
        status || 'active'
      ]
    );

    const hotel = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);

    // Handle duplicate hotel name or other constraints
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'A hotel with this name already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create hotel'
      }
    });
  }
};

/**
 * Update hotel
 * PUT /api/hotels/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      city,
      country,
      contact_person,
      contact_email,
      contact_phone,
      notes,
      status
    } = req.body;

    // Check if hotel exists
    const checkResult = await query(
      'SELECT id FROM hotels WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hotel not found'
        }
      });
    }

    // Validation
    if (name !== undefined && !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Hotel name cannot be empty'
        }
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "active" or "inactive"'
        }
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCount}`);
      params.push(city || null);
      paramCount++;
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCount}`);
      params.push(country || null);
      paramCount++;
    }
    if (contact_person !== undefined) {
      updates.push(`contact_person = $${paramCount}`);
      params.push(contact_person || null);
      paramCount++;
    }
    if (contact_email !== undefined) {
      updates.push(`contact_email = $${paramCount}`);
      params.push(contact_email || null);
      paramCount++;
    }
    if (contact_phone !== undefined) {
      updates.push(`contact_phone = $${paramCount}`);
      params.push(contact_phone || null);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes || null);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
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
    const sql = `UPDATE hotels SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, params);

    const hotel = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Update hotel error:', error);

    // Handle duplicate hotel name or other constraints
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'A hotel with this name already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update hotel'
      }
    });
  }
};

/**
 * Delete hotel (hard delete - permanently remove from database)
 * DELETE /api/hotels/:id
 */
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const checkResult = await query(
      'SELECT id FROM hotels WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hotel not found'
        }
      });
    }

    // Check if hotel is used in any bookings
    const bookingCheck = await query(
      'SELECT COUNT(*) FROM booking_hotels WHERE hotel_id = $1',
      [id]
    );

    const bookingCount = parseInt(bookingCheck.rows[0].count);
    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFERENTIAL_INTEGRITY_ERROR',
          message: 'Cannot delete hotel that is referenced in bookings. Please delete the related records first.'
        }
      });
    }

    // Hard delete - permanently remove from database
    await query(
      'DELETE FROM hotels WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete hotel'
      }
    });
  }
};
