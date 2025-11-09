const { query } = require('../config/database');
const pdfService = require('./pdfService');

/**
 * Voucher Service
 * Handles voucher generation logic including data fetching and PDF creation
 */

/**
 * Fetch complete booking data for voucher generation
 * Returns traveler information (NOT agent details) for privacy
 */
const fetchBookingDataForVoucher = async (bookingId) => {
  try {
    // Fetch main booking with traveler info (not agent details)
    const bookingResult = await query(
      `SELECT
        b.id,
        b.booking_code,
        b.traveler_name,
        b.traveler_email,
        b.traveler_phone,
        b.pax_count,
        b.travel_date_from,
        b.travel_date_to,
        b.booked_by,
        b.notes,
        b.total_sell_price,
        b.status
      FROM bookings b
      WHERE b.id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    // Fetch passengers (actual travelers)
    const passengersResult = await query(
      `SELECT
        name,
        date_of_birth,
        passport_number,
        nationality
      FROM passengers
      WHERE booking_id = $1
      ORDER BY id`,
      [bookingId]
    );

    const passengers = passengersResult.rows;

    // Fetch all booking services
    const services = {
      hotels: [],
      tours: [],
      transfers: [],
      flights: []
    };

    // Fetch hotels
    const hotelsResult = await query(
      `SELECT * FROM booking_hotels WHERE booking_id = $1 ORDER BY id`,
      [bookingId]
    );
    services.hotels = hotelsResult.rows;

    // Fetch tours
    const toursResult = await query(
      `SELECT * FROM booking_tours WHERE booking_id = $1 ORDER BY id`,
      [bookingId]
    );
    services.tours = toursResult.rows;

    // Fetch transfers
    const transfersResult = await query(
      `SELECT * FROM booking_transfers WHERE booking_id = $1 ORDER BY id`,
      [bookingId]
    );
    services.transfers = transfersResult.rows;

    // Fetch flights
    const flightsResult = await query(
      `SELECT * FROM booking_flights WHERE booking_id = $1 ORDER BY id`,
      [bookingId]
    );
    services.flights = flightsResult.rows;

    return {
      booking,
      passengers,
      services
    };
  } catch (error) {
    console.error('Error fetching booking data for voucher:', error);
    throw error;
  }
};

/**
 * Fetch guide and vehicle info for self-operated tours
 */
const fetchTourOperationalDetails = async (tour) => {
  if (tour.operation_type !== 'self-operated') {
    return { guide: null, vehicle: null };
  }

  let guide = null;
  let vehicle = null;

  if (tour.guide_id) {
    const guideResult = await query(
      'SELECT name, phone FROM guides WHERE id = $1',
      [tour.guide_id]
    );
    guide = guideResult.rows[0] || null;
  }

  if (tour.vehicle_id) {
    const vehicleResult = await query(
      'SELECT type, vehicle_number, driver_name, driver_phone FROM vehicles WHERE id = $1',
      [tour.vehicle_id]
    );
    vehicle = vehicleResult.rows[0] || null;
  }

  return { guide, vehicle };
};

/**
 * Fetch vehicle info for self-operated transfers
 */
const fetchTransferOperationalDetails = async (transfer) => {
  if (transfer.operation_type !== 'self-operated' || !transfer.vehicle_id) {
    return { vehicle: null };
  }

  const vehicleResult = await query(
    'SELECT type, vehicle_number, driver_name, driver_phone FROM vehicles WHERE id = $1',
    [transfer.vehicle_id]
  );

  return { vehicle: vehicleResult.rows[0] || null };
};

/**
 * Generate unique voucher number
 * Format: VC-YYYYMMDD-NNNN (e.g., VC-20251109-0001)
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
    const lastNumber = result.rows[0].voucher_number;
    const lastSequence = parseInt(lastNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `VC-${datePrefix}-${String(sequence).padStart(4, '0')}`;
};

/**
 * Generate hotel voucher
 */
exports.generateHotelVoucher = async (bookingId, hotelId) => {
  try {
    // Check if voucher already exists for this service
    const existingVoucher = await query(
      'SELECT id, voucher_number FROM vouchers WHERE booking_id = $1 AND voucher_type = $2 AND service_id = $3',
      [bookingId, 'hotel', hotelId]
    );

    if (existingVoucher.rows.length > 0) {
      throw new Error(`Voucher already exists for this hotel: ${existingVoucher.rows[0].voucher_number}`);
    }

    const { booking, passengers, services } = await fetchBookingDataForVoucher(bookingId);

    // Find the specific hotel
    const hotel = services.hotels.find(h => h.id === hotelId);
    if (!hotel) {
      throw new Error('Hotel not found in booking');
    }

    // Generate voucher number
    const voucher_number = await generateVoucherNumber();

    // Prepare data for PDF generation
    const voucherData = {
      voucher_number,
      booking,
      hotel,
      passengers
    };

    // Generate PDF
    const pdfPath = await pdfService.generateHotelVoucher(voucherData);

    // Save voucher record to database
    const voucherResult = await query(
      `INSERT INTO vouchers (
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        pdf_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [bookingId, 'hotel', hotelId, voucher_number, pdfPath]
    );

    return {
      voucher: voucherResult.rows[0],
      pdfPath
    };
  } catch (error) {
    console.error('Error generating hotel voucher:', error);
    throw error;
  }
};

/**
 * Generate tour voucher
 */
exports.generateTourVoucher = async (bookingId, tourId) => {
  try {
    // Check if voucher already exists for this service
    const existingVoucher = await query(
      'SELECT id, voucher_number FROM vouchers WHERE booking_id = $1 AND voucher_type = $2 AND service_id = $3',
      [bookingId, 'tour', tourId]
    );

    if (existingVoucher.rows.length > 0) {
      throw new Error(`Voucher already exists for this tour: ${existingVoucher.rows[0].voucher_number}`);
    }

    const { booking, passengers, services } = await fetchBookingDataForVoucher(bookingId);

    // Find the specific tour
    const tour = services.tours.find(t => t.id === tourId);
    if (!tour) {
      throw new Error('Tour not found in booking');
    }

    // Fetch operational details if self-operated
    const { guide, vehicle } = await fetchTourOperationalDetails(tour);

    // Generate voucher number
    const voucher_number = await generateVoucherNumber();

    // Prepare data for PDF generation
    const voucherData = {
      voucher_number,
      booking,
      tour,
      passengers,
      guide,
      vehicle
    };

    // Generate PDF
    const pdfPath = await pdfService.generateTourVoucher(voucherData);

    // Save voucher record to database
    const voucherResult = await query(
      `INSERT INTO vouchers (
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        pdf_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [bookingId, 'tour', tourId, voucher_number, pdfPath]
    );

    return {
      voucher: voucherResult.rows[0],
      pdfPath
    };
  } catch (error) {
    console.error('Error generating tour voucher:', error);
    throw error;
  }
};

/**
 * Generate transfer voucher
 */
exports.generateTransferVoucher = async (bookingId, transferId) => {
  try {
    // Check if voucher already exists for this service
    const existingVoucher = await query(
      'SELECT id, voucher_number FROM vouchers WHERE booking_id = $1 AND voucher_type = $2 AND service_id = $3',
      [bookingId, 'transfer', transferId]
    );

    if (existingVoucher.rows.length > 0) {
      throw new Error(`Voucher already exists for this transfer: ${existingVoucher.rows[0].voucher_number}`);
    }

    const { booking, passengers, services } = await fetchBookingDataForVoucher(bookingId);

    // Find the specific transfer
    const transfer = services.transfers.find(t => t.id === transferId);
    if (!transfer) {
      throw new Error('Transfer not found in booking');
    }

    // Fetch operational details if self-operated
    const { vehicle } = await fetchTransferOperationalDetails(transfer);

    // Generate voucher number
    const voucher_number = await generateVoucherNumber();

    // Prepare data for PDF generation
    const voucherData = {
      voucher_number,
      booking,
      transfer,
      passengers,
      vehicle
    };

    // Generate PDF
    const pdfPath = await pdfService.generateTransferVoucher(voucherData);

    // Save voucher record to database
    const voucherResult = await query(
      `INSERT INTO vouchers (
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        pdf_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [bookingId, 'transfer', transferId, voucher_number, pdfPath]
    );

    return {
      voucher: voucherResult.rows[0],
      pdfPath
    };
  } catch (error) {
    console.error('Error generating transfer voucher:', error);
    throw error;
  }
};

/**
 * Generate flight voucher
 */
exports.generateFlightVoucher = async (bookingId, flightId) => {
  try {
    // Check if voucher already exists for this service
    const existingVoucher = await query(
      'SELECT id, voucher_number FROM vouchers WHERE booking_id = $1 AND voucher_type = $2 AND service_id = $3',
      [bookingId, 'flight', flightId]
    );

    if (existingVoucher.rows.length > 0) {
      throw new Error(`Voucher already exists for this flight: ${existingVoucher.rows[0].voucher_number}`);
    }

    const { booking, passengers, services } = await fetchBookingDataForVoucher(bookingId);

    // Find the specific flight
    const flight = services.flights.find(f => f.id === flightId);
    if (!flight) {
      throw new Error('Flight not found in booking');
    }

    // Generate voucher number
    const voucher_number = await generateVoucherNumber();

    // Prepare data for PDF generation
    const voucherData = {
      voucher_number,
      booking,
      flight,
      passengers
    };

    // Generate PDF
    const pdfPath = await pdfService.generateFlightVoucher(voucherData);

    // Save voucher record to database
    const voucherResult = await query(
      `INSERT INTO vouchers (
        booking_id,
        voucher_type,
        service_id,
        voucher_number,
        pdf_path
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [bookingId, 'flight', flightId, voucher_number, pdfPath]
    );

    return {
      voucher: voucherResult.rows[0],
      pdfPath
    };
  } catch (error) {
    console.error('Error generating flight voucher:', error);
    throw error;
  }
};

/**
 * Get all services for a booking (for voucher selection)
 */
exports.getBookingServices = async (bookingId) => {
  try {
    const { booking, passengers, services } = await fetchBookingDataForVoucher(bookingId);

    return {
      booking: {
        id: booking.id,
        booking_code: booking.booking_code,
        traveler_name: booking.traveler_name,
        traveler_email: booking.traveler_email,
        traveler_phone: booking.traveler_phone,
        pax_count: booking.pax_count,
        travel_date_from: booking.travel_date_from,
        travel_date_to: booking.travel_date_to
      },
      passengers,
      services: {
        hotels: services.hotels.map(h => ({
          id: h.id,
          hotel_name: h.hotel_name,
          check_in: h.check_in,
          check_out: h.check_out,
          nights: h.nights,
          room_type: h.room_type
        })),
        tours: services.tours.map(t => ({
          id: t.id,
          tour_name: t.tour_name,
          tour_date: t.tour_date,
          pax_count: t.pax_count
        })),
        transfers: services.transfers.map(t => ({
          id: t.id,
          transfer_type: t.transfer_type,
          transfer_date: t.transfer_date,
          from_location: t.from_location,
          to_location: t.to_location
        })),
        flights: services.flights.map(f => ({
          id: f.id,
          airline: f.airline,
          flight_number: f.flight_number,
          from_airport: f.from_airport,
          to_airport: f.to_airport,
          departure_date: f.departure_date
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching booking services:', error);
    throw error;
  }
};
