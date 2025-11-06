const { query } = require('../config/database');
const { formatDateTime, formatCurrency, formatRowDates } = require('../utils/formatters');

/**
 * Create a new guide
 * POST /api/guides
 */
exports.createGuide = async (req, res) => {
  try {
    const {
      name,
      phone,
      languages,
      daily_rate,
      specialization,
      availability_status = 'available',
      notes
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name is required'
        }
      });
    }

    // Validate availability_status
    const validStatuses = ['available', 'busy', 'inactive'];
    if (availability_status && !validStatuses.includes(availability_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid availability status. Must be: available, busy, or inactive'
        }
      });
    }

    // Insert guide
    const result = await query(
      `INSERT INTO guides (name, phone, languages, daily_rate, specialization, availability_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, phone, languages, daily_rate, specialization, availability_status, notes]
    );

    const guide = result.rows[0];

    // Format dates
    guide.created_at = formatDateTime(guide.created_at);

    res.status(201).json({
      success: true,
      message: 'Guide created successfully',
      data: guide
    });
  } catch (error) {
    console.error('Create guide error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create guide'
      }
    });
  }
};

/**
 * Get all guides with optional filters
 * GET /api/guides?availability_status=available&languages=English
 */
exports.getAllGuides = async (req, res) => {
  try {
    const { availability_status, languages } = req.query;

    let queryText = 'SELECT * FROM guides WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Filter by availability_status
    if (availability_status) {
      queryText += ` AND availability_status = $${paramCount}`;
      params.push(availability_status);
      paramCount++;
    }

    // Filter by languages (contains search)
    if (languages) {
      queryText += ` AND LOWER(languages) LIKE LOWER($${paramCount})`;
      params.push(`%${languages}%`);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    // Format dates for all guides
    const guides = result.rows.map(guide => ({
      ...guide,
      created_at: formatDateTime(guide.created_at)
    }));

    res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    console.error('Get all guides error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch guides'
      }
    });
  }
};

/**
 * Get available guides only
 * GET /api/guides/available
 */
exports.getAvailableGuides = async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM guides
       WHERE availability_status = 'available'
       ORDER BY name ASC`
    );

    // Format dates for all guides
    const guides = result.rows.map(guide => ({
      ...guide,
      created_at: formatDateTime(guide.created_at)
    }));

    res.json({
      success: true,
      count: guides.length,
      data: guides
    });
  } catch (error) {
    console.error('Get available guides error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch available guides'
      }
    });
  }
};

/**
 * Get single guide by ID
 * GET /api/guides/:id
 */
exports.getGuideById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM guides WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide not found'
        }
      });
    }

    const guide = result.rows[0];

    // Format dates
    guide.created_at = formatDateTime(guide.created_at);

    res.json({
      success: true,
      data: guide
    });
  } catch (error) {
    console.error('Get guide by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch guide'
      }
    });
  }
};

/**
 * Update guide
 * PUT /api/guides/:id
 */
exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      languages,
      daily_rate,
      specialization,
      availability_status,
      notes
    } = req.body;

    // Check if guide exists
    const checkResult = await query(
      'SELECT * FROM guides WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide not found'
        }
      });
    }

    // Validate availability_status if provided
    if (availability_status) {
      const validStatuses = ['available', 'busy', 'inactive'];
      if (!validStatuses.includes(availability_status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid availability status. Must be: available, busy, or inactive'
          }
        });
      }
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
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      params.push(phone);
      paramCount++;
    }
    if (languages !== undefined) {
      updates.push(`languages = $${paramCount}`);
      params.push(languages);
      paramCount++;
    }
    if (daily_rate !== undefined) {
      updates.push(`daily_rate = $${paramCount}`);
      params.push(daily_rate);
      paramCount++;
    }
    if (specialization !== undefined) {
      updates.push(`specialization = $${paramCount}`);
      params.push(specialization);
      paramCount++;
    }
    if (availability_status !== undefined) {
      updates.push(`availability_status = $${paramCount}`);
      params.push(availability_status);
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

    // Add id to params
    params.push(id);

    const result = await query(
      `UPDATE guides SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    const guide = result.rows[0];

    // Format dates
    guide.created_at = formatDateTime(guide.created_at);

    res.json({
      success: true,
      message: 'Guide updated successfully',
      data: guide
    });
  } catch (error) {
    console.error('Update guide error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update guide'
      }
    });
  }
};

/**
 * Soft delete guide (set availability_status to inactive)
 * DELETE /api/guides/:id
 */
exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if guide exists
    const checkResult = await query(
      'SELECT * FROM guides WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Guide not found'
        }
      });
    }

    // Soft delete - set availability_status to 'inactive'
    const result = await query(
      `UPDATE guides SET availability_status = 'inactive' WHERE id = $1 RETURNING *`,
      [id]
    );

    const guide = result.rows[0];

    // Format dates
    guide.created_at = formatDateTime(guide.created_at);

    res.json({
      success: true,
      message: 'Guide deleted successfully (soft delete)',
      data: guide
    });
  } catch (error) {
    console.error('Delete guide error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete guide'
      }
    });
  }
};
