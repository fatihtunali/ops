# Voucher Generator System - Complete Analysis

## Overview
The booking system has a complete voucher generation system that creates PDF documents for different service types (hotels, tours, transfers, flights). The system uses PDFKit for PDF generation and stores voucher metadata in the database.

## File Locations

### Backend Files (Server-side)

#### 1. Voucher Controller
Path: `C:\Users\fatih\Desktop\ops\backend\src\controllers\voucherController.js`
- Manages CRUD operations for vouchers table
- Auto-generates unique voucher numbers (format: VC-YYYYMMDD-NNNN)
- Stores: booking_id, voucher_type, service_id, pdf_path, sent_to, sent_at

#### 2. Voucher Routes  
Path: `C:\Users\fatih\Desktop\ops\backend\src\routes\vouchers.js`
- GET /api/vouchers - List all with filters
- GET /api/vouchers/:id - Get single voucher
- POST /api/vouchers - Create new voucher
- PUT /api/vouchers/:id - Update voucher
- DELETE /api/vouchers/:id - Delete voucher

#### 3. PDF Service (Voucher Generation)
Path: `C:\Users\fatih\Desktop\ops\backend\src\services\pdfService.js`
- Core PDF generation logic using PDFKit library
- Four main functions:
  - generateHotelVoucher(voucherData)
  - generateTourVoucher(voucherData)
  - generateTransferVoucher(voucherData)
  - generateFlightVoucher(voucherData)
- Output: PDFs saved to backend/vouchers/ directory

### Frontend Files

#### Voucher Generator Page
Path: `C:\Users\fatih\Desktop\ops\frontend\src\pages\vouchers\VoucherGenerator.jsx`
- UI for generating vouchers
- Currently has placeholder functions (not fully integrated)
- Displays bookings list and selected booking details

## Database Schema

### Vouchers Table
```
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    voucher_type VARCHAR(50), -- hotel, tour, transfer, flight
    service_id INTEGER,
    voucher_number VARCHAR(100) UNIQUE,
    issued_date TIMESTAMP DEFAULT NOW(),
    pdf_path VARCHAR(255),
    sent_to VARCHAR(255),
    sent_at TIMESTAMP
);
```

### Related Tables Used
- bookings - Main booking record
- booking_hotels - Hotel service details
- booking_tours - Tour service details
- booking_transfers - Transfer service details
- booking_flights - Flight service details
- passengers - List of passengers
- clients - Agent/client info

## Data Flow - What Gets Displayed in Vouchers

### Booking Query (from bookingController.js)
```
SELECT
  b.id,
  b.booking_code,
  b.client_id,
  c.name as client_name,          // AGENT/CLIENT NAME
  c.type as client_type,          // agent or direct
  b.pax_count,
  b.travel_date_from,
  b.travel_date_to,
  b.traveler_name,                // ACTUAL GUEST NAME
  b.traveler_email,               // GUEST EMAIL
  b.traveler_phone,               // GUEST PHONE
  b.booked_by,                    // agent or direct
  b.notes
FROM bookings b
LEFT JOIN clients c ON b.client_id = c.id
```

### Key Data Sources

#### Agent/Client Details
- client_name - From clients.name (agent or company name)
- client_type - From clients.type (agent or direct)
- booked_by - From bookings.booked_by (agent or direct)

#### Guest/Traveler Details
- traveler_name - From bookings.traveler_name
- traveler_email - From bookings.traveler_email
- traveler_phone - From bookings.traveler_phone
- pax_count - From bookings.pax_count

#### Passenger Details
- From passengers table (multiple entries per booking)
- Fields: name, passport_number, nationality, date_of_birth

## Hotel Voucher PDF Content

### Input Data Required:
```javascript
{
  booking: { id, booking_code, client_name, booked_by },
  hotel: { id, hotel_name, check_in, check_out, nights, room_type, 
           number_of_rooms, confirmation_number, notes },
  passengers: [{ name }, { name }],
  voucher_number: string
}
```

### Displayed in PDF:
- Header: FUNNY TOURISM + HOTEL VOUCHER
- Voucher Number (top right)
- Booking Code (top right)
- Date (top right)
- Guest Details: passenger names, check-in, check-out, nights, room type, rooms
- Hotel Details: hotel name, confirmation number
- Special Requests (notes)
- Footer: Terms & Conditions + contact

## Tour Voucher PDF Content

### Input Data Required:
```javascript
{
  booking: { id, booking_code },
  tour: { id, tour_name, tour_date, duration, pax_count, operation_type,
          confirmation_number, notes },
  passengers: [{ name }],
  guide: { name, phone },              // If self-operated
  vehicle: { type, vehicle_number, driver_name, driver_phone },  // If self-operated
  voucher_number: string
}
```

### Displayed in PDF:
- Guest Details: passenger names, pax count, tour date
- Tour Details: tour name, duration, operation type
- Guide & Vehicle Info (if self-operated)
- Special Notes

## Transfer Voucher PDF Content

### Input Data Required:
```javascript
{
  booking: { booking_code },
  transfer: { id, transfer_type, transfer_date, from_location, to_location,
              vehicle_type, pax_count, operation_type, confirmation_number, notes },
  passengers: [{ name }],
  vehicle: { type, vehicle_number, driver_name, driver_phone },
  voucher_number: string
}
```

## Flight Voucher PDF Content

### Input Data Required:
```javascript
{
  booking: { booking_code },
  flight: { id, airline, flight_number, from_airport, to_airport,
            departure_date, arrival_date, pnr, ticket_numbers, notes },
  passengers: [{ name, passport_number }],
  voucher_number: string
}
```

## Current Implementation Status

### Fully Working:
1. Voucher Controller (CRUD operations)
2. Voucher Routes (REST API)
3. PDF Generation Functions (all 4 types)
4. Database schema
5. Voucher number generation (auto-increment)

### NOT Fully Integrated:
1. Frontend VoucherGenerator.jsx has placeholder alerts
2. No API endpoint for actual PDF generation
3. No service layer to orchestrate data fetching + PDF generation
4. Frontend buttons dont call backend functions

## How PDFKit Works

- Library: pdfkit (node_modules/pdfkit)
- Output directory: backend/vouchers/
- Filename pattern: voucher_{type}_{booking_code}_{service_id}.pdf
- Creates PDF stream and writes to file

## Agent vs Client Details Distinction

### Agent Booking (booked_by = agent):
- client_name = Agent/company name
- client_type = agent
- traveler_name = Actual guest name (different from agent)
- Voucher should show: BOTH agent details AND guest details

### Direct Booking (booked_by = direct):
- client_name = Client/guest name
- client_type = direct
- traveler_name = Same or overridden guest name
- Voucher shows: Client details only

## API Endpoints

### Get All Vouchers
GET /api/vouchers?booking_id=5&voucher_type=hotel

### Create Voucher Record
POST /api/vouchers
{
  "booking_id": 5,
  "voucher_type": "hotel",
  "service_id": 12,
  "pdf_path": "/vouchers/hotel-booking-5.pdf",
  "sent_to": "client@example.com"
}

### Update Voucher
PUT /api/vouchers/1
{
  "sent_to": "newemail@example.com",
  "pdf_path": "/vouchers/updated.pdf"
}

### Delete Voucher
DELETE /api/vouchers/1

## Important Notes

1. Voucher metadata is stored in database
2. Actual PDF files are generated by pdfService functions
3. PDF generation is NOT currently called from any API endpoint
4. Frontend integration is incomplete
5. System is ready for implementation but needs wiring together

