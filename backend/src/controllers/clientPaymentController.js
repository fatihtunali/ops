const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all client payments with filters
 * GET /api/client-payments
 */
exports.getAll = async (req, res) => {
  try {
    const { booking_id, payment_date_from, payment_date_to, payment_method, currency } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        cp.id,
        cp.booking_id,
        cp.payment_date,
        cp.amount,
        cp.currency,
        cp.payment_method,
        cp.reference_number,
        cp.notes,
        cp.created_at,
        b.booking_code,
        c.name as client_name
      FROM client_payments cp
      LEFT JOIN bookings b ON cp.booking_id = b.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by booking_id
    if (booking_id) {
      queryText += ` AND cp.booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    // Filter by payment_date range
    if (payment_date_from) {
      queryText += ` AND cp.payment_date >= $${paramCount}`;
      params.push(payment_date_from);
      paramCount++;
    }

    if (payment_date_to) {
      queryText += ` AND cp.payment_date <= $${paramCount}`;
      params.push(payment_date_to);
      paramCount++;
    }

    // Filter by payment_method
    if (payment_method) {
      queryText += ` AND cp.payment_method = $${paramCount}`;
      params.push(payment_method);
      paramCount++;
    }

    // Filter by currency
    if (currency) {
      queryText += ` AND cp.currency = $${paramCount}`;
      params.push(currency);
      paramCount++;
    }

    // Order by payment_date descending (newest first)
    queryText += ` ORDER BY cp.payment_date DESC, cp.created_at DESC`;

    const result = await query(queryText, params);

    // Format dates and amounts in results
    const payments = result.rows.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount),
      payment_date: payment.payment_date ? payment.payment_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(payment.created_at)
    }));

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Get all client payments error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client payments'
      }
    });
  }
};

/**
 * Get single client payment by ID
 * GET /api/client-payments/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        cp.id,
        cp.booking_id,
        cp.payment_date,
        cp.amount,
        cp.currency,
        cp.payment_method,
        cp.reference_number,
        cp.notes,
        cp.created_at,
        b.booking_number,
        c.name as client_name
      FROM client_payments cp
      LEFT JOIN bookings b ON cp.booking_id = b.id
      LEFT JOIN clients c ON b.client_id = c.id
      WHERE cp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client payment not found'
        }
      });
    }

    const payment = result.rows[0];

    // Format dates and amounts
    payment.amount = parseFloat(payment.amount);
    payment.payment_date = payment.payment_date ? payment.payment_date.toISOString().split('T')[0] : null;
    payment.created_at = formatDateTime(payment.created_at);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get client payment by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client payment'
      }
    });
  }
};

/**
 * Get payments by booking ID
 * GET /api/client-payments/booking/:booking_id
 */
exports.getByBookingId = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const result = await query(
      `SELECT
        cp.id,
        cp.booking_id,
        cp.payment_date,
        cp.amount,
        cp.currency,
        cp.payment_method,
        cp.reference_number,
        cp.notes,
        cp.created_at
      FROM client_payments cp
      WHERE cp.booking_id = $1
      ORDER BY cp.payment_date DESC, cp.created_at DESC`,
      [booking_id]
    );

    // Format dates and amounts in results
    const payments = result.rows.map(payment => ({
      ...payment,
      amount: parseFloat(payment.amount),
      payment_date: payment.payment_date ? payment.payment_date.toISOString().split('T')[0] : null,
      created_at: formatDateTime(payment.created_at)
    }));

    res.json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error('Get client payments by booking ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve client payments for booking'
      }
    });
  }
};

/**
 * Create new client payment
 * POST /api/client-payments
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      payment_date,
      amount,
      currency,
      payment_method,
      reference_number,
      notes
    } = req.body;

    // Validation
    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID is required'
        }
      });
    }

    if (!payment_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment date is required'
        }
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment amount is required'
        }
      });
    }

    // Validate amount > 0
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment amount must be greater than 0'
        }
      });
    }

    // Check if booking exists
    const bookingResult = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Insert new client payment
    const result = await query(
      `INSERT INTO client_payments (
        booking_id,
        payment_date,
        amount,
        currency,
        payment_method,
        reference_number,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        booking_id,
        payment_date,
        amount,
        currency,
        payment_method,
        reference_number,
        notes,
        created_at`,
      [
        booking_id,
        payment_date,
        paymentAmount,
        currency || 'USD',
        payment_method || null,
        reference_number || null,
        notes || null
      ]
    );

    const newPayment = result.rows[0];

    // Format dates and amounts
    newPayment.amount = parseFloat(newPayment.amount);
    newPayment.payment_date = newPayment.payment_date ? newPayment.payment_date.toISOString().split('T')[0] : null;
    newPayment.created_at = formatDateTime(newPayment.created_at);

    res.status(201).json({
      success: true,
      message: 'Client payment created successfully',
      data: newPayment
    });
  } catch (error) {
    console.error('Create client payment error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking ID'
        }
      });
    }

    // Handle check constraint violation (amount > 0)
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment amount must be greater than 0'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create client payment'
      }
    });
  }
};

/**
 * Update client payment
 * PUT /api/client-payments/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      payment_date,
      amount,
      currency,
      payment_method,
      reference_number,
      notes
    } = req.body;

    // Check if payment exists
    const existingPayment = await query(
      'SELECT id FROM client_payments WHERE id = $1',
      [id]
    );

    if (existingPayment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client payment not found'
        }
      });
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const paymentAmount = parseFloat(amount);
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Payment amount must be greater than 0'
          }
        });
      }
    }

    // Check if booking exists (if being updated)
    if (booking_id) {
      const bookingResult = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found'
          }
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (booking_id !== undefined) {
      updates.push(`booking_id = $${paramCount}`);
      params.push(booking_id);
      paramCount++;
    }

    if (payment_date !== undefined) {
      updates.push(`payment_date = $${paramCount}`);
      params.push(payment_date);
      paramCount++;
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramCount}`);
      params.push(parseFloat(amount));
      paramCount++;
    }

    if (currency !== undefined) {
      updates.push(`currency = $${paramCount}`);
      params.push(currency);
      paramCount++;
    }

    if (payment_method !== undefined) {
      updates.push(`payment_method = $${paramCount}`);
      params.push(payment_method || null);
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

    // Add id parameter
    params.push(id);

    const result = await query(
      `UPDATE client_payments
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         booking_id,
         payment_date,
         amount,
         currency,
         payment_method,
         reference_number,
         notes,
         created_at`,
      params
    );

    const updatedPayment = result.rows[0];

    // Format dates and amounts
    updatedPayment.amount = parseFloat(updatedPayment.amount);
    updatedPayment.payment_date = updatedPayment.payment_date ? updatedPayment.payment_date.toISOString().split('T')[0] : null;
    updatedPayment.created_at = formatDateTime(updatedPayment.created_at);

    res.json({
      success: true,
      message: 'Client payment updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Update client payment error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FOREIGN_KEY_ERROR',
          message: 'Invalid booking ID'
        }
      });
    }

    // Handle check constraint violation (amount > 0)
    if (error.code === '23514') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment amount must be greater than 0'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update client payment'
      }
    });
  }
};

/**
 * Delete client payment
 * DELETE /api/client-payments/:id
 */
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const existingPayment = await query(
      'SELECT id, booking_id FROM client_payments WHERE id = $1',
      [id]
    );

    if (existingPayment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client payment not found'
        }
      });
    }

    // Delete the payment
    await query(
      'DELETE FROM client_payments WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Client payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete client payment error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete client payment'
      }
    });
  }
};
