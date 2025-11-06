# Booking Management API

Base URL: `http://localhost:5000/api/bookings`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Bookings
**GET** `/api/bookings`

**Description:** List all bookings with optional filters

**Query Parameters:**
- `status` (optional) - Filter by booking status: `inquiry`, `quoted`, `confirmed`, `completed`, `cancelled`
- `is_confirmed` (optional) - Filter by confirmation status: `true` or `false`
- `client_id` (optional) - Filter by client ID (integer)
- `travel_date_from` (optional) - Filter bookings with travel_date_from >= this date (YYYY-MM-DD)
- `travel_date_to` (optional) - Filter bookings with travel_date_to <= this date (YYYY-MM-DD)

**Example Request:**
```bash
curl http://localhost:5000/api/bookings?status=confirmed&is_confirmed=true \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_code": "Funny-1046",
      "client_id": 5,
      "client_name": "ABC Travel Agency",
      "pax_count": 12,
      "travel_date_from": "15/12/2025",
      "travel_date_to": "22/12/2025",
      "status": "confirmed",
      "is_confirmed": true,
      "total_sell_price": 15000.00,
      "total_cost_price": 12000.00,
      "gross_profit": 3000.00,
      "payment_status": "partial",
      "amount_received": 7500.00,
      "created_at": "06/11/2025 18:24",
      "confirmed_at": "08/11/2025 10:30",
      "completed_at": null,
      "notes": "Christmas tour package - VIP group"
    }
  ],
  "count": 1
}
```

---

### 2. Get Single Booking
**GET** `/api/bookings/:id`

**Description:** Get a specific booking by ID with client details

**Example Request:**
```bash
curl http://localhost:5000/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_code": "Funny-1046",
    "client_id": 5,
    "client_name": "ABC Travel Agency",
    "pax_count": 12,
    "travel_date_from": "15/12/2025",
    "travel_date_to": "22/12/2025",
    "status": "confirmed",
    "is_confirmed": true,
    "total_sell_price": 15000.00,
    "total_cost_price": 12000.00,
    "gross_profit": 3000.00,
    "payment_status": "partial",
    "amount_received": 7500.00,
    "created_at": "06/11/2025 18:24",
    "confirmed_at": "08/11/2025 10:30",
    "completed_at": null,
    "notes": "Christmas tour package - VIP group"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

### 3. Create Booking
**POST** `/api/bookings`

**Description:** Create a new booking (booking_code is auto-generated using `generate_booking_code()` function)

**Required Fields:**
- None (all fields are optional)

**Optional Fields:**
- `client_id` (integer) - Reference to client (must exist)
- `pax_count` (integer) - Number of passengers (default: null)
- `travel_date_from` (date) - Travel start date in YYYY-MM-DD format
- `travel_date_to` (date) - Travel end date in YYYY-MM-DD format (must be >= travel_date_from)
- `status` (string) - Booking status: `inquiry`, `quoted`, `confirmed`, `completed`, `cancelled` (default: `inquiry`)
- `is_confirmed` (boolean) - Confirmation flag (default: `false`)
- `total_sell_price` (decimal) - Total selling price (default: 0)
- `total_cost_price` (decimal) - Total cost price (default: 0)
- `gross_profit` (decimal) - Gross profit (default: 0)
- `payment_status` (string) - Payment status: `pending`, `partial`, `paid` (default: `pending`)
- `amount_received` (decimal) - Amount received from client (default: 0)
- `notes` (text) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "client_id": 5,
    "pax_count": 12,
    "travel_date_from": "2025-12-15",
    "travel_date_to": "2025-12-22",
    "status": "inquiry",
    "is_confirmed": false,
    "notes": "Christmas tour package - awaiting confirmation"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "booking_code": "Funny-1046",
    "client_id": 5,
    "pax_count": 12,
    "travel_date_from": "15/12/2025",
    "travel_date_to": "22/12/2025",
    "status": "inquiry",
    "is_confirmed": false,
    "total_sell_price": 0.00,
    "total_cost_price": 0.00,
    "gross_profit": 0.00,
    "payment_status": "pending",
    "amount_received": 0.00,
    "created_at": "06/11/2025 18:24",
    "confirmed_at": null,
    "completed_at": null,
    "notes": "Christmas tour package - awaiting confirmation"
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid client_id - client does not exist"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Status must be one of: inquiry, quoted, confirmed, completed, cancelled"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Travel date to must be after or equal to travel date from"
  }
}
```

---

### 4. Update Booking
**PUT** `/api/bookings/:id`

**Description:** Update an existing booking

**All fields are optional** - only send fields you want to update

**Special Behavior:**
- When `status` is set to `confirmed` AND `is_confirmed` is `true`, the `confirmed_at` timestamp is automatically set to NOW()
- When `status` is set to `completed`, the `completed_at` timestamp is automatically set to NOW()

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/bookings/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "confirmed",
    "is_confirmed": true,
    "total_sell_price": 15000.00,
    "total_cost_price": 12000.00,
    "gross_profit": 3000.00,
    "payment_status": "partial",
    "amount_received": 7500.00
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "id": 1,
    "booking_code": "Funny-1046",
    "client_id": 5,
    "pax_count": 12,
    "travel_date_from": "15/12/2025",
    "travel_date_to": "22/12/2025",
    "status": "confirmed",
    "is_confirmed": true,
    "total_sell_price": 15000.00,
    "total_cost_price": 12000.00,
    "gross_profit": 3000.00,
    "payment_status": "partial",
    "amount_received": 7500.00,
    "created_at": "06/11/2025 18:24",
    "confirmed_at": "06/11/2025 18:30",
    "completed_at": null,
    "notes": "Christmas tour package - awaiting confirmation"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

### 5. Delete Booking (Soft Delete)
**DELETE** `/api/bookings/:id`

**Description:** Soft delete a booking (sets status to 'cancelled')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking deleted successfully (status set to cancelled)"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: Funny-1046
    client_id INTEGER REFERENCES clients(id),
    pax_count INTEGER, -- number of passengers
    travel_date_from DATE,
    travel_date_to DATE,

    -- Status tracking
    status VARCHAR(30) NOT NULL DEFAULT 'inquiry',
    is_confirmed BOOLEAN DEFAULT FALSE, -- only TRUE bookings appear in finance

    -- Pricing (totals calculated from services)
    total_sell_price DECIMAL(12,2) DEFAULT 0,
    total_cost_price DECIMAL(12,2) DEFAULT 0,
    gross_profit DECIMAL(12,2) DEFAULT 0,

    -- Payment tracking
    payment_status VARCHAR(30) DEFAULT 'pending',
    amount_received DECIMAL(12,2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,

    CONSTRAINT chk_booking_status CHECK (status IN ('inquiry', 'quoted', 'confirmed', 'completed', 'cancelled')),
    CONSTRAINT chk_payment_status CHECK (payment_status IN ('pending', 'partial', 'paid'))
);

-- Auto-generate booking codes
CREATE SEQUENCE booking_code_seq START WITH 1000;

CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    new_code VARCHAR(50);
BEGIN
    next_number := nextval('booking_code_seq');
    new_code := 'Funny-' || next_number;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;
```

---

## Field Validations

### Required Fields
- `booking_code` - Auto-generated using `generate_booking_code()` function (format: Funny-XXXX)

### Optional Fields
- `client_id` - Must reference an existing client
- `pax_count` - Must be a non-negative integer
- `travel_date_from` - Date in YYYY-MM-DD format
- `travel_date_to` - Date in YYYY-MM-DD format (must be >= travel_date_from if both dates provided)
- `status` - Must be one of: `inquiry`, `quoted`, `confirmed`, `completed`, `cancelled`
- `is_confirmed` - Boolean (true/false)
- `total_sell_price` - Decimal (12,2) - defaults to 0
- `total_cost_price` - Decimal (12,2) - defaults to 0
- `gross_profit` - Decimal (12,2) - defaults to 0
- `payment_status` - Must be one of: `pending`, `partial`, `paid`
- `amount_received` - Decimal (12,2) - defaults to 0
- `notes` - Text field for additional information

---

## Booking Status Workflow

1. **inquiry** - Initial inquiry from client
2. **quoted** - Quote/proposal sent to client
3. **confirmed** - Booking confirmed by client (set `is_confirmed: true`)
4. **completed** - Booking completed/tour finished
5. **cancelled** - Booking cancelled (soft delete)

---

## Payment Status

- **pending** - No payment received
- **partial** - Partial payment received
- **paid** - Full payment received

---

## Date Formatting

All dates in responses are formatted according to company standards:
- **Dates:** `dd/mm/yyyy` format (e.g., "15/12/2025")
- **Timestamps:** `dd/mm/yyyy hh:mm` format (e.g., "06/11/2025 18:24")

When sending dates to the API, use ISO format: `YYYY-MM-DD` (e.g., "2025-12-15")

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
  - Invalid client_id
  - Invalid status
  - Invalid payment_status
  - Invalid pax_count
  - Invalid date range
  - No fields to update
- `NOT_FOUND` (404) - Booking not found
- `INTERNAL_ERROR` (500) - Server error

---

## Filter Examples

### Get all confirmed bookings
```bash
curl http://localhost:5000/api/bookings?status=confirmed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get all bookings for a specific client
```bash
curl http://localhost:5000/api/bookings?client_id=5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get confirmed bookings that are financially confirmed
```bash
curl http://localhost:5000/api/bookings?status=confirmed&is_confirmed=true \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get bookings for a specific date range
```bash
curl "http://localhost:5000/api/bookings?travel_date_from=2025-12-01&travel_date_to=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get all cancelled bookings
```bash
curl http://localhost:5000/api/bookings?status=cancelled \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Response Fields Description

- **id** - Unique booking identifier (auto-increment)
- **booking_code** - Unique booking code (format: Funny-XXXX)
- **client_id** - Reference to client table
- **client_name** - Client name (joined from clients table)
- **pax_count** - Number of passengers
- **travel_date_from** - Travel start date
- **travel_date_to** - Travel end date
- **status** - Current booking status
- **is_confirmed** - Whether booking is financially confirmed
- **total_sell_price** - Total selling price to client
- **total_cost_price** - Total cost from suppliers
- **gross_profit** - Calculated profit (sell_price - cost_price)
- **payment_status** - Current payment status
- **amount_received** - Amount paid by client
- **created_at** - When booking was created
- **confirmed_at** - When booking was confirmed (auto-set when status=confirmed and is_confirmed=true)
- **completed_at** - When booking was completed (auto-set when status=completed)
- **notes** - Additional notes and comments

---

## Best Practices

1. **Creating Bookings:**
   - Start with status `inquiry`
   - Set `is_confirmed: false` initially
   - Add client_id if known, otherwise leave null

2. **Confirming Bookings:**
   - Update status to `confirmed`
   - Set `is_confirmed: true`
   - This automatically sets `confirmed_at` timestamp

3. **Completing Bookings:**
   - Update status to `completed`
   - This automatically sets `completed_at` timestamp
   - Ensure payment_status is `paid` if full payment received

4. **Cancelling Bookings:**
   - Use DELETE endpoint (soft delete)
   - This sets status to `cancelled`
   - Original booking data is preserved

5. **Financial Tracking:**
   - Only bookings with `is_confirmed: true` should appear in financial reports
   - Update `amount_received` as payments come in
   - Update `payment_status` accordingly (pending → partial → paid)

---

**Last Updated:** 2025-11-06
