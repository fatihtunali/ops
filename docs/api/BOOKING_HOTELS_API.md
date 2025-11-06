# Booking Hotels API

Base URL: `http://localhost:5000/api/booking-hotels`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Booking Hotels
**GET** `/api/booking-hotels`

**Description:** List all booking hotels with optional filters

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID
- `payment_status` (optional) - Filter by payment status: `pending` or `paid`
- `check_in_from` (optional) - Filter by check-in date from (format: yyyy-mm-dd)
- `check_in_to` (optional) - Filter by check-in date to (format: yyyy-mm-dd)

**Example Request:**
```bash
curl "http://localhost:5000/api/booking-hotels?booking_id=1&payment_status=pending" \
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
      "hotel_id": 5,
      "hotel_name": "Grand Hotel Istanbul",
      "check_in": "15/12/2025",
      "check_out": "18/12/2025",
      "nights": 3,
      "room_type": "Deluxe Double",
      "number_of_rooms": 2,
      "cost_per_night": 150.00,
      "total_cost": 900.00,
      "sell_price": 1200.00,
      "margin": 300.00,
      "payment_status": "pending",
      "paid_amount": 0.00,
      "payment_due_date": "10/12/2025",
      "confirmation_number": "HTL123456",
      "voucher_issued": false,
      "notes": "Sea view rooms requested",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get Single Booking Hotel
**GET** `/api/booking-hotels/:id`

**Description:** Get a specific booking hotel by ID

**Example Request:**
```bash
curl http://localhost:5000/api/booking-hotels/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "hotel_id": 5,
    "hotel_name": "Grand Hotel Istanbul",
    "check_in": "15/12/2025",
    "check_out": "18/12/2025",
    "nights": 3,
    "room_type": "Deluxe Double",
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00,
    "margin": 300.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "payment_due_date": "10/12/2025",
    "confirmation_number": "HTL123456",
    "voucher_issued": false,
    "notes": "Sea view rooms requested",
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
    "message": "Booking hotel not found"
  }
}
```

---

### 3. Create Booking Hotel
**POST** `/api/booking-hotels`

**Description:** Create a new booking hotel record

**Required Fields:**
- `booking_id` (integer) - Reference to booking (must exist in bookings table)

**Optional Fields:**
- `hotel_id` (integer) - Reference to hotel (if provided, hotel_name will be fetched automatically)
- `hotel_name` (string) - Hotel name (stored for historical accuracy)
- `check_in` (date) - Check-in date (format: yyyy-mm-dd)
- `check_out` (date) - Check-out date (format: yyyy-mm-dd)
- `nights` (integer) - Number of nights (must be positive)
- `room_type` (string) - Room type (e.g., "Deluxe Double", "Suite")
- `number_of_rooms` (integer) - Number of rooms (must be at least 1)
- `cost_per_night` (decimal) - Cost per night (must be positive)
- `total_cost` (decimal) - Total cost (must be positive)
- `sell_price` (decimal) - Sell price to client (must be positive)
- `payment_status` (string) - Payment status: `pending` or `paid` (default: `pending`)
- `paid_amount` (decimal) - Amount paid (default: 0.00)
- `payment_due_date` (date) - Payment due date (format: yyyy-mm-dd)
- `confirmation_number` (string) - Hotel confirmation number
- `voucher_issued` (boolean) - Whether voucher has been issued (default: false)
- `notes` (text) - Additional notes

**Auto-calculated Fields:**
- `margin` - Automatically calculated as: sell_price - total_cost (when both are provided)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/booking-hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "hotel_id": 5,
    "check_in": "2025-12-15",
    "check_out": "2025-12-18",
    "nights": 3,
    "room_type": "Deluxe Double",
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00,
    "payment_due_date": "2025-12-10",
    "confirmation_number": "HTL123456",
    "notes": "Sea view rooms requested"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking hotel created successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "hotel_id": 5,
    "hotel_name": "Grand Hotel Istanbul",
    "check_in": "15/12/2025",
    "check_out": "18/12/2025",
    "nights": 3,
    "room_type": "Deluxe Double",
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00,
    "margin": 300.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "payment_due_date": "10/12/2025",
    "confirmation_number": "HTL123456",
    "voucher_issued": false,
    "notes": "Sea view rooms requested",
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
    "message": "booking_id is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking with the specified booking_id does not exist"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "payment_status must be either \"pending\" or \"paid\""
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "sell_price must be a valid positive number"
  }
}
```

**Foreign Key Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "FOREIGN_KEY_ERROR",
    "message": "Invalid booking_id or hotel_id reference"
  }
}
```

---

### 4. Update Booking Hotel
**PUT** `/api/booking-hotels/:id`

**Description:** Update an existing booking hotel record

**All fields are optional** - only send fields you want to update

**Auto-calculation:**
- If `total_cost` or `sell_price` is updated, `margin` will be recalculated automatically
- If `hotel_id` is updated without `hotel_name`, the hotel name will be fetched from the hotels table

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/booking-hotels/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 1200.00,
    "voucher_issued": true,
    "notes": "Payment received. Sea view rooms confirmed."
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking hotel updated successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "hotel_id": 5,
    "hotel_name": "Grand Hotel Istanbul",
    "check_in": "15/12/2025",
    "check_out": "18/12/2025",
    "nights": 3,
    "room_type": "Deluxe Double",
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00,
    "margin": 300.00,
    "payment_status": "paid",
    "paid_amount": 1200.00,
    "payment_due_date": "10/12/2025",
    "confirmation_number": "HTL123456",
    "voucher_issued": true,
    "notes": "Payment received. Sea view rooms confirmed.",
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
    "message": "Booking hotel not found"
  }
}
```

**Example: Update Pricing and Recalculate Margin**
```bash
curl -X PUT http://localhost:5000/api/booking-hotels/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sell_price": 1350.00
  }'
```

This will automatically recalculate margin: 1350.00 - 900.00 = 450.00

---

### 5. Delete Booking Hotel
**DELETE** `/api/booking-hotels/:id`

**Description:** Delete a booking hotel record (hard delete)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/booking-hotels/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking hotel deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking hotel not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE booking_hotels (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    hotel_id INTEGER REFERENCES hotels(id),
    hotel_name VARCHAR(255), -- stored for historical accuracy

    check_in DATE,
    check_out DATE,
    nights INTEGER,
    room_type VARCHAR(100),
    number_of_rooms INTEGER,

    -- Pricing
    cost_per_night DECIMAL(10,2),
    total_cost DECIMAL(10,2), -- cost * nights * rooms
    sell_price DECIMAL(10,2), -- what you charge client
    margin DECIMAL(10,2), -- sell_price - total_cost

    -- Supplier payment tracking
    payment_status VARCHAR(30) DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_due_date DATE,

    confirmation_number VARCHAR(100),
    voucher_issued BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT chk_hotel_payment_status CHECK (payment_status IN ('pending', 'paid'))
);
```

---

## Field Validations

- **booking_id:** Required, must reference existing booking
- **hotel_id:** Optional, must reference existing hotel if provided
- **hotel_name:** Optional, auto-fetched from hotels table when hotel_id is provided
- **nights:** Optional, must be positive integer
- **number_of_rooms:** Optional, must be at least 1
- **cost_per_night:** Optional, must be positive number
- **total_cost:** Optional, must be positive number
- **sell_price:** Optional, must be positive number
- **margin:** Auto-calculated (sell_price - total_cost)
- **payment_status:** Must be either 'pending' or 'paid'
- **paid_amount:** Optional, must be positive number
- **check_in, check_out, payment_due_date:** Date format: yyyy-mm-dd (stored), displayed as dd/mm/yyyy

---

## Auto-calculation Features

1. **Margin Calculation:**
   - Automatically calculated when both `sell_price` and `total_cost` are provided
   - Formula: `margin = sell_price - total_cost`
   - Recalculated on update when either `sell_price` or `total_cost` changes

2. **Hotel Name Lookup:**
   - When `hotel_id` is provided without `hotel_name`, the hotel name is automatically fetched from the hotels table
   - This ensures historical accuracy (hotel name is stored, so it won't change if the hotel is renamed later)

---

## Date Formatting

**Input Format (for API requests):**
- Dates: `yyyy-mm-dd` (e.g., "2025-12-15")

**Output Format (in API responses):**
- Dates: `dd/mm/yyyy` (e.g., "15/12/2025")
- Timestamps: `dd/mm/yyyy hh:mm` (e.g., "06/11/2025 18:24")

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data or missing required fields
- `NOT_FOUND` (404) - Booking hotel not found
- `FOREIGN_KEY_ERROR` (400) - Invalid booking_id or hotel_id reference
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Booking ID
```bash
curl "http://localhost:5000/api/booking-hotels?booking_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Payment Status
```bash
curl "http://localhost:5000/api/booking-hotels?payment_status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Check-in Date Range
```bash
curl "http://localhost:5000/api/booking-hotels?check_in_from=2025-12-01&check_in_to=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create with Hotel Reference (Auto-fetch Hotel Name)
```bash
curl -X POST http://localhost:5000/api/booking-hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "hotel_id": 5,
    "check_in": "2025-12-15",
    "check_out": "2025-12-18",
    "nights": 3,
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00
  }'
```
Note: `hotel_name` will be automatically fetched from hotels table (id=5)

### Create with Manual Hotel Name (No Hotel Reference)
```bash
curl -X POST http://localhost:5000/api/booking-hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "hotel_name": "Custom Hotel Name",
    "check_in": "2025-12-15",
    "check_out": "2025-12-18",
    "nights": 3,
    "number_of_rooms": 2,
    "cost_per_night": 150.00,
    "total_cost": 900.00,
    "sell_price": 1200.00
  }'
```

### Mark as Paid
```bash
curl -X PUT http://localhost:5000/api/booking-hotels/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 1200.00
  }'
```

### Update Pricing (Auto-recalculate Margin)
```bash
curl -X PUT http://localhost:5000/api/booking-hotels/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "total_cost": 850.00,
    "sell_price": 1300.00
  }'
```
Result: `margin` will be recalculated to 450.00

---

## Integration Notes

1. **Cascade Delete:** When a booking is deleted, all associated booking_hotels records are automatically deleted (ON DELETE CASCADE)

2. **Historical Accuracy:** The `hotel_name` field is stored to preserve the hotel name at the time of booking, even if the hotel is renamed or deleted later

3. **Payment Tracking:** Use `payment_status`, `paid_amount`, and `payment_due_date` to track supplier payments separately from client payments

4. **Voucher Management:** Use `voucher_issued` flag to track whether hotel vouchers have been sent to the client

---

**Last Updated:** 2025-11-06
