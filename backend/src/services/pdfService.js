const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generation Service for Vouchers
 */

// Ensure vouchers directory exists
const VOUCHERS_DIR = path.join(__dirname, '../../vouchers');
if (!fs.existsSync(VOUCHERS_DIR)) {
  fs.mkdirSync(VOUCHERS_DIR, { recursive: true });
}

/**
 * Generate Hotel Voucher PDF
 */
exports.generateHotelVoucher = async (voucherData) => {
  return new Promise((resolve, reject) => {
    try {
      const { booking, hotel, passengers } = voucherData;

      const fileName = `voucher_hotel_${booking.booking_code}_${hotel.id}.pdf`;
      const filePath = path.join(VOUCHERS_DIR, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text('FUNNY TOURISM', { align: 'center' });
      doc.fontSize(16).text('HOTEL VOUCHER', { align: 'center' });
      doc.moveDown();

      // Voucher details
      doc.fontSize(10).text(`Voucher Number: ${voucherData.voucher_number}`, { align: 'right' });
      doc.text(`Booking Code: ${booking.booking_code}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Guest Details
      doc.fontSize(14).text('GUEST DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      passengers.forEach(passenger => {
        doc.text(`Name: ${passenger.name}`);
      });
      doc.text(`Check-in: ${hotel.check_in}`);
      doc.text(`Check-out: ${hotel.check_out}`);
      doc.text(`Nights: ${hotel.nights}`);
      doc.text(`Room Type: ${hotel.room_type}`);
      doc.text(`Number of Rooms: ${hotel.number_of_rooms}`);
      doc.moveDown(2);

      // Hotel Details
      doc.fontSize(14).text('HOTEL DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Hotel: ${hotel.hotel_name}`);
      if (hotel.confirmation_number) {
        doc.text(`Confirmation Number: ${hotel.confirmation_number}`);
      }
      doc.moveDown(2);

      // Special Requests
      if (hotel.notes) {
        doc.fontSize(14).text('SPECIAL REQUESTS', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(hotel.notes);
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(8).text('Terms & Conditions Apply', 50, doc.page.height - 100, {
        align: 'center'
      });
      doc.text('For any queries, please contact: info@funnytourism.com', {
        align: 'center'
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Tour Voucher PDF
 */
exports.generateTourVoucher = async (voucherData) => {
  return new Promise((resolve, reject) => {
    try {
      const { booking, tour, passengers, guide, vehicle } = voucherData;

      const fileName = `voucher_tour_${booking.booking_code}_${tour.id}.pdf`;
      const filePath = path.join(VOUCHERS_DIR, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text('FUNNY TOURISM', { align: 'center' });
      doc.fontSize(16).text('TOUR VOUCHER', { align: 'center' });
      doc.moveDown();

      // Voucher details
      doc.fontSize(10).text(`Voucher Number: ${voucherData.voucher_number}`, { align: 'right' });
      doc.text(`Booking Code: ${booking.booking_code}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Guest Details
      doc.fontSize(14).text('GUEST DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      passengers.forEach(passenger => {
        doc.text(`Name: ${passenger.name}`);
      });
      doc.text(`Pax Count: ${tour.pax_count} person(s)`);
      doc.text(`Tour Date: ${tour.tour_date}`);
      doc.moveDown(2);

      // Tour Details
      doc.fontSize(14).text('TOUR DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Tour: ${tour.tour_name}`);
      doc.text(`Duration: ${tour.duration}`);
      doc.text(`Operation Type: ${tour.operation_type}`);
      doc.moveDown();

      // Guide and Vehicle info (if self-operated)
      if (tour.operation_type === 'self-operated') {
        if (guide) {
          doc.text(`Guide: ${guide.name}`);
          doc.text(`Guide Phone: ${guide.phone}`);
        }
        if (vehicle) {
          doc.text(`Vehicle: ${vehicle.type} (${vehicle.vehicle_number})`);
          if (vehicle.driver_name) {
            doc.text(`Driver: ${vehicle.driver_name}`);
            doc.text(`Driver Phone: ${vehicle.driver_phone}`);
          }
        }
      }

      if (tour.confirmation_number) {
        doc.text(`Confirmation Number: ${tour.confirmation_number}`);
      }
      doc.moveDown(2);

      // Special Notes
      if (tour.notes) {
        doc.fontSize(14).text('SPECIAL NOTES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(tour.notes);
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(8).text('Terms & Conditions Apply', 50, doc.page.height - 100, {
        align: 'center'
      });
      doc.text('For any queries, please contact: info@funnytourism.com', {
        align: 'center'
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Transfer Voucher PDF
 */
exports.generateTransferVoucher = async (voucherData) => {
  return new Promise((resolve, reject) => {
    try {
      const { booking, transfer, passengers, vehicle } = voucherData;

      const fileName = `voucher_transfer_${booking.booking_code}_${transfer.id}.pdf`;
      const filePath = path.join(VOUCHERS_DIR, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text('FUNNY TOURISM', { align: 'center' });
      doc.fontSize(16).text('TRANSFER VOUCHER', { align: 'center' });
      doc.moveDown();

      // Voucher details
      doc.fontSize(10).text(`Voucher Number: ${voucherData.voucher_number}`, { align: 'right' });
      doc.text(`Booking Code: ${booking.booking_code}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Guest Details
      doc.fontSize(14).text('GUEST DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      passengers.forEach(passenger => {
        doc.text(`Name: ${passenger.name}`);
      });
      doc.text(`Pax Count: ${transfer.pax_count} person(s)`);
      doc.moveDown(2);

      // Transfer Details
      doc.fontSize(14).text('TRANSFER DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Transfer Type: ${transfer.transfer_type}`);
      doc.text(`Date: ${transfer.transfer_date}`);
      doc.text(`From: ${transfer.from_location}`);
      doc.text(`To: ${transfer.to_location}`);
      doc.text(`Vehicle Type: ${transfer.vehicle_type}`);
      doc.moveDown();

      // Vehicle info (if self-operated)
      if (transfer.operation_type === 'self-operated' && vehicle) {
        doc.text(`Vehicle: ${vehicle.type} (${vehicle.vehicle_number})`);
        if (vehicle.driver_name) {
          doc.text(`Driver: ${vehicle.driver_name}`);
          doc.text(`Driver Phone: ${vehicle.driver_phone}`);
        }
      }

      if (transfer.confirmation_number) {
        doc.text(`Confirmation Number: ${transfer.confirmation_number}`);
      }
      doc.moveDown(2);

      // Special Notes
      if (transfer.notes) {
        doc.fontSize(14).text('SPECIAL NOTES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(transfer.notes);
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(8).text('Terms & Conditions Apply', 50, doc.page.height - 100, {
        align: 'center'
      });
      doc.text('For any queries, please contact: info@funnytourism.com', {
        align: 'center'
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Flight Voucher PDF
 */
exports.generateFlightVoucher = async (voucherData) => {
  return new Promise((resolve, reject) => {
    try {
      const { booking, flight, passengers } = voucherData;

      const fileName = `voucher_flight_${booking.booking_code}_${flight.id}.pdf`;
      const filePath = path.join(VOUCHERS_DIR, fileName);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc.fontSize(20).text('FUNNY TOURISM', { align: 'center' });
      doc.fontSize(16).text('FLIGHT VOUCHER', { align: 'center' });
      doc.moveDown();

      // Voucher details
      doc.fontSize(10).text(`Voucher Number: ${voucherData.voucher_number}`, { align: 'right' });
      doc.text(`Booking Code: ${booking.booking_code}`, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);

      // Passenger Details
      doc.fontSize(14).text('PASSENGER DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      passengers.forEach(passenger => {
        doc.text(`Name: ${passenger.name}`);
        if (passenger.passport_number) {
          doc.text(`Passport: ${passenger.passport_number}`);
        }
      });
      doc.moveDown(2);

      // Flight Details
      doc.fontSize(14).text('FLIGHT DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Airline: ${flight.airline}`);
      doc.text(`Flight Number: ${flight.flight_number}`);
      doc.text(`From: ${flight.from_airport}`);
      doc.text(`To: ${flight.to_airport}`);
      doc.text(`Departure: ${flight.departure_date}`);
      doc.text(`Arrival: ${flight.arrival_date}`);
      doc.text(`PNR: ${flight.pnr}`);
      if (flight.ticket_numbers) {
        doc.text(`Ticket Numbers: ${flight.ticket_numbers}`);
      }
      doc.moveDown(2);

      // Special Notes
      if (flight.notes) {
        doc.fontSize(14).text('SPECIAL NOTES', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(flight.notes);
        doc.moveDown(2);
      }

      // Footer
      doc.fontSize(8).text('Terms & Conditions Apply', 50, doc.page.height - 100, {
        align: 'center'
      });
      doc.text('For any queries, please contact: info@funnytourism.com', {
        align: 'center'
      });

      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};
