const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');

/**
 * Get all booking transfers with optional filters
 * GET /api/booking-transfers
 * Query params: booking_id, operation_type, payment_status
 */
exports.getAllBookingTransfers = async (req, res) => {
  try {
    const { booking_id, operation_type, payment_status } = req.query;

    let sqlQuery = `
      SELECT
        bt.id, bt.booking_id, bt.transfer_type, bt.transfer_date,
        bt.from_location, bt.to_location, bt.pax_count, bt.vehicle_type,
        bt.operation_type, bt.supplier_id, bt.vehicle_id,
        bt.cost_price, bt.sell_price, bt.margin,
        bt.payment_status, bt.paid_amount, bt.confirmation_number,
        bt.voucher_issued, bt.notes, bt.created_at,
        bt.flight_number, bt.flight_time, bt.terminal,
        ts.name as supplier_name,
        v.vehicle_number
      FROM booking_transfers bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Filter by booking_id
    if (booking_id) {
      sqlQuery += ` AND bt.booking_id = $${paramCount}`;
      params.push(booking_id);
      paramCount++;
    }

    // Filter by operation_type
    if (operation_type) {
      sqlQuery += ` AND bt.operation_type = $${paramCount}`;
      params.push(operation_type);
      paramCount++;
    }

    // Filter by payment_status
    if (payment_status) {
      sqlQuery += ` AND bt.payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    sqlQuery += ' ORDER BY bt.transfer_date DESC, bt.created_at DESC';

    const result = await query(sqlQuery, params);

    // Format dates and convert decimals to numbers
    const transfers = result.rows.map(transfer => ({
      ...transfer,
      cost_price: transfer.cost_price ? parseFloat(transfer.cost_price) : null,
      sell_price: transfer.sell_price ? parseFloat(transfer.sell_price) : null,
      margin: transfer.margin ? parseFloat(transfer.margin) : null,
      paid_amount: transfer.paid_amount ? parseFloat(transfer.paid_amount) : null,
      transfer_date: transfer.transfer_date,
      created_at: formatDateTime(transfer.created_at)
    }));

    res.json({
      success: true,
      data: transfers,
      count: transfers.length
    });
  } catch (error) {
    console.error('Get all booking transfers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking transfers'
      }
    });
  }
};

/**
 * Get single booking transfer by ID
 * GET /api/booking-transfers/:id
 */
exports.getBookingTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        bt.id, bt.booking_id, bt.transfer_type, bt.transfer_date,
        bt.from_location, bt.to_location, bt.pax_count, bt.vehicle_type,
        bt.operation_type, bt.supplier_id, bt.vehicle_id,
        bt.cost_price, bt.sell_price, bt.margin,
        bt.payment_status, bt.paid_amount, bt.confirmation_number,
        bt.voucher_issued, bt.notes, bt.created_at,
        bt.flight_number, bt.flight_time, bt.terminal,
        ts.company_name as supplier_name,
        v.vehicle_number
      FROM booking_transfers bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE bt.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking transfer not found'
        }
      });
    }

    const transfer = result.rows[0];
    transfer.cost_price = transfer.cost_price ? parseFloat(transfer.cost_price) : null;
    transfer.sell_price = transfer.sell_price ? parseFloat(transfer.sell_price) : null;
    transfer.margin = transfer.margin ? parseFloat(transfer.margin) : null;
    transfer.paid_amount = transfer.paid_amount ? parseFloat(transfer.paid_amount) : null;
    transfer.created_at = formatDateTime(transfer.created_at);

    res.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    console.error('Get booking transfer by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking transfer'
      }
    });
  }
};

/**
 * Get all transfers for a specific booking
 * GET /api/booking-transfers/booking/:bookingId
 */
exports.getTransfersByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await query(
      `SELECT
        bt.id, bt.booking_id, bt.transfer_type, bt.transfer_date,
        bt.from_location, bt.to_location, bt.pax_count, bt.vehicle_type,
        bt.operation_type, bt.supplier_id, bt.vehicle_id,
        bt.cost_price, bt.sell_price, bt.margin,
        bt.payment_status, bt.paid_amount, bt.confirmation_number,
        bt.voucher_issued, bt.notes, bt.created_at,
        ts.name as supplier_name,
        v.vehicle_number
      FROM booking_transfers bt
      LEFT JOIN tour_suppliers ts ON bt.supplier_id = ts.id
      LEFT JOIN vehicles v ON bt.vehicle_id = v.id
      WHERE bt.booking_id = $1
      ORDER BY bt.transfer_date ASC, bt.created_at ASC`,
      [bookingId]
    );

    // Format dates and convert decimals to numbers
    const transfers = result.rows.map(transfer => ({
      ...transfer,
      cost_price: transfer.cost_price ? parseFloat(transfer.cost_price) : null,
      sell_price: transfer.sell_price ? parseFloat(transfer.sell_price) : null,
      margin: transfer.margin ? parseFloat(transfer.margin) : null,
      paid_amount: transfer.paid_amount ? parseFloat(transfer.paid_amount) : null,
      created_at: formatDateTime(transfer.created_at)
    }));

    res.json({
      success: true,
      data: transfers,
      count: transfers.length
    });
  } catch (error) {
    console.error('Get transfers by booking ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking transfers'
      }
    });
  }
};

/**
 * Create new booking transfer
 * POST /api/booking-transfers
 */
exports.createBookingTransfer = async (req, res) => {
  try {
    const {
      booking_id,
      transfer_type,
      transfer_date,
      from_location,
      to_location,
      pax_count,
      vehicle_type,
      operation_type,
      supplier_id,
      vehicle_id,
      cost_price,
      sell_price,
      margin,
      payment_status,
      paid_amount,
      confirmation_number,
      voucher_issued,
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

    if (!operation_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Operation type is required'
        }
      });
    }

    // Validate operation_type
    if (!['supplier', 'self-operated'].includes(operation_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid operation type. Must be: supplier or self-operated'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment status. Must be: pending or paid'
        }
      });
    }

    // Check if booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    // Check if supplier exists (if provided)
    if (supplier_id) {
      const supplierCheck = await query(
        'SELECT id FROM tour_suppliers WHERE id = $1',
        [supplier_id]
      );

      if (supplierCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Supplier not found'
          }
        });
      }
    }

    // Check if vehicle exists (if provided)
    if (vehicle_id) {
      const vehicleCheck = await query(
        'SELECT id FROM vehicles WHERE id = $1',
        [vehicle_id]
      );

      if (vehicleCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vehicle not found'
          }
        });
      }
    }

    // Insert new booking transfer
    const result = await query(
      `INSERT INTO booking_transfers (
        booking_id, transfer_type, transfer_date, from_location, to_location,
        pax_count, vehicle_type, operation_type, supplier_id, vehicle_id,
        cost_price, sell_price, margin, payment_status, paid_amount,
        confirmation_number, voucher_issued, notes, flight_number, flight_time, terminal
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id, booking_id, transfer_type, transfer_date, from_location, to_location,
                pax_count, vehicle_type, operation_type, supplier_id, vehicle_id,
                cost_price, sell_price, margin, payment_status, paid_amount,
                confirmation_number, voucher_issued, notes, flight_number, flight_time, terminal, created_at`,
      [
        booking_id,
        transfer_type || null,
        transfer_date || null,
        from_location || null,
        to_location || null,
        pax_count || null,
        vehicle_type || null,
        operation_type,
        supplier_id || null,
        vehicle_id || null,
        cost_price || null,
        sell_price || null,
        margin || null,
        payment_status || 'pending',
        paid_amount || 0,
        confirmation_number || null,
        voucher_issued || false,
        notes || null,
        req.body.flight_number || null,
        req.body.flight_time || null,
        req.body.terminal || null
      ]
    );

    const newTransfer = result.rows[0];
    newTransfer.cost_price = newTransfer.cost_price ? parseFloat(newTransfer.cost_price) : null;
    newTransfer.sell_price = newTransfer.sell_price ? parseFloat(newTransfer.sell_price) : null;
    newTransfer.margin = newTransfer.margin ? parseFloat(newTransfer.margin) : null;
    newTransfer.paid_amount = newTransfer.paid_amount ? parseFloat(newTransfer.paid_amount) : null;
    newTransfer.created_at = formatDateTime(newTransfer.created_at);

    res.status(201).json({
      success: true,
      message: 'Booking transfer created successfully',
      data: newTransfer
    });
  } catch (error) {
    console.error('Create booking transfer error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Referenced booking, supplier, or vehicle not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create booking transfer'
      }
    });
  }
};

/**
 * Update booking transfer
 * PUT /api/booking-transfers/:id
 */
exports.updateBookingTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      transfer_type,
      transfer_date,
      from_location,
      to_location,
      pax_count,
      vehicle_type,
      operation_type,
      supplier_id,
      vehicle_id,
      cost_price,
      sell_price,
      margin,
      payment_status,
      paid_amount,
      confirmation_number,
      voucher_issued,
      notes
    } = req.body;

    // Validate operation_type if provided
    if (operation_type && !['supplier', 'self-operated'].includes(operation_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid operation type. Must be: supplier or self-operated'
        }
      });
    }

    // Validate payment_status if provided
    if (payment_status && !['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid payment status. Must be: pending or paid'
        }
      });
    }

    // Check if transfer exists
    const existingTransfer = await query(
      'SELECT id FROM booking_transfers WHERE id = $1',
      [id]
    );

    if (existingTransfer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking transfer not found'
        }
      });
    }

    // Check if booking exists (if being updated)
    if (booking_id) {
      const bookingCheck = await query(
        'SELECT id FROM bookings WHERE id = $1',
        [booking_id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Booking not found'
          }
        });
      }
    }

    // Check if supplier exists (if being updated)
    if (supplier_id) {
      const supplierCheck = await query(
        'SELECT id FROM tour_suppliers WHERE id = $1',
        [supplier_id]
      );

      if (supplierCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Supplier not found'
          }
        });
      }
    }

    // Check if vehicle exists (if being updated)
    if (vehicle_id) {
      const vehicleCheck = await query(
        'SELECT id FROM vehicles WHERE id = $1',
        [vehicle_id]
      );

      if (vehicleCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vehicle not found'
          }
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (booking_id !== undefined) {
      updateFields.push(`booking_id = $${paramCount}`);
      params.push(booking_id);
      paramCount++;
    }
    if (transfer_type !== undefined) {
      updateFields.push(`transfer_type = $${paramCount}`);
      params.push(transfer_type);
      paramCount++;
    }
    if (transfer_date !== undefined) {
      updateFields.push(`transfer_date = $${paramCount}`);
      params.push(transfer_date);
      paramCount++;
    }
    if (from_location !== undefined) {
      updateFields.push(`from_location = $${paramCount}`);
      params.push(from_location);
      paramCount++;
    }
    if (to_location !== undefined) {
      updateFields.push(`to_location = $${paramCount}`);
      params.push(to_location);
      paramCount++;
    }
    if (pax_count !== undefined) {
      updateFields.push(`pax_count = $${paramCount}`);
      params.push(pax_count);
      paramCount++;
    }
    if (vehicle_type !== undefined) {
      updateFields.push(`vehicle_type = $${paramCount}`);
      params.push(vehicle_type);
      paramCount++;
    }
    if (operation_type !== undefined) {
      updateFields.push(`operation_type = $${paramCount}`);
      params.push(operation_type);
      paramCount++;
    }
    if (supplier_id !== undefined) {
      updateFields.push(`supplier_id = $${paramCount}`);
      params.push(supplier_id);
      paramCount++;
    }
    if (vehicle_id !== undefined) {
      updateFields.push(`vehicle_id = $${paramCount}`);
      params.push(vehicle_id);
      paramCount++;
    }
    if (cost_price !== undefined) {
      updateFields.push(`cost_price = $${paramCount}`);
      params.push(cost_price);
      paramCount++;
    }
    if (sell_price !== undefined) {
      updateFields.push(`sell_price = $${paramCount}`);
      params.push(sell_price);
      paramCount++;
    }
    if (margin !== undefined) {
      updateFields.push(`margin = $${paramCount}`);
      params.push(margin);
      paramCount++;
    }
    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
    }
    if (paid_amount !== undefined) {
      updateFields.push(`paid_amount = $${paramCount}`);
      params.push(paid_amount);
      paramCount++;
    }
    if (confirmation_number !== undefined) {
      updateFields.push(`confirmation_number = $${paramCount}`);
      params.push(confirmation_number);
      paramCount++;
    }
    if (voucher_issued !== undefined) {
      updateFields.push(`voucher_issued = $${paramCount}`);
      params.push(voucher_issued);
      paramCount++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }
    if (req.body.flight_number !== undefined) {
      updateFields.push(`flight_number = $${paramCount}`);
      params.push(req.body.flight_number);
      paramCount++;
    }
    if (req.body.flight_time !== undefined) {
      updateFields.push(`flight_time = $${paramCount}`);
      params.push(req.body.flight_time);
      paramCount++;
    }
    if (req.body.terminal !== undefined) {
      updateFields.push(`terminal = $${paramCount}`);
      params.push(req.body.terminal);
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
      `UPDATE booking_transfers
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, booking_id, transfer_type, transfer_date, from_location, to_location,
                 pax_count, vehicle_type, operation_type, supplier_id, vehicle_id,
                 cost_price, sell_price, margin, payment_status, paid_amount,
                 confirmation_number, voucher_issued, notes, flight_number, flight_time, terminal, created_at`,
      params
    );

    const updatedTransfer = result.rows[0];
    updatedTransfer.cost_price = updatedTransfer.cost_price ? parseFloat(updatedTransfer.cost_price) : null;
    updatedTransfer.sell_price = updatedTransfer.sell_price ? parseFloat(updatedTransfer.sell_price) : null;
    updatedTransfer.margin = updatedTransfer.margin ? parseFloat(updatedTransfer.margin) : null;
    updatedTransfer.paid_amount = updatedTransfer.paid_amount ? parseFloat(updatedTransfer.paid_amount) : null;
    updatedTransfer.created_at = formatDateTime(updatedTransfer.created_at);

    res.json({
      success: true,
      message: 'Booking transfer updated successfully',
      data: updatedTransfer
    });
  } catch (error) {
    console.error('Update booking transfer error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Referenced booking, supplier, or vehicle not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update booking transfer'
      }
    });
  }
};

/**
 * Delete booking transfer
 * DELETE /api/booking-transfers/:id
 */
exports.deleteBookingTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transfer exists
    const existingTransfer = await query(
      'SELECT id FROM booking_transfers WHERE id = $1',
      [id]
    );

    if (existingTransfer.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking transfer not found'
        }
      });
    }

    // Delete the transfer
    await query(
      'DELETE FROM booking_transfers WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Booking transfer deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking transfer error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete booking transfer'
      }
    });
  }
};
