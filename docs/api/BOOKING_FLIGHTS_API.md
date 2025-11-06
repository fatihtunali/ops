# Booking Flights API

Base URL: `http://localhost:5000/api/booking-flights`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Booking Flights
**GET** `/api/booking-flights`

**Description:** List all booking flights with optional filters

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID
- `airline` (optional) - Filter by airline (case-insensitive)
- `payment_status` (optional) - Filter by payment status: `pending` or `paid`
- `voucher_issued` (optional) - Filter by voucher issued status: `true` or `false`

**Example Request:**
```bash
curl http://localhost:5000/api/booking-flights?booking_id=1&payment_status=pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "booking_id": 1,
      "airline": "Turkish Airlines",
      "flight_number": "TK1985",
      "departure_date": "15/12/2025 14:30",
      "arrival_date": "15/12/2025 18:45",
      "from_airport": "Istanbul (IST)",
      "to_airport": "London (LHR)",
      "pax_count": 2,
      "cost_price": 800.00,
      "sell_price": 1000.00,
      "margin": 200.00,
      "payment_status": "pending",
      "paid_amount": 0.00,
      "pnr": "ABC123",
      "ticket_numbers": "1234567890, 0987654321",
      "voucher_issued": false,
      "notes": "Window seats requested",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get Single Booking Flight
**GET** `/api/booking-flights/:id`

**Description:** Get a specific booking flight by ID

**Example Request:**
```bash
curl http://localhost:5000/api/booking-flights/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "airline": "Turkish Airlines",
    "flight_number": "TK1985",
    "departure_date": "15/12/2025 14:30",
    "arrival_date": "15/12/2025 18:45",
    "from_airport": "Istanbul (IST)",
    "to_airport": "London (LHR)",
    "pax_count": 2,
    "cost_price": 800.00,
    "sell_price": 1000.00,
    "margin": 200.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "pnr": "ABC123",
    "ticket_numbers": "1234567890, 0987654321",
    "voucher_issued": false,
    "notes": "Window seats requested",
    "created_at": "06/11/2025 18:24"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking flight not found"
  }
}
```

---

### 3. Get Flights by Booking ID
**GET** `/api/booking-flights/booking/:booking_id`

**Description:** Get all flights for a specific booking (ordered by departure date)

**Example Request:**
```bash
curl http://localhost:5000/api/booking-flights/booking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "booking_id": 1,
      "airline": "Turkish Airlines",
      "flight_number": "TK1985",
      "departure_date": "15/12/2025 14:30",
      "arrival_date": "15/12/2025 18:45",
      "from_airport": "Istanbul (IST)",
      "to_airport": "London (LHR)",
      "pax_count": 2,
      "cost_price": 800.00,
      "sell_price": 1000.00,
      "margin": 200.00,
      "payment_status": "pending",
      "paid_amount": 0.00,
      "pnr": "ABC123",
      "ticket_numbers": "1234567890, 0987654321",
      "voucher_issued": false,
      "notes": "Window seats requested",
      "created_at": "06/11/2025 18:24"
    },
    {
      "id": 2,
      "booking_id": 1,
      "airline": "Turkish Airlines",
      "flight_number": "TK1986",
      "departure_date": "22/12/2025 20:15",
      "arrival_date": "23/12/2025 00:30",
      "from_airport": "London (LHR)",
      "to_airport": "Istanbul (IST)",
      "pax_count": 2,
      "cost_price": 750.00,
      "sell_price": 950.00,
      "margin": 200.00,
      "payment_status": "paid",
      "paid_amount": 950.00,
      "pnr": "DEF456",
      "ticket_numbers": "2345678901, 1098765432",
      "voucher_issued": true,
      "notes": "Return flight",
      "created_at": "06/11/2025 18:25"
    }
  ]
}
```

---

### 4. Create Booking Flight
**POST** `/api/booking-flights`

**Description:** Create a new booking flight

**Required Fields:**
- `booking_id` (integer) - Booking ID (must exist in bookings table)

**Optional Fields:**
- `airline` (string) - Airline name
- `flight_number` (string) - Flight number
- `departure_date` (timestamp) - Departure date and time
- `arrival_date` (timestamp) - Arrival date and time
- `from_airport` (string) - Departure airport
- `to_airport` (string) - Arrival airport
- `pax_count` (integer) - Passenger count (must be positive)
- `cost_price` (decimal) - Cost price (must be positive)
- `sell_price` (decimal) - Sell price (must be positive)
- `margin` (decimal) - Margin/profit
- `payment_status` (string) - Payment status: `pending` or `paid` (default: `pending`)
- `paid_amount` (decimal) - Amount paid (must be positive, default: 0)
- `pnr` (string) - Passenger Name Record
- `ticket_numbers` (text) - Ticket numbers (comma-separated)
- `voucher_issued` (boolean) - Whether voucher has been issued (default: false)
- `notes` (text) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/booking-flights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "airline": "Turkish Airlines",
    "flight_number": "TK1985",
    "departure_date": "2025-12-15T14:30:00",
    "arrival_date": "2025-12-15T18:45:00",
    "from_airport": "Istanbul (IST)",
    "to_airport": "London (LHR)",
    "pax_count": 2,
    "cost_price": 800.00,
    "sell_price": 1000.00,
    "margin": 200.00,
    "payment_status": "pending",
    "paid_amount": 0,
    "pnr": "ABC123",
    "ticket_numbers": "1234567890, 0987654321",
    "voucher_issued": false,
    "notes": "Window seats requested"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking flight created successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "airline": "Turkish Airlines",
    "flight_number": "TK1985",
    "departure_date": "15/12/2025 14:30",
    "arrival_date": "15/12/2025 18:45",
    "from_airport": "Istanbul (IST)",
    "to_airport": "London (LHR)",
    "pax_count": 2,
    "cost_price": 800.00,
    "sell_price": 1000.00,
    "margin": 200.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "pnr": "ABC123",
    "ticket_numbers": "1234567890, 0987654321",
    "voucher_issued": false,
    "notes": "Window seats requested",
    "created_at": "06/11/2025 18:24"
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking ID is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking not found"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payment status must be either \"pending\" or \"paid\""
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Passenger count must be a valid positive number"
  }
}
```

---

### 5. Update Booking Flight
**PUT** `/api/booking-flights/:id`

**Description:** Update an existing booking flight

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/booking-flights/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 1000.00,
    "voucher_issued": true,
    "notes": "Payment received, voucher sent"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking flight updated successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "airline": "Turkish Airlines",
    "flight_number": "TK1985",
    "departure_date": "15/12/2025 14:30",
    "arrival_date": "15/12/2025 18:45",
    "from_airport": "Istanbul (IST)",
    "to_airport": "London (LHR)",
    "pax_count": 2,
    "cost_price": 800.00,
    "sell_price": 1000.00,
    "margin": 200.00,
    "payment_status": "paid",
    "paid_amount": 1000.00,
    "pnr": "ABC123",
    "ticket_numbers": "1234567890, 0987654321",
    "voucher_issued": true,
    "notes": "Payment received, voucher sent",
    "created_at": "06/11/2025 18:24"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking flight not found"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No fields to update"
  }
}
```

---

### 6. Delete Booking Flight
**DELETE** `/api/booking-flights/:id`

**Description:** Delete a booking flight (hard delete)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/booking-flights/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking flight deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking flight not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE booking_flights (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    airline VARCHAR(100),
    flight_number VARCHAR(50),
    departure_date TIMESTAMP,
    arrival_date TIMESTAMP,
    from_airport VARCHAR(100),
    to_airport VARCHAR(100),
    pax_count INTEGER,
    cost_price DECIMAL(10,2),
    sell_price DECIMAL(10,2),
    margin DECIMAL(10,2),
    payment_status VARCHAR(30) DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    pnr VARCHAR(50),
    ticket_numbers TEXT,
    voucher_issued BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_flight_payment_status CHECK (payment_status IN ('pending', 'paid'))
);

CREATE INDEX idx_booking_flights_booking ON booking_flights(booking_id);
```

---

## Field Validations

- **booking_id:** Required, must be a valid booking ID that exists in the bookings table
- **airline:** Optional, max 100 characters
- **flight_number:** Optional, max 50 characters
- **departure_date:** Optional, TIMESTAMP format (ISO 8601)
- **arrival_date:** Optional, TIMESTAMP format (ISO 8601)
- **from_airport:** Optional, max 100 characters
- **to_airport:** Optional, max 100 characters
- **pax_count:** Optional, must be a positive integer
- **cost_price:** Optional, must be a positive decimal (10,2)
- **sell_price:** Optional, must be a positive decimal (10,2)
- **margin:** Optional, decimal (10,2)
- **payment_status:** Must be either 'pending' or 'paid' (default: 'pending')
- **paid_amount:** Optional, must be a positive decimal (10,2) (default: 0)
- **pnr:** Optional, max 50 characters
- **ticket_numbers:** Optional, text field for comma-separated ticket numbers
- **voucher_issued:** Boolean (default: false)
- **notes:** Optional, text field

---

## Date Formatting

All date fields are returned in the format: `dd/mm/yyyy hh:mm`

When creating or updating, dates should be sent in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss`

Examples:
- Input: `2025-12-15T14:30:00`
- Output: `15/12/2025 14:30`

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Booking flight not found
- `FOREIGN_KEY_ERROR` (400) - Invalid booking ID reference
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Booking ID
```bash
curl "http://localhost:5000/api/booking-flights?booking_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Airline and Payment Status
```bash
curl "http://localhost:5000/api/booking-flights?airline=Turkish%20Airlines&payment_status=paid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Voucher Issued Status
```bash
curl "http://localhost:5000/api/booking-flights?voucher_issued=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Flight with Minimal Data
```bash
curl -X POST http://localhost:5000/api/booking-flights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "airline": "Emirates",
    "flight_number": "EK001"
  }'
```

### Update Payment Status
```bash
curl -X PUT http://localhost:5000/api/booking-flights/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 1000.00
  }'
```

### Mark Voucher as Issued
```bash
curl -X PUT http://localhost:5000/api/booking-flights/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "voucher_issued": true
  }'
```

---

## Notes

- All booking flights are automatically deleted when the parent booking is deleted (CASCADE)
- The `margin` field is typically calculated as `sell_price - cost_price`
- The `payment_status` can only be 'pending' or 'paid' (database constraint)
- Use the `/booking/:booking_id` endpoint to get all flights for a specific booking
- Dates are stored as TIMESTAMP in the database and formatted as dd/mm/yyyy hh:mm in responses

---

**Last Updated:** 2025-12-06
