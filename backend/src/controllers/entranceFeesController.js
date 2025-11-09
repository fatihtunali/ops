const { query } = require('../config/database');
const { formatDate, formatDateTime } = require('../utils/formatters');

/**
 * Create a new entrance fee
 * POST /api/entrance-fees
 */
exports.createEntranceFee = async (req, res) => {
  try {
    const {
      attraction_name,
      city,
      season_name,
      start_date,
      end_date,
      currency = 'EUR',
      adult_rate,
      child_rate,
      notes
    } = req.body;

    // Validation
    if (!attraction_name || !city || !season_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Attraction name, city, season name, start date, and end date are required'
        }
      });
    }

    if (!adult_rate || !child_rate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Adult rate and child rate are required'
        }
      });
    }

    // Check for duplicate fees
    const duplicateCheck = await query(
      `SELECT id FROM entrance_fees
       WHERE attraction_name = $1 AND city = $2 AND season_name = $3
       AND start_date = $4 AND end_date = $5`,
      [attraction_name, city, season_name, start_date, end_date]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'An entrance fee already exists for this attraction, city, season, and date range'
        }
      });
    }

    // Insert entrance fee
    const result = await query(
      `INSERT INTO entrance_fees
       (attraction_name, city, season_name, start_date, end_date, currency,
        adult_rate, child_rate, notes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING *`,
      [attraction_name, city, season_name, start_date, end_date, currency,
       adult_rate, child_rate, notes]
    );

    const entranceFee = result.rows[0];

    // Format dates
    entranceFee.start_date = formatDate(entranceFee.start_date);
    entranceFee.end_date = formatDate(entranceFee.end_date);
    entranceFee.created_at = formatDateTime(entranceFee.created_at);
    entranceFee.updated_at = formatDateTime(entranceFee.updated_at);

    res.status(201).json({
      success: true,
      message: 'Entrance fee created successfully',
      data: entranceFee
    });
  } catch (error) {
    console.error('Create entrance fee error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create entrance fee'
      }
    });
  }
};

/**
 * Get all entrance fees with optional filters
 * GET /api/entrance-fees?city=Istanbul&season_name=Summer&is_active=true
 */
exports.getAllEntranceFees = async (req, res) => {
  try {
    const { city, season_name, attraction_name, is_active } = req.query;

    let queryText = 'SELECT * FROM entrance_fees WHERE 1=1';
    const params = [];
    let paramCount = 1;

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

    if (attraction_name) {
      queryText += ` AND attraction_name ILIKE $${paramCount}`;
      params.push(`%${attraction_name}%`);
      paramCount++;
    }

    if (is_active !== undefined) {
      queryText += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    queryText += ' ORDER BY attraction_name, start_date DESC';

    const result = await query(queryText, params);

    const entranceFees = result.rows.map(fee => ({
      ...fee,
      start_date: formatDate(fee.start_date),
      end_date: formatDate(fee.end_date),
      created_at: formatDateTime(fee.created_at),
      updated_at: formatDateTime(fee.updated_at)
    }));

    console.log('📊 Entrance fees found:', entranceFees.length);

    res.json({
      success: true,
      count: entranceFees.length,
      data: entranceFees
    });
  } catch (error) {
    console.error('Get all entrance fees error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch entrance fees'
      }
    });
  }
};

/**
 * Get single entrance fee by ID
 * GET /api/entrance-fees/:id
 */
exports.getEntranceFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM entrance_fees WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrance fee not found'
        }
      });
    }

    const entranceFee = result.rows[0];

    entranceFee.start_date = formatDate(entranceFee.start_date);
    entranceFee.end_date = formatDate(entranceFee.end_date);
    entranceFee.created_at = formatDateTime(entranceFee.created_at);
    entranceFee.updated_at = formatDateTime(entranceFee.updated_at);

    res.json({
      success: true,
      data: entranceFee
    });
  } catch (error) {
    console.error('Get entrance fee by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch entrance fee'
      }
    });
  }
};

/**
 * Update entrance fee
 * PUT /api/entrance-fees/:id
 */
exports.updateEntranceFee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      attraction_name,
      city,
      season_name,
      start_date,
      end_date,
      currency,
      adult_rate,
      child_rate,
      notes,
      is_active
    } = req.body;

    // Check if entrance fee exists
    const checkResult = await query(
      'SELECT * FROM entrance_fees WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrance fee not found'
        }
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (attraction_name !== undefined) {
      updates.push(`attraction_name = $${paramCount}`);
      params.push(attraction_name);
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
    if (adult_rate !== undefined) {
      updates.push(`adult_rate = $${paramCount}`);
      params.push(adult_rate);
      paramCount++;
    }
    if (child_rate !== undefined) {
      updates.push(`child_rate = $${paramCount}`);
      params.push(child_rate);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
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
      `UPDATE entrance_fees SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    const entranceFee = result.rows[0];

    entranceFee.start_date = formatDate(entranceFee.start_date);
    entranceFee.end_date = formatDate(entranceFee.end_date);
    entranceFee.created_at = formatDateTime(entranceFee.created_at);
    entranceFee.updated_at = formatDateTime(entranceFee.updated_at);

    res.json({
      success: true,
      message: 'Entrance fee updated successfully',
      data: entranceFee
    });
  } catch (error) {
    console.error('Update entrance fee error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update entrance fee'
      }
    });
  }
};

/**
 * Delete entrance fee (soft delete - sets is_active to false)
 * DELETE /api/entrance-fees/:id
 */
exports.deleteEntranceFee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entrance fee exists
    const checkResult = await query(
      'SELECT * FROM entrance_fees WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Entrance fee not found'
        }
      });
    }

    // Soft delete by setting is_active to false
    await query(
      'UPDATE entrance_fees SET is_active = false, updated_at = NOW() WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Entrance fee deactivated successfully'
    });
  } catch (error) {
    console.error('Delete entrance fee error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete entrance fee'
      }
    });
  }
};

/**
 * Get distinct cities from entrance fees
 * GET /api/entrance-fees/cities
 */
exports.getCities = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT city
      FROM entrance_fees
      WHERE city IS NOT NULL AND city != '' AND is_active = true
      ORDER BY city
    `);

    const cities = result.rows.map(row => row.city);

    res.json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch cities'
      }
    });
  }
};
