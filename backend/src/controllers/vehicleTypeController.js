const { query } = require('../config/database');

/**
 * Get all vehicle types
 * GET /api/vehicle-types
 */
exports.getAllVehicleTypes = async (req, res) => {
  try {
    const result = await query(
      `SELECT
        id,
        name,
        max_capacity,
        description,
        is_active
       FROM vehicle_types
       WHERE is_active = true
       ORDER BY max_capacity ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all vehicle types error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicle types'
      }
    });
  }
};

/**
 * Get single vehicle type by ID
 * GET /api/vehicle-types/:id
 */
exports.getVehicleTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        name,
        max_capacity,
        description,
        is_active,
        created_at
       FROM vehicle_types
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vehicle type not found'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get vehicle type by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch vehicle type'
      }
    });
  }
};
