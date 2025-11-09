const { query } = require('../config/database');
const { formatDate, formatDateTime } = require('../utils/formatters');

/**
 * Create a new guide rate
 * POST /api/guide-rates
 */
exports.createGuideRate = async (req, res) => {
  try {
    const {
      guide_id,
      guide_name,
      city,
      season_name,
      start_date,
      end_date,
      currency = 'EUR',
      daily_rate,
      night_rate,
      transfer_rate,
      package_rate_per_day,
      notes
    } = req.body;

    // Validation
    if (!guide_id || !season_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Guide ID, season name, start date, and end date are required'
        }
      });
    }

    // Validate at least one rate is provided
    if (!daily_rate && !night_rate && !transfer_rate && !package_rate_per_day) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one rate must be provided'
        }
      });
    }

    // Check for duplicate rates
    const duplicateCheck = await query(
      `SELECT id FROM guide_rates
       WHERE guide_id = $1 AND city = $2 AND season_name = $3
       AND start_date = $4 AND end_date = $5`,
      [guide_id, city, season_name, start_date, end_date]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'A rate already exists for this guide, city, season, and date range'
        }
      });
    }

    // Insert guide rate
    const result = await query(
      `INSERT INTO guide_rates
       (guide_id, guide_name, city, season_name, start_date, end_date, currency,
        daily_rate, night_rate, transfer_rate, package_rate_per_day, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [guide_id, guide_name, city, season_name, start_date, end_date, currency,
       daily_rate, night_rate, transfer_rate, package_rate_per_day, notes]
    );

    const guideRate = result.rows[0];

    // Format dates
    guideRate.start_date = formatDate(guideRate.start_date);
    guideRate.end_date = formatDate(guideRate.end_date);
    guideRate.created_at = formatDateTime(guideRate.created_at);
    guideRate.updated_at = formatDateTime(guideRate.updated_at);

    res.status(201).json({
      success: true,
      message: 'Guide rate created successfully',
      data: guideRate
    });
  } catch (error) {
    console.error('Create guide rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create guide rate'
      }
    });
  }
};

/**
 * Get all guide rates with optional filters
 * GET /api/guide-rates?guide_id=1&city=Istanbul&season_name=Summer
 */
exports.getAllGuideRates = async (req, res) => {
  try {
    const { guide_id, city, season_name } = req.query;

    let queryText = 'SELECT * FROM guide_rates WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (guide_id) {
      queryText += ` AND guide_id = $${paramCount}`;
      params.push(guide_id);
      paramCount++;
    }

    if (city) {
      queryText += ` AND city = $${paramCount}`;
      params.push(city);
      paramCount++;
    }

    if (season_name) {
      queryText += ` AND season_name = $${paramCount}`;
      params.push(season_name);
      paramCount++;
    }

    queryText += ' ORDER BY start_date DESC';

    const result = await query(queryText, params);

    const guideRates = result.rows.map(rate => ({
      ...rate,
      start_date: formatDate(rate.start_date),
      end_date: formatDate(rate.end_date),
      created_at: formatDateTime(rate.created_at),
      updated_at: formatDateTime(rate.updated_at)
    }));

    res.json({
      success: true,
      count: guideRates.length,
      data: guideRates
    });
  } catch (error) {
    console.error('Get all guide rates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch guide rates'
      }
    });
  }
};

/**
 * Get single guide rate by ID
 * GET /api/guide-rates/:id
 */
exports.getGuideRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM guide_rates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide rate not found'
        }
      });
    }

    const guideRate = result.rows[0];

    guideRate.start_date = formatDate(guideRate.start_date);
    guideRate.end_date = formatDate(guideRate.end_date);
    guideRate.created_at = formatDateTime(guideRate.created_at);
    guideRate.updated_at = formatDateTime(guideRate.updated_at);

    res.json({
      success: true,
      data: guideRate
    });
  } catch (error) {
    console.error('Get guide rate by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch guide rate'
      }
    });
  }
};

/**
 * Update guide rate
 * PUT /api/guide-rates/:id
 */
exports.updateGuideRate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      guide_id,
      guide_name,
      city,
      season_name,
      start_date,
      end_date,
      currency,
      daily_rate,
      night_rate,
      transfer_rate,
      package_rate_per_day,
      notes
    } = req.body;

    // Check if guide rate exists
    const checkResult = await query(
      'SELECT * FROM guide_rates WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide rate not found'
        }
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (guide_id !== undefined) {
      updates.push(`guide_id = $${paramCount}`);
      params.push(guide_id);
      paramCount++;
    }
    if (guide_name !== undefined) {
      updates.push(`guide_name = $${paramCount}`);
      params.push(guide_name);
      paramCount++;
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCount}`);
      params.push(city);
      paramCount++;
    }
    if (season_name !== undefined) {
      updates.push(`season_name = $${paramCount}`);
      params.push(season_name);
      paramCount++;
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      params.push(start_date);
      paramCount++;
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      params.push(end_date);
      paramCount++;
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramCount}`);
      params.push(currency);
      paramCount++;
    }
    if (daily_rate !== undefined) {
      updates.push(`daily_rate = $${paramCount}`);
      params.push(daily_rate);
      paramCount++;
    }
    if (night_rate !== undefined) {
      updates.push(`night_rate = $${paramCount}`);
      params.push(night_rate);
      paramCount++;
    }
    if (transfer_rate !== undefined) {
      updates.push(`transfer_rate = $${paramCount}`);
      params.push(transfer_rate);
      paramCount++;
    }
    if (package_rate_per_day !== undefined) {
      updates.push(`package_rate_per_day = $${paramCount}`);
      params.push(package_rate_per_day);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
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

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add id to params
    params.push(id);

    const result = await query(
      `UPDATE guide_rates SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    const guideRate = result.rows[0];

    guideRate.start_date = formatDate(guideRate.start_date);
    guideRate.end_date = formatDate(guideRate.end_date);
    guideRate.created_at = formatDateTime(guideRate.created_at);
    guideRate.updated_at = formatDateTime(guideRate.updated_at);

    res.json({
      success: true,
      message: 'Guide rate updated successfully',
      data: guideRate
    });
  } catch (error) {
    console.error('Update guide rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update guide rate'
      }
    });
  }
};

/**
 * Delete guide rate
 * DELETE /api/guide-rates/:id
 */
exports.deleteGuideRate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if guide rate exists
    const checkResult = await query(
      'SELECT * FROM guide_rates WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide rate not found'
        }
      });
    }

    await query(
      'DELETE FROM guide_rates WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Guide rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete guide rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete guide rate'
      }
    });
  }
};
