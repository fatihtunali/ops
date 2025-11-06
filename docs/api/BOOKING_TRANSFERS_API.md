# Booking Transfers Management API

Base URL: `http://localhost:5000/api/booking-transfers`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Booking Transfers
**GET** `/api/booking-transfers`

**Description:** List all booking transfers with optional filters

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID
- `operation_type` (optional) - Filter by operation type: `supplier` or `self-operated`
- `payment_status` (optional) - Filter by payment status: `pending` or `paid`

**Example Request:**
```bash
curl "http://localhost:5000/api/booking-transfers?booking_id=1&payment_status=pending" \
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
      "transfer_type": "Airport Transfer",
      "transfer_date": "2025-12-15",
      "from_location": "Istanbul Airport (IST)",
      "to_location": "Sultanahmet Hotel",
      "pax_count": 4,
      "vehicle_type": "Vito",
      "operation_type": "self-operated",
      "supplier_id": null,
      "vehicle_id": 1,
      "cost_price": 50.00,
      "sell_price": 80.00,
      "margin": 30.00,
      "payment_status": "pending",
      "paid_amount": 0.00,
      "confirmation_number": "TRF-2025-001",
      "voucher_issued": false,
      "notes": "Early morning pickup required",
      "supplier_name": null,
      "vehicle_number": "34 ABC 123",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get All Transfers for a Specific Booking
**GET** `/api/booking-transfers/booking/:bookingId`

**Description:** Get all transfers associated with a specific booking

**Example Request:**
```bash
curl http://localhost:5000/api/booking-transfers/booking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "booking_id": 1,
      "transfer_type": "Airport Transfer - Arrival",
      "transfer_date": "2025-12-15",
      "from_location": "Istanbul Airport (IST)",
      "to_location": "Sultanahmet Hotel",
      "pax_count": 4,
      "vehicle_type": "Vito",
      "operation_type": "self-operated",
      "supplier_id": null,
      "vehicle_id": 1,
      "cost_price": 50.00,
      "sell_price": 80.00,
      "margin": 30.00,
      "payment_status": "paid",
      "paid_amount": 80.00,
      "confirmation_number": "TRF-2025-001",
      "voucher_issued": true,
      "notes": "Early morning pickup required",
      "supplier_name": null,
      "vehicle_number": "34 ABC 123",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 3. Get Single Booking Transfer
**GET** `/api/booking-transfers/:id`

**Description:** Get a specific booking transfer by ID

**Example Request:**
```bash
curl http://localhost:5000/api/booking-transfers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "transfer_type": "Airport Transfer",
    "transfer_date": "2025-12-15",
    "from_location": "Istanbul Airport (IST)",
    "to_location": "Sultanahmet Hotel",
    "pax_count": 4,
    "vehicle_type": "Vito",
    "operation_type": "self-operated",
    "supplier_id": null,
    "vehicle_id": 1,
    "cost_price": 50.00,
    "sell_price": 80.00,
    "margin": 30.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "confirmation_number": "TRF-2025-001",
    "voucher_issued": false,
    "notes": "Early morning pickup required",
    "supplier_name": null,
    "vehicle_number": "34 ABC 123",
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
    "message": "Booking transfer not found"
  }
}
```

---

### 4. Create Booking Transfer
**POST** `/api/booking-transfers`

**Description:** Create a new booking transfer

**Required Fields:**
- `booking_id` (integer) - ID of the associated booking
- `operation_type` (string) - Operation type: `supplier` or `self-operated`

**Optional Fields:**
- `transfer_type` (string) - Type of transfer (e.g., "Airport Transfer", "Hotel Transfer")
- `transfer_date` (date) - Date of transfer (YYYY-MM-DD)
- `from_location` (string) - Pickup location
- `to_location` (string) - Drop-off location
- `pax_count` (integer) - Number of passengers
- `vehicle_type` (string) - Type of vehicle needed
- `supplier_id` (integer) - ID of tour supplier (for supplier operations)
- `vehicle_id` (integer) - ID of vehicle (for self-operated)
- `cost_price` (decimal) - Cost price
- `sell_price` (decimal) - Selling price
- `margin` (decimal) - Profit margin
- `payment_status` (string) - Payment status: `pending` or `paid` (default: `pending`)
- `paid_amount` (decimal) - Amount paid (default: 0)
- `confirmation_number` (string) - Confirmation number
- `voucher_issued` (boolean) - Whether voucher is issued (default: false)
- `notes` (string) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/booking-transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "transfer_type": "Airport Transfer - Arrival",
    "transfer_date": "2025-12-15",
    "from_location": "Istanbul Airport (IST)",
    "to_location": "Sultanahmet Hotel",
    "pax_count": 4,
    "vehicle_type": "Vito",
    "operation_type": "self-operated",
    "vehicle_id": 1,
    "cost_price": 50.00,
    "sell_price": 80.00,
    "margin": 30.00,
    "notes": "Early morning pickup required"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking transfer created successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "transfer_type": "Airport Transfer - Arrival",
    "transfer_date": "2025-12-15",
    "from_location": "Istanbul Airport (IST)",
    "to_location": "Sultanahmet Hotel",
    "pax_count": 4,
    "vehicle_type": "Vito",
    "operation_type": "self-operated",
    "supplier_id": null,
    "vehicle_id": 1,
    "cost_price": 50.00,
    "sell_price": 80.00,
    "margin": 30.00,
    "payment_status": "pending",
    "paid_amount": 0.00,
    "confirmation_number": null,
    "voucher_issued": false,
    "notes": "Early morning pickup required",
    "created_at": "06/11/2025 18:24"
  }
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking ID is required"
  }
}
```

**Invalid Operation Type Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid operation type. Must be: supplier or self-operated"
  }
}
```

**Referenced Entity Not Found Error (404 Not Found):**
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

### 5. Update Booking Transfer
**PUT** `/api/booking-transfers/:id`

**Description:** Update an existing booking transfer

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/booking-transfers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 80.00,
    "voucher_issued": true,
    "confirmation_number": "TRF-2025-001"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking transfer updated successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "transfer_type": "Airport Transfer - Arrival",
    "transfer_date": "2025-12-15",
    "from_location": "Istanbul Airport (IST)",
    "to_location": "Sultanahmet Hotel",
    "pax_count": 4,
    "vehicle_type": "Vito",
    "operation_type": "self-operated",
    "supplier_id": null,
    "vehicle_id": 1,
    "cost_price": 50.00,
    "sell_price": 80.00,
    "margin": 30.00,
    "payment_status": "paid",
    "paid_amount": 80.00,
    "confirmation_number": "TRF-2025-001",
    "voucher_issued": true,
    "notes": "Early morning pickup required",
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
    "message": "Booking transfer not found"
  }
}
```

---

### 6. Delete Booking Transfer
**DELETE** `/api/booking-transfers/:id`

**Description:** Delete a booking transfer (hard delete)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/booking-transfers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking transfer deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking transfer not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE booking_transfers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    transfer_type VARCHAR(50),
    transfer_date DATE,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    pax_count INTEGER,
    vehicle_type VARCHAR(100),
    operation_type VARCHAR(20) NOT NULL,
    supplier_id INTEGER REFERENCES tour_suppliers(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    cost_price DECIMAL(10,2),
    sell_price DECIMAL(10,2),
    margin DECIMAL(10,2),
    payment_status VARCHAR(30) DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    confirmation_number VARCHAR(100),
    voucher_issued BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_transfer_operation_type CHECK (operation_type IN ('supplier', 'self-operated')),
    CONSTRAINT chk_transfer_payment_status CHECK (payment_status IN ('pending', 'paid'))
);
```

---

## Field Validations

- **booking_id:** Required, must reference existing booking
- **transfer_type:** Optional, max 50 characters
- **transfer_date:** Optional, date format (YYYY-MM-DD)
- **from_location:** Optional, max 255 characters
- **to_location:** Optional, max 255 characters
- **pax_count:** Optional, integer
- **vehicle_type:** Optional, max 100 characters
- **operation_type:** Required, must be 'supplier' or 'self-operated'
- **supplier_id:** Optional, must reference existing supplier
- **vehicle_id:** Optional, must reference existing vehicle
- **cost_price:** Optional, decimal(10,2)
- **sell_price:** Optional, decimal(10,2)
- **margin:** Optional, decimal(10,2)
- **payment_status:** Must be 'pending' or 'paid' (default: 'pending')
- **paid_amount:** Optional, decimal(10,2) (default: 0)
- **confirmation_number:** Optional, max 100 characters
- **voucher_issued:** Optional, boolean (default: false)
- **notes:** Optional, text field

---

## Operation Types

- `supplier` - Transfer service provided by external supplier
- `self-operated` - Transfer service operated with own vehicles

---

## Payment Status Values

- `pending` - Payment not yet received
- `paid` - Payment received in full

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Booking transfer, booking, supplier, or vehicle not found
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Booking
```bash
curl "http://localhost:5000/api/booking-transfers?booking_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Operation Type
```bash
curl "http://localhost:5000/api/booking-transfers?operation_type=self-operated" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Payment Status
```bash
curl "http://localhost:5000/api/booking-transfers?payment_status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get All Transfers for a Booking
```bash
curl http://localhost:5000/api/booking-transfers/booking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Transfer with Supplier
```bash
curl -X POST http://localhost:5000/api/booking-transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "transfer_type": "Private Tour Transfer",
    "transfer_date": "2025-12-16",
    "from_location": "Hotel",
    "to_location": "Ephesus",
    "pax_count": 6,
    "vehicle_type": "Minibus",
    "operation_type": "supplier",
    "supplier_id": 5,
    "cost_price": 150.00,
    "sell_price": 220.00,
    "margin": 70.00
  }'
```

### Create Self-Operated Transfer
```bash
curl -X POST http://localhost:5000/api/booking-transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "transfer_type": "Airport Transfer",
    "transfer_date": "2025-12-20",
    "from_location": "Hotel",
    "to_location": "Istanbul Airport (IST)",
    "pax_count": 4,
    "vehicle_type": "Vito",
    "operation_type": "self-operated",
    "vehicle_id": 1,
    "cost_price": 50.00,
    "sell_price": 80.00,
    "margin": 30.00
  }'
```

### Update Payment Status
```bash
curl -X PUT http://localhost:5000/api/booking-transfers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_status": "paid",
    "paid_amount": 80.00
  }'
```

### Issue Voucher
```bash
curl -X PUT http://localhost:5000/api/booking-transfers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "voucher_issued": true,
    "confirmation_number": "TRF-2025-001"
  }'
```

### Update Transfer Details
```bash
curl -X PUT http://localhost:5000/api/booking-transfers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transfer_date": "2025-12-15",
    "pax_count": 5,
    "notes": "Pickup time changed to 08:00 AM"
  }'
```

---

## Common Transfer Types

- Airport Transfer - Arrival
- Airport Transfer - Departure
- Hotel Transfer
- Inter-city Transfer
- Private Tour Transfer
- Shuttle Service
- Port Transfer

---

## Common Vehicle Types

- Vito (4 passengers) - Max 4 pax
- Minibus (04-12 passengers) - Max 12 pax
- Isuzu (12-20 passengers) - Max 20 pax
- Coach (30-46 passengers) - Max 44 pax

---

## Business Logic Notes

### Supplier vs Self-Operated
- **Supplier:** Use when transfer is outsourced to a supplier
  - Requires `supplier_id`
  - `vehicle_id` is typically null
- **Self-Operated:** Use when using own vehicles
  - Requires `vehicle_id`
  - `supplier_id` is typically null

### Pricing
- **cost_price:** Your cost for the service
- **sell_price:** Price charged to customer
- **margin:** Profit (typically sell_price - cost_price)

### Payment Tracking
- **payment_status:** Track if payment is pending or paid
- **paid_amount:** Track partial or full payments
- **voucher_issued:** Track if voucher has been issued to customer/supplier

### Cascade Deletion
- When a booking is deleted, all associated transfers are automatically deleted (ON DELETE CASCADE)

---

**Last Updated:** 2025-12-06
