const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all seasonal rates for a specific hotel
 * GET /api/hotels/:hotelId/seasonal-rates
 */
exports.getByHotelId = async (req, res) => {
  try {
    const { hotelId } = req.params;

    // Check if hotel exists
    const hotelCheck = await query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
    if (hotelCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hotel not found'
        }
      });
    }

    const result = await query(
      'SELECT * FROM hotel_seasonal_rates WHERE hotel_id = $1 ORDER BY valid_from ASC',
      [hotelId]
    );

    const rates = result.rows.map(rate => ({
      ...rate,
      created_at: formatDateTime(rate.created_at),
      updated_at: formatDateTime(rate.updated_at)
    }));

    res.json({
      success: true,
      count: rates.length,
      data: rates
    });
  } catch (error) {
    console.error('Get hotel seasonal rates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch seasonal rates'
      }
    });
  }
};

/**
 * Get rate for specific hotel on a specific date
 * GET /api/hotels/:hotelId/seasonal-rates/date/:date
 */
exports.getRateForDate = async (req, res) => {
  try {
    const { hotelId, date } = req.params;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Use YYYY-MM-DD'
        }
      });
    }

    const result = await query(
      `SELECT * FROM get_hotel_rate_for_date($1, $2)`,
      [hotelId, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No rate found for the specified date'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get rate for date error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch rate for date'
      }
    });
  }
};

/**
 * Create new seasonal rate period
 * POST /api/hotels/:hotelId/seasonal-rates
 */
exports.create = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      season_name,
      valid_from,
      valid_to,
      price_per_person_double,
      price_single_supplement,
      price_per_person_triple,
      price_child_0_2,
      price_child_3_5,
      price_child_6_11,
      notes
    } = req.body;

    // Check if hotel exists
    const hotelCheck = await query('SELECT id FROM hotels WHERE id = $1', [hotelId]);
    if (hotelCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Hotel not found'
        }
      });
    }

    // Validation
    if (!season_name || !valid_from || !valid_to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Season name, valid_from, and valid_to are required'
        }
      });
    }

    // Validate date formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valid_from) || !/^\d{4}-\d{2}-\d{2}$/.test(valid_to)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dates must be in YYYY-MM-DD format'
        }
      });
    }

    // Validate date range
    if (new Date(valid_from) > new Date(valid_to)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'valid_from must be before or equal to valid_to'
        }
      });
    }

    // Check for overlapping date ranges
    const overlapCheck = await query(
      `SELECT id, season_name FROM hotel_seasonal_rates
       WHERE hotel_id = $1
       AND (
         (valid_from <= $2 AND valid_to >= $2) OR
         (valid_from <= $3 AND valid_to >= $3) OR
         (valid_from >= $2 AND valid_to <= $3)
       )`,
      [hotelId, valid_from, valid_to]
    );

    if (overlapCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Date range overlaps with existing season: ${overlapCheck.rows[0].season_name}`
        }
      });
    }

    const result = await query(
      `INSERT INTO hotel_seasonal_rates (
        hotel_id, season_name, valid_from, valid_to,
        price_per_person_double, price_single_supplement, price_per_person_triple,
        price_child_0_2, price_child_3_5, price_child_6_11, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        hotelId,
        season_name,
        valid_from,
        valid_to,
        price_per_person_double || null,
        price_single_supplement || null,
        price_per_person_triple || null,
        price_child_0_2 || null,
        price_child_3_5 || null,
        price_child_6_11 || null,
        notes || null
      ]
    );

    const rate = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at),
      updated_at: formatDateTime(result.rows[0].updated_at)
    };

    res.status(201).json({
      success: true,
      message: 'Seasonal rate created successfully',
      data: rate
    });
  } catch (error) {
    console.error('Create seasonal rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create seasonal rate'
      }
    });
  }
};

/**
 * Update seasonal rate period
 * PUT /api/hotels/:hotelId/seasonal-rates/:rateId
 */
exports.update = async (req, res) => {
  try {
    const { hotelId, rateId } = req.params;
    const {
      season_name,
      valid_from,
      valid_to,
      price_per_person_double,
      price_single_supplement,
      price_per_person_triple,
      price_child_0_2,
      price_child_3_5,
      price_child_6_11,
      notes
    } = req.body;

    // Check if rate exists and belongs to hotel
    const checkResult = await query(
      'SELECT id FROM hotel_seasonal_rates WHERE id = $1 AND hotel_id = $2',
      [rateId, hotelId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Seasonal rate not found for this hotel'
        }
      });
    }

    // Validate date formats if provided
    if (valid_from && !/^\d{4}-\d{2}-\d{2}$/.test(valid_from)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'valid_from must be in YYYY-MM-DD format'
        }
      });
    }

    if (valid_to && !/^\d{4}-\d{2}-\d{2}$/.test(valid_to)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'valid_to must be in YYYY-MM-DD format'
        }
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (season_name !== undefined) {
      updates.push(`season_name = $${paramCount}`);
      params.push(season_name);
      paramCount++;
    }
    if (valid_from !== undefined) {
      updates.push(`valid_from = $${paramCount}`);
      params.push(valid_from);
      paramCount++;
    }
    if (valid_to !== undefined) {
      updates.push(`valid_to = $${paramCount}`);
      params.push(valid_to);
      paramCount++;
    }
    if (price_per_person_double !== undefined) {
      updates.push(`price_per_person_double = $${paramCount}`);
      params.push(price_per_person_double || null);
      paramCount++;
    }
    if (price_single_supplement !== undefined) {
      updates.push(`price_single_supplement = $${paramCount}`);
      params.push(price_single_supplement || null);
      paramCount++;
    }
    if (price_per_person_triple !== undefined) {
      updates.push(`price_per_person_triple = $${paramCount}`);
      params.push(price_per_person_triple || null);
      paramCount++;
    }
    if (price_child_0_2 !== undefined) {
      updates.push(`price_child_0_2 = $${paramCount}`);
      params.push(price_child_0_2 || null);
      paramCount++;
    }
    if (price_child_3_5 !== undefined) {
      updates.push(`price_child_3_5 = $${paramCount}`);
      params.push(price_child_3_5 || null);
      paramCount++;
    }
    if (price_child_6_11 !== undefined) {
      updates.push(`price_child_6_11 = $${paramCount}`);
      params.push(price_child_6_11 || null);
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

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    params.push(rateId);
    params.push(hotelId);
    const sql = `UPDATE hotel_seasonal_rates
                 SET ${updates.join(', ')}
                 WHERE id = $${paramCount} AND hotel_id = $${paramCount + 1}
                 RETURNING *`;

    const result = await query(sql, params);

    const rate = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at),
      updated_at: formatDateTime(result.rows[0].updated_at)
    };

    res.json({
      success: true,
      message: 'Seasonal rate updated successfully',
      data: rate
    });
  } catch (error) {
    console.error('Update seasonal rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update seasonal rate'
      }
    });
  }
};

/**
 * Delete seasonal rate period
 * DELETE /api/hotels/:hotelId/seasonal-rates/:rateId
 */
exports.delete = async (req, res) => {
  try {
    const { hotelId, rateId } = req.params;

    // Check if rate exists and belongs to hotel
    const checkResult = await query(
      'SELECT id, season_name FROM hotel_seasonal_rates WHERE id = $1 AND hotel_id = $2',
      [rateId, hotelId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Seasonal rate not found for this hotel'
        }
      });
    }

    await query(
      'DELETE FROM hotel_seasonal_rates WHERE id = $1 AND hotel_id = $2',
      [rateId, hotelId]
    );

    res.json({
      success: true,
      message: 'Seasonal rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete seasonal rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete seasonal rate'
      }
    });
  }
};
