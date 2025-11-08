const { query } = require('../config/database');

/**
 * Get all vehicle rates with filters
 * GET /api/vehicle-rates
 * Query params: city, supplier_id, season_name, vehicle_type_id, date, is_active
 */
exports.getAllVehicleRates = async (req, res) => {
  try {
    const {
      city,
      supplier_id,
      season_name,
      vehicle_type_id,
      date, // Check if rate is active on this date
      is_active = 'true',
      page = 1,
      limit = 50
    } = req.query;

    let sqlQuery = `
      SELECT
        vr.id,
        vr.city,
        vr.supplier_id,
        vr.supplier_name,
        vr.season_name,
        vr.start_date,
        vr.end_date,
        vr.vehicle_type_id,
        vt.name as vehicle_type,
        vt.max_capacity,
        vr.currency,
        vr.full_day_price,
        vr.half_day_price,
        vr.airport_to_hotel,
        vr.hotel_to_airport,
        vr.round_trip,
        vr.notes,
        vr.is_active,
        vr.created_at
      FROM vehicle_rates vr
      JOIN vehicle_types vt ON vr.vehicle_type_id = vt.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by city
    if (city) {
      sqlQuery += ` AND vr.city = $${paramIndex}`;
      params.push(city);
      paramIndex++;
    }

    // Filter by supplier_id
    if (supplier_id) {
      sqlQuery += ` AND vr.supplier_id = $${paramIndex}`;
      params.push(supplier_id);
      paramIndex++;
    }

    // Filter by season_name
    if (season_name) {
      sqlQuery += ` AND vr.season_name = $${paramIndex}`;
      params.push(season_name);
      paramIndex++;
    }

    // Filter by vehicle_type_id
    if (vehicle_type_id) {
      sqlQuery += ` AND vr.vehicle_type_id = $${paramIndex}`;
      params.push(vehicle_type_id);
      paramIndex++;
    }

    // Filter by date (check if date is within start_date and end_date)
    if (date) {
      sqlQuery += ` AND $${paramIndex} BETWEEN vr.start_date AND vr.end_date`;
      params.push(date);
      paramIndex++;
    }

    // Filter by is_active
    if (is_active === 'true') {
      sqlQuery += ` AND vr.is_active = true`;
    }

    // Get total count
    const countResult = await query(
      sqlQuery.replace(/SELECT[\s\S]*FROM/, 'SELECT COUNT(*) FROM'),
      params
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    sqlQuery += ` ORDER BY vr.city, vr.supplier_name, vt.max_capacity`;

    const offset = (page - 1) * limit;
    sqlQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const result = await query(sqlQuery, params);

    // Format dates
    const vehicleRates = result.rows.map(rate => ({
      ...rate,
      start_date: rate.start_date ? rate.start_date.toISOString().split('T')[0] : null,
      end_date: rate.end_date ? rate.end_date.toISOString().split('T')[0] : null,
      full_day_price: rate.full_day_price ? parseFloat(rate.full_day_price) : null,
      half_day_price: rate.half_day_price ? parseFloat(rate.half_day_price) : null,
      airport_to_hotel: rate.airport_to_hotel ? parseFloat(rate.airport_to_hotel) : null,
      hotel_to_airport: rate.hotel_to_airport ? parseFloat(rate.hotel_to_airport) : null,
      round_trip: rate.round_trip ? parseFloat(rate.round_trip) : null
    }));

    res.json({
      success: true,
      data: vehicleRates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (error) {
    console.error('Get all vehicle rates error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicle rates'
      }
    });
  }
};

/**
 * Get list of cities with vehicle rates
 * GET /api/vehicle-rates/cities
 */
exports.getCities = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT city
      FROM vehicle_rates
      WHERE is_active = true
      ORDER BY city
    `);

    res.json({
      success: true,
      data: result.rows.map(row => row.city)
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

/**
 * Get suppliers for a specific city
 * GET /api/vehicle-rates/suppliers?city=Antalya
 */
exports.getSuppliersByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'City parameter is required'
        }
      });
    }

    const result = await query(`
      SELECT DISTINCT
        supplier_id,
        supplier_name
      FROM vehicle_rates
      WHERE city = $1 AND is_active = true
      ORDER BY supplier_name
    `, [city]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get suppliers by city error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch suppliers'
      }
    });
  }
};

/**
 * Get single vehicle rate by ID
 * GET /api/vehicle-rates/:id
 */
exports.getVehicleRateById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        vr.*,
        vt.name as vehicle_type,
        vt.max_capacity
      FROM vehicle_rates vr
      JOIN vehicle_types vt ON vr.vehicle_type_id = vt.id
      WHERE vr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle rate not found'
        }
      });
    }

    const rate = result.rows[0];
    rate.start_date = rate.start_date ? rate.start_date.toISOString().split('T')[0] : null;
    rate.end_date = rate.end_date ? rate.end_date.toISOString().split('T')[0] : null;
    rate.full_day_price = rate.full_day_price ? parseFloat(rate.full_day_price) : null;
    rate.half_day_price = rate.half_day_price ? parseFloat(rate.half_day_price) : null;
    rate.airport_to_hotel = rate.airport_to_hotel ? parseFloat(rate.airport_to_hotel) : null;
    rate.hotel_to_airport = rate.hotel_to_airport ? parseFloat(rate.hotel_to_airport) : null;
    rate.round_trip = rate.round_trip ? parseFloat(rate.round_trip) : null;

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('Get vehicle rate by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicle rate'
      }
    });
  }
};

/**
 * Create new vehicle rate
 * POST /api/vehicle-rates
 */
exports.createVehicleRate = async (req, res) => {
  try {
    const {
      city,
      supplier_id,
      supplier_name,
      season_name,
      start_date,
      end_date,
      vehicle_type_id,
      currency = 'EUR',
      full_day_price,
      half_day_price,
      airport_to_hotel,
      hotel_to_airport,
      round_trip,
      notes
    } = req.body;

    // Validation
    if (!city || !supplier_id || !supplier_name || !season_name || !start_date || !end_date || !vehicle_type_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Required fields: city, supplier_id, supplier_name, season_name, start_date, end_date, vehicle_type_id'
        }
      });
    }

    // Check if supplier exists
    const supplierExists = await query(
      'SELECT id FROM tour_suppliers WHERE id = $1',
      [supplier_id]
    );

    if (supplierExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }

    // Check if vehicle type exists
    const vehicleTypeExists = await query(
      'SELECT id FROM vehicle_types WHERE id = $1',
      [vehicle_type_id]
    );

    if (vehicleTypeExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle type not found'
        }
      });
    }

    // Insert new vehicle rate
    const result = await query(`
      INSERT INTO vehicle_rates (
        city, supplier_id, supplier_name, season_name, start_date, end_date,
        vehicle_type_id, currency,
        full_day_price, half_day_price, airport_to_hotel, hotel_to_airport, round_trip,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      city, supplier_id, supplier_name, season_name, start_date, end_date,
      vehicle_type_id, currency,
      full_day_price, half_day_price, airport_to_hotel, hotel_to_airport, round_trip,
      notes
    ]);

    const rate = result.rows[0];
    rate.start_date = rate.start_date ? rate.start_date.toISOString().split('T')[0] : null;
    rate.end_date = rate.end_date ? rate.end_date.toISOString().split('T')[0] : null;

    res.status(201).json({
      success: true,
      message: 'Vehicle rate created successfully',
      data: rate
    });
  } catch (error) {
    console.error('Create vehicle rate error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A rate already exists for this city, supplier, season, and vehicle type combination'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create vehicle rate'
      }
    });
  }
};

/**
 * Update vehicle rate
 * PUT /api/vehicle-rates/:id
 */
exports.updateVehicleRate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      city,
      supplier_id,
      supplier_name,
      season_name,
      start_date,
      end_date,
      vehicle_type_id,
      currency,
      full_day_price,
      half_day_price,
      airport_to_hotel,
      hotel_to_airport,
      round_trip,
      notes,
      is_active
    } = req.body;

    // Check if vehicle rate exists
    const existingRate = await query(
      'SELECT * FROM vehicle_rates WHERE id = $1',
      [id]
    );

    if (existingRate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle rate not found'
        }
      });
    }

    // Update vehicle rate
    const result = await query(`
      UPDATE vehicle_rates
      SET city = $1,
          supplier_id = $2,
          supplier_name = $3,
          season_name = $4,
          start_date = $5,
          end_date = $6,
          vehicle_type_id = $7,
          currency = $8,
          full_day_price = $9,
          half_day_price = $10,
          airport_to_hotel = $11,
          hotel_to_airport = $12,
          round_trip = $13,
          notes = $14,
          is_active = $15
      WHERE id = $16
      RETURNING *
    `, [
      city, supplier_id, supplier_name, season_name, start_date, end_date,
      vehicle_type_id, currency,
      full_day_price, half_day_price, airport_to_hotel, hotel_to_airport, round_trip,
      notes, is_active, id
    ]);

    const rate = result.rows[0];
    rate.start_date = rate.start_date ? rate.start_date.toISOString().split('T')[0] : null;
    rate.end_date = rate.end_date ? rate.end_date.toISOString().split('T')[0] : null;

    res.json({
      success: true,
      message: 'Vehicle rate updated successfully',
      data: rate
    });
  } catch (error) {
    console.error('Update vehicle rate error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A rate already exists for this city, supplier, season, and vehicle type combination'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update vehicle rate'
      }
    });
  }
};

/**
 * Delete vehicle rate
 * DELETE /api/vehicle-rates/:id
 */
exports.deleteVehicleRate = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle rate exists
    const existingRate = await query(
      'SELECT * FROM vehicle_rates WHERE id = $1',
      [id]
    );

    if (existingRate.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle rate not found'
        }
      });
    }

    // Soft delete (set is_active = false)
    await query('UPDATE vehicle_rates SET is_active = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Vehicle rate deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle rate error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete vehicle rate'
      }
    });
  }
};
