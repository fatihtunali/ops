const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all supplier payments
 * GET /api/supplier-payments
 * Query params: status, supplier_type, due_date_from, due_date_to, booking_id
 */
exports.getAll = async (req, res) => {
  try {
    const { status, supplier_type, due_date_from, due_date_to, booking_id } = req.query;

    // Build query dynamically based on filters
    let sql = 'SELECT * FROM supplier_payments WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      sql += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (supplier_type) {
      sql += ` AND supplier_type = $${paramCount}`;
      params.push(supplier_type);
      paramCount++;
    }

    if (due_date_from) {
      sql += ` AND due_date >= $${paramCount}`;
      params.push(due_date_from);
      paramCount++;
    }

    if (due_date_to) {
      sql += ` AND due_date <= $${paramCount}`;
      params.push(due_date_to);
      paramCount++;
    }

    if (booking_id) {
      sql += ` AND booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    sql += ' ORDER BY due_date ASC, created_at DESC';

    const result = await query(sql, params);

    // Format dates for all supplier payments
    const supplierPayments = result.rows.map(payment => ({
      ...payment,
      created_at: formatDateTime(payment.created_at)
    }));

    res.json({
      success: true,
      count: supplierPayments.length,
      data: supplierPayments
    });
  } catch (error) {
    console.error('Get all supplier payments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch supplier payments'
      }
    });
  }
};

/**
 * Get supplier payment by ID
 * GET /api/supplier-payments/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM supplier_payments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier payment not found'
        }
      });
    }

    const supplierPayment = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      data: supplierPayment
    });
  } catch (error) {
    console.error('Get supplier payment by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch supplier payment'
      }
    });
  }
};

/**
 * Create new supplier payment
 * POST /api/supplier-payments
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      supplier_type,
      supplier_id,
      supplier_name,
      service_id,
      amount,
      currency,
      payment_date,
      due_date,
      payment_method,
      status,
      reference_number,
      notes
    } = req.body;

    // Validation
    if (!supplier_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Supplier type is required'
        }
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount is required'
        }
      });
    }

    // Validate amount is positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Amount must be a positive number'
        }
      });
    }

    // Validate supplier_type
    const validSupplierTypes = ['hotel', 'tour', 'transfer', 'flight', 'guide', 'vehicle', 'other'];
    if (!validSupplierTypes.includes(supplier_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Supplier type must be one of: ${validSupplierTypes.join(', ')}`
        }
      });
    }

    // Validate status if provided
    if (status && !['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "pending" or "paid"'
        }
      });
    }

    // Validate booking_id exists if provided
    if (booking_id) {
      const bookingCheck = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid booking_id: booking does not exist'
          }
        });
      }
    }

    const result = await query(
      `INSERT INTO supplier_payments (
        booking_id, supplier_type, supplier_id, supplier_name, service_id,
        amount, currency, payment_date, due_date, payment_method,
        status, reference_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        booking_id || null,
        supplier_type,
        supplier_id || null,
        supplier_name || null,
        service_id || null,
        amount,
        currency || 'USD',
        payment_date || null,
        due_date || null,
        payment_method || null,
        status || 'pending',
        reference_number || null,
        notes || null
      ]
    );

    const supplierPayment = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.status(201).json({
      success: true,
      message: 'Supplier payment created successfully',
      data: supplierPayment
    });
  } catch (error) {
    console.error('Create supplier payment error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Referenced booking does not exist'
        }
      });
    }

    // Handle check constraint violation
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONSTRAINT_ERROR',
          message: 'Invalid value for supplier_type, status, or amount'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create supplier payment'
      }
    });
  }
};

/**
 * Update supplier payment
 * PUT /api/supplier-payments/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      supplier_type,
      supplier_id,
      supplier_name,
      service_id,
      amount,
      currency,
      payment_date,
      due_date,
      payment_method,
      status,
      reference_number,
      notes
    } = req.body;

    // Check if supplier payment exists
    const checkResult = await query(
      'SELECT id FROM supplier_payments WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier payment not found'
        }
      });
    }

    // Validate amount if provided
    if (amount !== undefined && amount !== null) {
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Amount must be a positive number'
          }
        });
      }
    }

    // Validate supplier_type if provided
    if (supplier_type !== undefined) {
      const validSupplierTypes = ['hotel', 'tour', 'transfer', 'flight', 'guide', 'vehicle', 'other'];
      if (!validSupplierTypes.includes(supplier_type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Supplier type must be one of: ${validSupplierTypes.join(', ')}`
          }
        });
      }
    }

    // Validate status if provided
    if (status && !['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "pending" or "paid"'
        }
      });
    }

    // Validate booking_id exists if provided
    if (booking_id !== undefined && booking_id !== null) {
      const bookingCheck = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid booking_id: booking does not exist'
          }
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (booking_id !== undefined) {
      updates.push(`booking_id = $${paramCount}`);
      params.push(booking_id || null);
      paramCount++;
    }
    if (supplier_type !== undefined) {
      updates.push(`supplier_type = $${paramCount}`);
      params.push(supplier_type);
      paramCount++;
    }
    if (supplier_id !== undefined) {
      updates.push(`supplier_id = $${paramCount}`);
      params.push(supplier_id || null);
      paramCount++;
    }
    if (supplier_name !== undefined) {
      updates.push(`supplier_name = $${paramCount}`);
      params.push(supplier_name || null);
      paramCount++;
    }
    if (service_id !== undefined) {
      updates.push(`service_id = $${paramCount}`);
      params.push(service_id || null);
      paramCount++;
    }
    if (amount !== undefined) {
      updates.push(`amount = $${paramCount}`);
      params.push(amount);
      paramCount++;
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramCount}`);
      params.push(currency || 'USD');
      paramCount++;
    }
    if (payment_date !== undefined) {
      updates.push(`payment_date = $${paramCount}`);
      params.push(payment_date || null);
      paramCount++;
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      params.push(due_date || null);
      paramCount++;
    }
    if (payment_method !== undefined) {
      updates.push(`payment_method = $${paramCount}`);
      params.push(payment_method || null);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }
    if (reference_number !== undefined) {
      updates.push(`reference_number = $${paramCount}`);
      params.push(reference_number || null);
      paramCount++;
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes || null);
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

    params.push(id);
    const sql = `UPDATE supplier_payments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, params);

    const supplierPayment = {
      ...result.rows[0],
      created_at: formatDateTime(result.rows[0].created_at)
    };

    res.json({
      success: true,
      message: 'Supplier payment updated successfully',
      data: supplierPayment
    });
  } catch (error) {
    console.error('Update supplier payment error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Referenced booking does not exist'
        }
      });
    }

    // Handle check constraint violation
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONSTRAINT_ERROR',
          message: 'Invalid value for supplier_type, status, or amount'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update supplier payment'
      }
    });
  }
};

/**
 * Delete supplier payment (hard delete - permanently remove from database)
 * DELETE /api/supplier-payments/:id
 */
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if supplier payment exists
    const checkResult = await query(
      'SELECT id FROM supplier_payments WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier payment not found'
        }
      });
    }

    // Hard delete - permanently remove from database
    await query(
      'DELETE FROM supplier_payments WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Supplier payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete supplier payment'
      }
    });
  }
};

/**
 * Get supplier payment statistics
 * GET /api/supplier-payments/stats
 */
exports.getStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status = 'pending' THEN 1 END) as overdue_payments,
        COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND status = 'pending' THEN amount ELSE 0 END), 0) as overdue_amount
      FROM supplier_payments
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    // Get breakdown by supplier type
    const supplierTypeQuery = `
      SELECT
        supplier_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
      FROM supplier_payments
      GROUP BY supplier_type
      ORDER BY total_amount DESC
    `;

    const supplierTypeResult = await query(supplierTypeQuery);

    res.json({
      success: true,
      data: {
        overview: {
          total_payments: parseInt(stats.total_payments),
          pending_payments: parseInt(stats.pending_payments),
          paid_payments: parseInt(stats.paid_payments),
          overdue_payments: parseInt(stats.overdue_payments),
          total_amount: parseFloat(stats.total_amount),
          pending_amount: parseFloat(stats.pending_amount),
          paid_amount: parseFloat(stats.paid_amount),
          overdue_amount: parseFloat(stats.overdue_amount)
        },
        by_supplier_type: supplierTypeResult.rows.map(row => ({
          supplier_type: row.supplier_type,
          count: parseInt(row.count),
          total_amount: parseFloat(row.total_amount),
          pending_amount: parseFloat(row.pending_amount)
        }))
      }
    });
  } catch (error) {
    console.error('Get supplier payment stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch supplier payment statistics'
      }
    });
  }
};
