const { query } = require('../config/database');

/**
 * Get all cities
 * GET /api/cities
 */
exports.getAllCities = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, region
      FROM cities
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all cities error:', error);
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
 * Get cities by region
 * GET /api/cities/region/:region
 */
exports.getCitiesByRegion = async (req, res) => {
  try {
    const { region } = req.params;

    const result = await query(`
      SELECT id, name, region
      FROM cities
      WHERE region = $1
      ORDER BY name ASC
    `, [region]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get cities by region error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch cities by region'
      }
    });
  }
};

/**
 * Search cities by name
 * GET /api/cities/search?q=ankara
 */
exports.searchCities = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const result = await query(`
      SELECT id, name, region
      FROM cities
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT 10
    `, [`%${q}%`]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Search cities error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search cities'
      }
    });
  }
};
