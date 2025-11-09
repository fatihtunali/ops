const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all clients with filters
 * GET /api/clients
 */
exports.getAll = async (req, res) => {
  try {
    const { type, status, search } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        id,
        client_code,
        name,
        type,
        email,
        phone,
        address,
        commission_rate,
        notes,
        created_at,
        status
      FROM clients
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by type
    if (type && ['agent', 'direct'].includes(type)) {
      queryText += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    // Filter by status
    if (status) {
      queryText += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Search by name
    if (search) {
      queryText += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Order by created_at descending (newest first)
    queryText += ` ORDER BY created_at DESC`;

    const result = await query(queryText, params);

    // Format dates in results
    const clients = result.rows.map(client => ({
      ...client,
      created_at: formatDateTime(client.created_at),
      commission_rate: client.commission_rate ? parseFloat(client.commission_rate) : null
    }));

    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve clients'
      }
    });
  }
};

/**
 * Get single client by ID
 * GET /api/clients/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        client_code,
        name,
        type,
        email,
        phone,
        address,
        commission_rate,
        notes,
        created_at,
        status
      FROM clients
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    const client = result.rows[0];

    // Format dates
    client.created_at = formatDateTime(client.created_at);
    client.commission_rate = client.commission_rate ? parseFloat(client.commission_rate) : null;

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client'
      }
    });
  }
};

/**
 * Create new client
 * POST /api/clients
 */
exports.create = async (req, res) => {
  try {
    const {
      client_code,
      name,
      type,
      email,
      phone,
      address,
      commission_rate,
      notes,
      status
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client name is required'
        }
      });
    }

    if (!type || !['agent', 'direct'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid client type is required (agent or direct)'
        }
      });
    }

    // Check if client_code already exists (if provided)
    if (client_code) {
      const existingClient = await query(
        'SELECT id FROM clients WHERE client_code = $1',
        [client_code]
      );

      if (existingClient.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'Client code already exists'
          }
        });
      }
    }

    // Validate commission_rate for agents
    if (type === 'agent' && commission_rate !== null && commission_rate !== undefined) {
      const rate = parseFloat(commission_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Commission rate must be between 0 and 100'
          }
        });
      }
    }

    // Insert new client
    const result = await query(
      `INSERT INTO clients (
        client_code,
        name,
        type,
        email,
        phone,
        address,
        commission_rate,
        notes,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        client_code,
        name,
        type,
        email,
        phone,
        address,
        commission_rate,
        notes,
        created_at,
        status`,
      [
        client_code || null,
        name,
        type,
        email || null,
        phone || null,
        address || null,
        commission_rate || null,
        notes || null,
        status || 'active'
      ]
    );

    const newClient = result.rows[0];

    // Format dates
    newClient.created_at = formatDateTime(newClient.created_at);
    newClient.commission_rate = newClient.commission_rate ? parseFloat(newClient.commission_rate) : null;

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: newClient
    });
  } catch (error) {
    console.error('Create client error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Client code already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create client'
      }
    });
  }
};

/**
 * Update client
 * PUT /api/clients/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_code,
      name,
      type,
      email,
      phone,
      address,
      commission_rate,
      notes,
      status
    } = req.body;

    // Check if client exists
    const existingClient = await query(
      'SELECT id FROM clients WHERE id = $1',
      [id]
    );

    if (existingClient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Validation
    if (name && name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Client name cannot be empty'
        }
      });
    }

    if (type && !['agent', 'direct'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid client type is required (agent or direct)'
        }
      });
    }

    // Check if client_code already exists (if being updated and different)
    if (client_code) {
      const duplicateClient = await query(
        'SELECT id FROM clients WHERE client_code = $1 AND id != $2',
        [client_code, id]
      );

      if (duplicateClient.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'Client code already exists'
          }
        });
      }
    }

    // Validate commission_rate
    if (commission_rate !== null && commission_rate !== undefined) {
      const rate = parseFloat(commission_rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Commission rate must be between 0 and 100'
          }
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (client_code !== undefined) {
      updates.push(`client_code = $${paramCount}`);
      params.push(client_code || null);
      paramCount++;
    }

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (type !== undefined) {
      updates.push(`type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      params.push(email || null);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      params.push(phone || null);
      paramCount++;
    }

    if (address !== undefined) {
      updates.push(`address = $${paramCount}`);
      params.push(address || null);
      paramCount++;
    }

    if (commission_rate !== undefined) {
      updates.push(`commission_rate = $${paramCount}`);
      params.push(commission_rate || null);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes || null);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
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

    // Add id parameter
    params.push(id);

    const result = await query(
      `UPDATE clients
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         client_code,
         name,
         type,
         email,
         phone,
         address,
         commission_rate,
         notes,
         created_at,
         status`,
      params
    );

    const updatedClient = result.rows[0];

    // Format dates
    updatedClient.created_at = formatDateTime(updatedClient.created_at);
    updatedClient.commission_rate = updatedClient.commission_rate ? parseFloat(updatedClient.commission_rate) : null;

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Update client error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Client code already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update client'
      }
    });
  }
};

/**
 * Delete client (hard delete - permanently remove from database)
 * DELETE /api/clients/:id
 */
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const existingClient = await query(
      'SELECT id, status FROM clients WHERE id = $1',
      [id]
    );

    if (existingClient.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found'
        }
      });
    }

    // Check if client has any bookings (active or completed)
    const bookingCheck = await query(
      'SELECT COUNT(*) FROM bookings WHERE client_id = $1',
      [id]
    );

    const bookingCount = parseInt(bookingCheck.rows[0].count);
    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFERENTIAL_INTEGRITY_ERROR',
          message: 'Cannot delete client with existing bookings. Please delete the bookings first.'
        }
      });
    }

    // Hard delete - permanently remove from database
    await query(
      'DELETE FROM clients WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete client'
      }
    });
  }
};
