const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all tour rates with filtering and pagination
 * GET /api/tour-rates
 */
exports.getAllTourRates = async (req, res) => {
  try {
    const {
      supplier_id,
      city,
      tour_code,
      season_name,
      page = 1,
      limit = 100
    } = req.query;

    let sqlQuery = `
      SELECT
        tr.id,
        tr.tour_code,
        tr.tour_name,
        tr.supplier_id,
        tr.supplier_name,
        tr.city,
        tr.season_name,
        tr.start_date,
        tr.end_date,
        tr.currency,
        tr.sic_rate,
        tr.private_2pax_rate,
        tr.private_4pax_rate,
        tr.private_6pax_rate,
        tr.private_8pax_rate,
        tr.private_10pax_rate,
        tr.notes,
        tr.created_at
      FROM tour_rates tr
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by supplier
    if (supplier_id) {
      sqlQuery += ` AND tr.supplier_id = $${paramIndex}`;
      params.push(supplier_id);
      paramIndex++;
    }

    // Filter by city
    if (city) {
      sqlQuery += ` AND tr.city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }

    // Filter by tour code
    if (tour_code) {
      sqlQuery += ` AND tr.tour_code ILIKE $${paramIndex}`;
      params.push(`%${tour_code}%`);
      paramIndex++;
    }

    // Filter by season
    if (season_name) {
      sqlQuery += ` AND tr.season_name ILIKE $${paramIndex}`;
      params.push(`%${season_name}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = sqlQuery.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    sqlQuery += ` ORDER BY tr.tour_code, tr.season_name, tr.start_date`;

    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await query(sqlQuery, params);

    // Format dates
    const rates = result.rows.map(rate => ({
      ...rate,
      start_date: rate.start_date?.toISOString().split('T')[0],
      end_date: rate.end_date?.toISOString().split('T')[0],
      created_at: formatDateTime(rate.created_at)
    }));

    res.json({
      success: true,
      data: rates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Get tour rates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour rates'
      }
    });
  }
};

/**
 * Get single tour rate by ID
 * GET /api/tour-rates/:id
 */
exports.getTourRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM tour_rates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour rate not found'
        }
      });
    }

    const rate = result.rows[0];
    rate.start_date = rate.start_date?.toISOString().split('T')[0];
    rate.end_date = rate.end_date?.toISOString().split('T')[0];
    rate.created_at = formatDateTime(rate.created_at);

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Get tour rate by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour rate'
      }
    });
  }
};

/**
 * Create new tour rate
 * POST /api/tour-rates
 */
exports.createTourRate = async (req, res) => {
  try {
    const {
      tour_code,
      tour_name,
      supplier_id,
      supplier_name,
      city,
      season_name,
      start_date,
      end_date,
      currency = 'EUR',
      sic_rate,
      private_2pax_rate,
      private_4pax_rate,
      private_6pax_rate,
      private_8pax_rate,
      private_10pax_rate,
      notes
    } = req.body;

    // Validation
    if (!tour_code || !tour_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tour code and tour name are required'
        }
      });
    }

    if (!supplier_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Supplier is required'
        }
      });
    }

    if (!season_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Season name, start date, and end date are required'
        }
      });
    }

    // Validate at least one rate is provided
    const hasRate = sic_rate || private_2pax_rate || private_4pax_rate ||
                    private_6pax_rate || private_8pax_rate || private_10pax_rate;

    if (!hasRate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one rate must be specified'
        }
      });
    }

    // Check for duplicate
    const duplicateCheck = await query(
      `SELECT id FROM tour_rates
       WHERE tour_code = $1 AND supplier_id = $2
       AND season_name = $3 AND start_date = $4 AND end_date = $5`,
      [tour_code, supplier_id, season_name, start_date, end_date]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A rate already exists for this tour, supplier, and season combination'
        }
      });
    }

    // Insert new tour rate
    const result = await query(
      `INSERT INTO tour_rates
       (tour_code, tour_name, supplier_id, supplier_name, city, season_name,
        start_date, end_date, currency, sic_rate, private_2pax_rate,
        private_4pax_rate, private_6pax_rate, private_8pax_rate,
        private_10pax_rate, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [tour_code, tour_name, supplier_id, supplier_name, city, season_name,
       start_date, end_date, currency, sic_rate, private_2pax_rate,
       private_4pax_rate, private_6pax_rate, private_8pax_rate,
       private_10pax_rate, notes]
    );

    const rate = result.rows[0];
    rate.start_date = rate.start_date?.toISOString().split('T')[0];
    rate.end_date = rate.end_date?.toISOString().split('T')[0];
    rate.created_at = formatDateTime(rate.created_at);

    res.status(201).json({
      success: true,
      message: 'Tour rate created successfully',
      data: rate
    });
  } catch (error) {
    console.error('Create tour rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create tour rate'
      }
    });
  }
};

/**
 * Update tour rate
 * PUT /api/tour-rates/:id
 */
exports.updateTourRate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tour_code,
      tour_name,
      supplier_id,
      supplier_name,
      city,
      season_name,
      start_date,
      end_date,
      currency,
      sic_rate,
      private_2pax_rate,
      private_4pax_rate,
      private_6pax_rate,
      private_8pax_rate,
      private_10pax_rate,
      notes
    } = req.body;

    // Check if tour rate exists
    const existingRate = await query(
      'SELECT * FROM tour_rates WHERE id = $1',
      [id]
    );

    if (existingRate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour rate not found'
        }
      });
    }

    // Validation
    if (!tour_code || !tour_name || !supplier_id || !season_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All required fields must be provided'
        }
      });
    }

    // Check for duplicate (excluding current record)
    const duplicateCheck = await query(
      `SELECT id FROM tour_rates
       WHERE tour_code = $1 AND supplier_id = $2
       AND season_name = $3 AND start_date = $4 AND end_date = $5
       AND id != $6`,
      [tour_code, supplier_id, season_name, start_date, end_date, id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Another rate already exists for this tour, supplier, and season combination'
        }
      });
    }

    // Update tour rate
    const result = await query(
      `UPDATE tour_rates
       SET tour_code = $1,
           tour_name = $2,
           supplier_id = $3,
           supplier_name = $4,
           city = $5,
           season_name = $6,
           start_date = $7,
           end_date = $8,
           currency = $9,
           sic_rate = $10,
           private_2pax_rate = $11,
           private_4pax_rate = $12,
           private_6pax_rate = $13,
           private_8pax_rate = $14,
           private_10pax_rate = $15,
           notes = $16,
           updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [tour_code, tour_name, supplier_id, supplier_name, city, season_name,
       start_date, end_date, currency, sic_rate, private_2pax_rate,
       private_4pax_rate, private_6pax_rate, private_8pax_rate,
       private_10pax_rate, notes, id]
    );

    const rate = result.rows[0];
    rate.start_date = rate.start_date?.toISOString().split('T')[0];
    rate.end_date = rate.end_date?.toISOString().split('T')[0];
    rate.created_at = formatDateTime(rate.created_at);

    res.json({
      success: true,
      message: 'Tour rate updated successfully',
      data: rate
    });
  } catch (error) {
    console.error('Update tour rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update tour rate'
      }
    });
  }
};

/**
 * Delete tour rate
 * DELETE /api/tour-rates/:id
 */
exports.deleteTourRate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tour rate exists
    const existingRate = await query(
      'SELECT * FROM tour_rates WHERE id = $1',
      [id]
    );

    if (existingRate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour rate not found'
        }
      });
    }

    // Delete the rate
    await query('DELETE FROM tour_rates WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Tour rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete tour rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete tour rate'
      }
    });
  }
};
