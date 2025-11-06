const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all vehicles with optional filters
 * GET /api/vehicles
 * Query params: status, type
 */
exports.getAllVehicles = async (req, res) => {
  try {
    const { status, type } = req.query;

    let sqlQuery = `
      SELECT id, vehicle_number, type, capacity, daily_rate,
             driver_name, driver_phone, status, notes, created_at
      FROM vehicles
      WHERE status != 'inactive'
    `;
    const params = [];
    let paramCount = 1;

    // Filter by status
    if (status) {
      sqlQuery += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter by type
    if (type) {
      sqlQuery += ` AND type ILIKE $${paramCount}`;
      params.push(`%${type}%`);
      paramCount++;
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const result = await query(sqlQuery, params);

    // Format dates and convert decimal to number
    const vehicles = result.rows.map(vehicle => ({
      ...vehicle,
      daily_rate: vehicle.daily_rate ? parseFloat(vehicle.daily_rate) : null,
      created_at: formatDateTime(vehicle.created_at)
    }));

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicles'
      }
    });
  }
};

/**
 * Get available vehicles only
 * GET /api/vehicles/available
 */
exports.getAvailableVehicles = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, vehicle_number, type, capacity, daily_rate,
              driver_name, driver_phone, status, notes, created_at
       FROM vehicles
       WHERE status = 'available'
       ORDER BY type, vehicle_number`,
      []
    );

    // Format dates and convert decimal to number
    const vehicles = result.rows.map(vehicle => ({
      ...vehicle,
      daily_rate: vehicle.daily_rate ? parseFloat(vehicle.daily_rate) : null,
      created_at: formatDateTime(vehicle.created_at)
    }));

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Get available vehicles error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch available vehicles'
      }
    });
  }
};

/**
 * Get single vehicle by ID
 * GET /api/vehicles/:id
 */
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, vehicle_number, type, capacity, daily_rate,
              driver_name, driver_phone, status, notes, created_at
       FROM vehicles
       WHERE id = $1 AND status != 'inactive'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle not found'
        }
      });
    }

    const vehicle = result.rows[0];
    vehicle.daily_rate = vehicle.daily_rate ? parseFloat(vehicle.daily_rate) : null;
    vehicle.created_at = formatDateTime(vehicle.created_at);

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicle'
      }
    });
  }
};

/**
 * Create new vehicle
 * POST /api/vehicles
 */
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicle_number,
      type,
      capacity,
      daily_rate,
      driver_name,
      driver_phone,
      status,
      notes
    } = req.body;

    // Validation
    if (!vehicle_number) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Vehicle number is required'
        }
      });
    }

    // Validate status if provided
    if (status && !['available', 'in_use', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be: available, in_use, maintenance, or inactive'
        }
      });
    }

    // Check if vehicle_number already exists
    const existingVehicle = await query(
      'SELECT id FROM vehicles WHERE vehicle_number = $1',
      [vehicle_number]
    );

    if (existingVehicle.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Vehicle number already exists'
        }
      });
    }

    // Insert new vehicle
    const result = await query(
      `INSERT INTO vehicles (
        vehicle_number, type, capacity, daily_rate,
        driver_name, driver_phone, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, vehicle_number, type, capacity, daily_rate,
                driver_name, driver_phone, status, notes, created_at`,
      [
        vehicle_number,
        type || null,
        capacity || null,
        daily_rate || null,
        driver_name || null,
        driver_phone || null,
        status || 'available',
        notes || null
      ]
    );

    const newVehicle = result.rows[0];
    newVehicle.daily_rate = newVehicle.daily_rate ? parseFloat(newVehicle.daily_rate) : null;
    newVehicle.created_at = formatDateTime(newVehicle.created_at);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: newVehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Vehicle number already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create vehicle'
      }
    });
  }
};

/**
 * Update vehicle
 * PUT /api/vehicles/:id
 */
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicle_number,
      type,
      capacity,
      daily_rate,
      driver_name,
      driver_phone,
      status,
      notes
    } = req.body;

    // Validate status if provided
    if (status && !['available', 'in_use', 'maintenance', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status. Must be: available, in_use, maintenance, or inactive'
        }
      });
    }

    // Check if vehicle exists
    const existingVehicle = await query(
      'SELECT id FROM vehicles WHERE id = $1 AND status != $2',
      [id, 'inactive']
    );

    if (existingVehicle.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle not found'
        }
      });
    }

    // Check if vehicle_number is being changed and if new number already exists
    if (vehicle_number) {
      const duplicateVehicle = await query(
        'SELECT id FROM vehicles WHERE vehicle_number = $1 AND id != $2',
        [vehicle_number, id]
      );

      if (duplicateVehicle.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'Vehicle number already exists'
          }
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (vehicle_number !== undefined) {
      updateFields.push(`vehicle_number = $${paramCount}`);
      params.push(vehicle_number);
      paramCount++;
    }
    if (type !== undefined) {
      updateFields.push(`type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }
    if (capacity !== undefined) {
      updateFields.push(`capacity = $${paramCount}`);
      params.push(capacity);
      paramCount++;
    }
    if (daily_rate !== undefined) {
      updateFields.push(`daily_rate = $${paramCount}`);
      params.push(daily_rate);
      paramCount++;
    }
    if (driver_name !== undefined) {
      updateFields.push(`driver_name = $${paramCount}`);
      params.push(driver_name);
      paramCount++;
    }
    if (driver_phone !== undefined) {
      updateFields.push(`driver_phone = $${paramCount}`);
      params.push(driver_phone);
      paramCount++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No fields to update'
        }
      });
    }

    // Add ID parameter
    params.push(id);

    const result = await query(
      `UPDATE vehicles
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, vehicle_number, type, capacity, daily_rate,
                 driver_name, driver_phone, status, notes, created_at`,
      params
    );

    const updatedVehicle = result.rows[0];
    updatedVehicle.daily_rate = updatedVehicle.daily_rate ? parseFloat(updatedVehicle.daily_rate) : null;
    updatedVehicle.created_at = formatDateTime(updatedVehicle.created_at);

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Vehicle number already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update vehicle'
      }
    });
  }
};

/**
 * Delete vehicle (soft delete - set status to inactive)
 * DELETE /api/vehicles/:id
 */
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
    const existingVehicle = await query(
      'SELECT id, status FROM vehicles WHERE id = $1',
      [id]
    );

    if (existingVehicle.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle not found'
        }
      });
    }

    if (existingVehicle.rows[0].status === 'inactive') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_DELETED',
          message: 'Vehicle already deleted'
        }
      });
    }

    // Soft delete - set status to inactive
    await query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      ['inactive', id]
    );

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete vehicle'
      }
    });
  }
};
