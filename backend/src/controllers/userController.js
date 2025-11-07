const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Controller
 * Handles user management (admin only)
 */

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let query = 'SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (status === 'active') {
      query += ' AND is_active = true';
    } else if (status === 'inactive') {
      query += ' AND is_active = false';
    }

    if (search) {
      paramCount++;
      query += ` AND (username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
        details: error.message
      }
    });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, username, email, full_name, role, is_active, created_at, last_login FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
        details: error.message
      }
    });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username, email, password, and full_name are required'
        }
      });
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'accountant'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Role must be one of: ${validRoles.join(', ')}`
        }
      });
    }

    // Check if username or email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Username or email already exists'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [username, email, hashedPassword, full_name, role || 'staff']
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user',
        details: error.message
      }
    });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, full_name, role, is_active } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'staff', 'accountant'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Role must be one of: ${validRoles.join(', ')}`
          }
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (username !== undefined) {
      paramCount++;
      updates.push(`username = $${paramCount}`);
      params.push(username);
    }
    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      params.push(email);
    }
    if (full_name !== undefined) {
      paramCount++;
      updates.push(`full_name = $${paramCount}`);
      params.push(full_name);
    }
    if (role !== undefined) {
      paramCount++;
      updates.push(`role = $${paramCount}`);
      params.push(role);
    }
    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
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

    paramCount++;
    params.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, full_name, role, is_active, created_at, last_login
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user',
        details: error.message
      }
    });
  }
};

// PUT /api/users/:id/password
exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required'
        }
      });
    }

    // Get user with password hash
    const userResult = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect'
        }
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update password',
        details: error.message
      }
    });
  }
};

// DELETE /api/users/:id (soft delete - deactivate)
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Deactivate user (soft delete)
    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to deactivate user',
        details: error.message
      }
    });
  }
};

// PUT /api/users/:id/activate
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Activate user
    await pool.query('UPDATE users SET is_active = true WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to activate user',
        details: error.message
      }
    });
  }
};
