const { query } = require('../config/database');
const { formatDateTime } = require('../utils/formatters');
const voucherService = require('../services/voucherService');
const path = require('path');

/**
 * Generate unique voucher number
 * Format: VC-YYYYMMDD-NNNN (e.g., VC-20251106-0001)
 */
const generateVoucherNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Find the highest voucher number for today
  const result = await query(
    `SELECT voucher_number
     FROM vouchers
     WHERE voucher_number LIKE $1
     ORDER BY voucher_number DESC
     LIMIT 1`,
    [`VC-${datePrefix}-%`]
  );

  let sequence = 1;
  if (result.rows.length > 0) {
    // Extract sequence number and increment
    const lastNumber = result.rows[0].voucher_number;
    const lastSequence = parseInt(lastNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format: VC-YYYYMMDD-NNNN
  return `VC-${datePrefix}-${String(sequence).padStart(4, '0')}`;
};

/**
 * Get all vouchers with filters
 * GET /api/vouchers
 */
exports.getAll = async (req, res) => {
  try {
    const { booking_id, voucher_type, search } = req.query;

    // Build dynamic query
    let queryText = `
      SELECT
        id,
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        issued_date,
        pdf_path,
        sent_to,
        sent_at
      FROM vouchers
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by booking_id
    if (booking_id) {
      queryText += ` AND booking_id = $${paramCount}`;
      params.push(parseInt(booking_id));
      paramCount++;
    }

    // Filter by voucher_type
    if (voucher_type && ['hotel', 'tour', 'transfer', 'flight'].includes(voucher_type)) {
      queryText += ` AND voucher_type = $${paramCount}`;
      params.push(voucher_type);
      paramCount++;
    }

    // Search by voucher_number
    if (search) {
      queryText += ` AND voucher_number ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Order by issued_date descending (newest first)
    queryText += ` ORDER BY issued_date DESC`;

    const result = await query(queryText, params);

    // Format dates in results
    const vouchers = result.rows.map(voucher => ({
      ...voucher,
      issued_date: formatDateTime(voucher.issued_date),
      sent_at: voucher.sent_at ? formatDateTime(voucher.sent_at) : null
    }));

    res.json({
      success: true,
      data: vouchers,
      count: vouchers.length
    });
  } catch (error) {
    console.error('Get all vouchers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve vouchers'
      }
    });
  }
};

/**
 * Get single voucher by ID
 * GET /api/vouchers/:id
 */
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        id,
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        issued_date,
        pdf_path,
        sent_to,
        sent_at
      FROM vouchers
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Voucher not found'
        }
      });
    }

    const voucher = result.rows[0];

    // Format dates
    voucher.issued_date = formatDateTime(voucher.issued_date);
    voucher.sent_at = voucher.sent_at ? formatDateTime(voucher.sent_at) : null;

    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Get voucher by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve voucher'
      }
    });
  }
};

/**
 * Create new voucher
 * POST /api/vouchers
 */
exports.create = async (req, res) => {
  try {
    const {
      booking_id,
      voucher_type,
      service_id,
      pdf_path,
      sent_to
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

    if (!voucher_type || !['hotel', 'tour', 'transfer', 'flight'].includes(voucher_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid voucher type is required (hotel, tour, transfer, or flight)'
        }
      });
    }

    // Check if booking exists
    const bookingCheck = await query(
      'SELECT id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking not found'
        }
      });
    }

    // Auto-generate unique voucher number
    const voucher_number = await generateVoucherNumber();

    // Insert new voucher
    const result = await query(
      `INSERT INTO vouchers (
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        pdf_path,
        sent_to,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        issued_date,
        pdf_path,
        sent_to,
        sent_at`,
      [
        booking_id,
        voucher_type,
        service_id || null,
        voucher_number,
        pdf_path || null,
        sent_to || null,
        sent_to ? new Date() : null // Auto-set sent_at if sent_to is provided
      ]
    );

    const newVoucher = result.rows[0];

    // Format dates
    newVoucher.issued_date = formatDateTime(newVoucher.issued_date);
    newVoucher.sent_at = newVoucher.sent_at ? formatDateTime(newVoucher.sent_at) : null;

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: newVoucher
    });
  } catch (error) {
    console.error('Create voucher error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Voucher number already exists'
        }
      });
    }

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid booking ID or service ID reference'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create voucher'
      }
    });
  }
};

/**
 * Update voucher
 * PUT /api/vouchers/:id
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      booking_id,
      voucher_type,
      service_id,
      pdf_path,
      sent_to
    } = req.body;

    // Check if voucher exists
    const existingVoucher = await query(
      'SELECT id, sent_to FROM vouchers WHERE id = $1',
      [id]
    );

    if (existingVoucher.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Voucher not found'
        }
      });
    }

    // Validation
    if (voucher_type && !['hotel', 'tour', 'transfer', 'flight'].includes(voucher_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid voucher type is required (hotel, tour, transfer, or flight)'
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
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
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

    if (voucher_type !== undefined) {
      updates.push(`voucher_type = $${paramCount}`);
      params.push(voucher_type);
      paramCount++;
    }

    if (service_id !== undefined) {
      updates.push(`service_id = $${paramCount}`);
      params.push(service_id || null);
      paramCount++;
    }

    if (pdf_path !== undefined) {
      updates.push(`pdf_path = $${paramCount}`);
      params.push(pdf_path || null);
      paramCount++;
    }

    if (sent_to !== undefined) {
      updates.push(`sent_to = $${paramCount}`);
      params.push(sent_to || null);
      paramCount++;

      // Auto-update sent_at when sent_to is updated
      const oldSentTo = existingVoucher.rows[0].sent_to;
      if (sent_to && sent_to !== oldSentTo) {
        updates.push(`sent_at = $${paramCount}`);
        params.push(new Date());
        paramCount++;
      } else if (!sent_to) {
        // Clear sent_at if sent_to is cleared
        updates.push(`sent_at = $${paramCount}`);
        params.push(null);
        paramCount++;
      }
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
      `UPDATE vouchers
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING
         id,
         booking_id,
         voucher_type,
         service_id,
         voucher_number,
         issued_date,
         pdf_path,
         sent_to,
         sent_at`,
      params
    );

    const updatedVoucher = result.rows[0];

    // Format dates
    updatedVoucher.issued_date = formatDateTime(updatedVoucher.issued_date);
    updatedVoucher.sent_at = updatedVoucher.sent_at ? formatDateTime(updatedVoucher.sent_at) : null;

    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: updatedVoucher
    });
  } catch (error) {
    console.error('Update voucher error:', error);

    // Handle foreign key violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid booking ID or service ID reference'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update voucher'
      }
    });
  }
};

/**
 * Delete voucher (hard delete)
 * DELETE /api/vouchers/:id
 */
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if voucher exists
    const existingVoucher = await query(
      'SELECT id FROM vouchers WHERE id = $1',
      [id]
    );

    if (existingVoucher.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Voucher not found'
        }
      });
    }

    // Hard delete
    await query('DELETE FROM vouchers WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete voucher'
      }
    });
  }
};

/**
 * Get booking services for voucher generation
 * GET /api/vouchers/booking/:bookingId/services
 */
exports.getBookingServices = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const data = await voucherService.getBookingServices(bookingId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get booking services error:', error);

    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch booking services'
      }
    });
  }
};

/**
 * Generate hotel voucher PDF
 * POST /api/vouchers/generate/hotel
 */
exports.generateHotelVoucher = async (req, res) => {
  try {
    const { booking_id, hotel_id } = req.body;

    if (!booking_id || !hotel_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and Hotel ID are required'
        }
      });
    }

    const result = await voucherService.generateHotelVoucher(
      parseInt(booking_id),
      parseInt(hotel_id)
    );

    res.json({
      success: true,
      message: 'Hotel voucher generated successfully',
      data: result.voucher
    });
  } catch (error) {
    console.error('Generate hotel voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate hotel voucher'
      }
    });
  }
};

/**
 * Generate tour voucher PDF
 * POST /api/vouchers/generate/tour
 */
exports.generateTourVoucher = async (req, res) => {
  try {
    const { booking_id, tour_id } = req.body;

    if (!booking_id || !tour_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and Tour ID are required'
        }
      });
    }

    const result = await voucherService.generateTourVoucher(
      parseInt(booking_id),
      parseInt(tour_id)
    );

    res.json({
      success: true,
      message: 'Tour voucher generated successfully',
      data: result.voucher
    });
  } catch (error) {
    console.error('Generate tour voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate tour voucher'
      }
    });
  }
};

/**
 * Generate transfer voucher PDF
 * POST /api/vouchers/generate/transfer
 */
exports.generateTransferVoucher = async (req, res) => {
  try {
    const { booking_id, transfer_id } = req.body;

    if (!booking_id || !transfer_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and Transfer ID are required'
        }
      });
    }

    const result = await voucherService.generateTransferVoucher(
      parseInt(booking_id),
      parseInt(transfer_id)
    );

    res.json({
      success: true,
      message: 'Transfer voucher generated successfully',
      data: result.voucher
    });
  } catch (error) {
    console.error('Generate transfer voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate transfer voucher'
      }
    });
  }
};

/**
 * Generate flight voucher PDF
 * POST /api/vouchers/generate/flight
 */
exports.generateFlightVoucher = async (req, res) => {
  try {
    const { booking_id, flight_id } = req.body;

    if (!booking_id || !flight_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Booking ID and Flight ID are required'
        }
      });
    }

    const result = await voucherService.generateFlightVoucher(
      parseInt(booking_id),
      parseInt(flight_id)
    );

    res.json({
      success: true,
      message: 'Flight voucher generated successfully',
      data: result.voucher
    });
  } catch (error) {
    console.error('Generate flight voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to generate flight voucher'
      }
    });
  }
};

/**
 * Download voucher PDF
 * GET /api/vouchers/:id/download
 */
exports.downloadVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch voucher
    const result = await query(
      'SELECT pdf_path, voucher_number FROM vouchers WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Voucher not found'
        }
      });
    }

    const voucher = result.rows[0];

    if (!voucher.pdf_path) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'PDF file not found for this voucher'
        }
      });
    }

    // Extract just the filename from the stored path
    const fileName = path.basename(voucher.pdf_path);
    // Construct the correct path relative to the backend directory
    const filePath = path.join(__dirname, '../../vouchers', fileName);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'PDF file not found on server'
        }
      });
    }

    // Send file
    const downloadName = `${voucher.voucher_number}.pdf`;
    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'DOWNLOAD_ERROR',
              message: 'Failed to download voucher'
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('Download voucher error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download voucher'
      }
    });
  }
};
