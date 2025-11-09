const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all tour suppliers
 * GET /api/tour-suppliers
 */
exports.getAllTourSuppliers = async (req, res) => {
  try {
    const { status, search, city, page = 1, limit = 10 } = req.query;

    let sqlQuery = `
      SELECT * FROM tour_suppliers
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by status
    if (status) {
      sqlQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Filter by city (service_areas)
    if (city) {
      sqlQuery += ` AND service_areas ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }

    // Search functionality
    if (search) {
      sqlQuery += ` AND (
        name ILIKE $${paramIndex} OR
        contact_person ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex} OR
        phone ILIKE $${paramIndex} OR
        services_offered ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countResult = await query(
      sqlQuery.replace('SELECT *', 'SELECT COUNT(*)'),
      params
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    sqlQuery += ` ORDER BY created_at DESC`;

    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await query(sqlQuery, params);

    // Format dates
    const suppliers = result.rows.map(supplier => ({
      ...supplier,
      created_at: formatDateTime(supplier.created_at)
    }));

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Get all tour suppliers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour suppliers'
      }
    });
  }
};

/**
 * Get single tour supplier by ID
 * GET /api/tour-suppliers/:id
 */
exports.getTourSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM tour_suppliers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour supplier not found'
        }
      });
    }

    const supplier = result.rows[0];
    supplier.created_at = formatDateTime(supplier.created_at);

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Get tour supplier by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour supplier'
      }
    });
  }
};

/**
 * Create new tour supplier
 * POST /api/tour-suppliers
 */
exports.createTourSupplier = async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      services_offered,
      service_areas,
      payment_terms,
      notes,
      status = 'active'
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tour supplier name is required'
        }
      });
    }

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either active or inactive'
        }
      });
    }

    // Check if tour supplier with same name already exists
    const existingSupplier = await query(
      'SELECT id FROM tour_suppliers WHERE name = $1',
      [name]
    );

    if (existingSupplier.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Tour supplier with this name already exists'
        }
      });
    }

    // Insert new tour supplier
    const result = await query(
      `INSERT INTO tour_suppliers
       (name, contact_person, email, phone, services_offered, service_areas, payment_terms, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, contact_person, email, phone, services_offered, service_areas, payment_terms, notes, status]
    );

    const supplier = result.rows[0];
    supplier.created_at = formatDateTime(supplier.created_at);

    res.status(201).json({
      success: true,
      message: 'Tour supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Create tour supplier error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create tour supplier'
      }
    });
  }
};

/**
 * Update tour supplier
 * PUT /api/tour-suppliers/:id
 */
exports.updateTourSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact_person,
      email,
      phone,
      services_offered,
      service_areas,
      payment_terms,
      notes,
      status
    } = req.body;

    // Check if tour supplier exists
    const existingSupplier = await query(
      'SELECT * FROM tour_suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour supplier not found'
        }
      });
    }

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tour supplier name is required'
        }
      });
    }

    // Validate status
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either active or inactive'
        }
      });
    }

    // Check if another tour supplier with same name exists
    const duplicateSupplier = await query(
      'SELECT id FROM tour_suppliers WHERE name = $1 AND id != $2',
      [name, id]
    );

    if (duplicateSupplier.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Another tour supplier with this name already exists'
        }
      });
    }

    // Update tour supplier
    const result = await query(
      `UPDATE tour_suppliers
       SET name = $1,
           contact_person = $2,
           email = $3,
           phone = $4,
           services_offered = $5,
           service_areas = $6,
           payment_terms = $7,
           notes = $8,
           status = $9
       WHERE id = $10
       RETURNING *`,
      [name, contact_person, email, phone, services_offered, service_areas, payment_terms, notes, status, id]
    );

    const supplier = result.rows[0];
    supplier.created_at = formatDateTime(supplier.created_at);

    res.json({
      success: true,
      message: 'Tour supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update tour supplier error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update tour supplier'
      }
    });
  }
};

/**
 * Delete tour supplier (hard delete - permanently remove from database)
 * DELETE /api/tour-suppliers/:id
 */
exports.deleteTourSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tour supplier exists
    const existingSupplier = await query(
      'SELECT * FROM tour_suppliers WHERE id = $1',
      [id]
    );

    if (existingSupplier.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tour supplier not found'
        }
      });
    }

    // Check if supplier is used in vehicle rates
    const vehicleRateCheck = await query(
      'SELECT COUNT(*) FROM vehicle_rates WHERE supplier_id = $1',
      [id]
    );

    const vehicleRateCount = parseInt(vehicleRateCheck.rows[0].count);
    if (vehicleRateCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFERENTIAL_INTEGRITY_ERROR',
          message: 'Cannot delete supplier that is referenced in rates or bookings. Please delete the related records first.'
        }
      });
    }

    // Check if supplier is used in booking tours
    const bookingTourCheck = await query(
      'SELECT COUNT(*) FROM booking_tours WHERE supplier_id = $1',
      [id]
    );

    const bookingTourCount = parseInt(bookingTourCheck.rows[0].count);
    if (bookingTourCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFERENTIAL_INTEGRITY_ERROR',
          message: 'Cannot delete supplier that is referenced in rates or bookings. Please delete the related records first.'
        }
      });
    }

    // Hard delete - permanently remove from database
    await query(
      'DELETE FROM tour_suppliers WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Tour supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete tour supplier error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete tour supplier'
      }
    });
  }
};

/**
 * Get tour supplier statistics
 * GET /api/tour-suppliers/stats/summary
 */
exports.getTourSupplierStats = async (req, res) => {
  try {
    // Get counts by status
    const statsResult = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive
      FROM tour_suppliers
    `);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        active: parseInt(stats.active),
        inactive: parseInt(stats.inactive)
      }
    });
  } catch (error) {
    console.error('Get tour supplier stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour supplier statistics'
      }
    });
  }
};

/**
 * Get distinct cities from tour suppliers service_areas
 * GET /api/tour-suppliers/cities
 */
exports.getTourSupplierCities = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT service_areas as city
      FROM tour_suppliers
      WHERE service_areas IS NOT NULL AND service_areas != ''
      ORDER BY service_areas
    `);

    const cities = result.rows.map(row => row.city);

    res.json({
      success: true,
      count: cities.length,
      data: cities
    });
  } catch (error) {
    console.error('Get tour supplier cities error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour supplier cities'
      }
    });
  }
};
