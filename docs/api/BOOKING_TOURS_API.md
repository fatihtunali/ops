# Booking Tours API

Base URL: `http://localhost:5000/api/booking-tours`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Booking Tours
**GET** `/api/booking-tours`

**Description:** List all booking tours with optional filters and pagination

**Query Parameters:**
- `booking_id` (optional) - Filter by specific booking ID
- `operation_type` (optional) - Filter by operation type: `supplier` or `self-operated`
- `payment_status` (optional) - Filter by payment status: `pending` or `paid`
- `tour_date_from` (optional) - Filter tours from this date (YYYY-MM-DD)
- `tour_date_to` (optional) - Filter tours until this date (YYYY-MM-DD)
- `search` (optional) - Search in tour_name, confirmation_number, or notes
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example Request:**
```bash
curl "http://localhost:5000/api/booking-tours?operation_type=supplier&payment_status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": 5,
      "tour_name": "Ephesus Ancient City Tour",
      "tour_date": "2025-12-15",
      "duration": "Full Day",
      "pax_count": 4,
      "operation_type": "supplier",
      "supplier_id": 2,
      "supplier_name": "Museum Tours Turkey",
      "supplier_cost": "250.00",
      "guide_id": null,
      "guide_name": null,
      "guide_cost": "0.00",
      "vehicle_id": null,
      "vehicle_plate": null,
      "vehicle_cost": "0.00",
      "entrance_fees": "0.00",
      "other_costs": "0.00",
      "total_cost": "250.00",
      "sell_price": "350.00",
      "margin": "100.00",
      "payment_status": "pending",
      "paid_amount": "0.00",
      "payment_due_date": "2025-12-10",
      "confirmation_number": "EPH2025-001",
      "voucher_issued": false,
      "notes": "English speaking group",
      "created_at": "06/11/2025 18:24"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
  }
}
```

---

### 2. Get Single Booking Tour
**GET** `/api/booking-tours/:id`

**Description:** Get a specific booking tour by ID with related information

**Example Request:**
```bash
curl http://localhost:5000/api/booking-tours/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 5,
    "tour_name": "Ephesus Ancient City Tour",
    "tour_date": "2025-12-15",
    "duration": "Full Day",
    "pax_count": 4,
    "operation_type": "supplier",
    "supplier_id": 2,
    "supplier_name": "Museum Tours Turkey",
    "supplier_cost": "250.00",
    "guide_id": null,
    "guide_name": null,
    "guide_cost": "0.00",
    "vehicle_id": null,
    "vehicle_plate": null,
    "vehicle_cost": "0.00",
    "entrance_fees": "0.00",
    "other_costs": "0.00",
    "total_cost": "250.00",
    "sell_price": "350.00",
    "margin": "100.00",
    "payment_status": "pending",
    "paid_amount": "0.00",
    "payment_due_date": "2025-12-10",
    "confirmation_number": "EPH2025-001",
    "voucher_issued": false,
    "notes": "English speaking group",
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
    "message": "Booking tour not found"
  }
}
```

---

### 3. Get Booking Tours by Booking ID
**GET** `/api/booking-tours/booking/:booking_id`

**Description:** Get all tours associated with a specific booking

**Example Request:**
```bash
curl http://localhost:5000/api/booking-tours/booking/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": 5,
      "tour_name": "Ephesus Ancient City Tour",
      "tour_date": "2025-12-15",
      "duration": "Full Day",
      "pax_count": 4,
      "operation_type": "supplier",
      "supplier_id": 2,
      "supplier_name": "Museum Tours Turkey",
      "supplier_cost": "250.00",
      "total_cost": "250.00",
      "sell_price": "350.00",
      "margin": "100.00",
      "payment_status": "pending",
      "created_at": "06/11/2025 18:24"
    },
    {
      "id": 2,
      "booking_id": 5,
      "tour_name": "Pamukkale Hot Springs",
      "tour_date": "2025-12-16",
      "duration": "Full Day",
      "pax_count": 4,
      "operation_type": "self-operated",
      "guide_id": 3,
      "guide_name": "Mehmet Demir",
      "guide_cost": "100.00",
      "vehicle_id": 2,
      "vehicle_plate": "34 ABC 123",
      "vehicle_cost": "80.00",
      "entrance_fees": "40.00",
      "other_costs": "20.00",
      "total_cost": "240.00",
      "sell_price": "400.00",
      "margin": "160.00",
      "payment_status": "paid",
      "created_at": "06/11/2025 18:25"
    }
  ]
}
```

---

### 4. Create Booking Tour
**POST** `/api/booking-tours`

**Description:** Create a new booking tour with automatic cost and margin calculation

**Required Fields:**
- `booking_id` (integer) - Reference to the parent booking
- `tour_name` (string) - Name of the tour
- `operation_type` (string) - Must be `supplier` or `self-operated`

**Optional Fields:**
- `tour_date` (date) - Tour date (YYYY-MM-DD)
- `duration` (string) - Tour duration (e.g., "Full Day", "Half Day")
- `pax_count` (integer) - Number of passengers
- `supplier_id` (integer) - Supplier ID (required if operation_type is 'supplier')
- `supplier_cost` (decimal) - Cost from supplier
- `guide_id` (integer) - Guide ID (for self-operated tours)
- `guide_cost` (decimal) - Guide cost (default: 0)
- `vehicle_id` (integer) - Vehicle ID (for self-operated tours)
- `vehicle_cost` (decimal) - Vehicle cost (default: 0)
- `entrance_fees` (decimal) - Entrance fees (default: 0)
- `other_costs` (decimal) - Other costs (default: 0)
- `sell_price` (decimal) - Selling price to customer
- `payment_status` (string) - `pending` or `paid` (default: `pending`)
- `paid_amount` (decimal) - Amount already paid (default: 0)
- `payment_due_date` (date) - Payment due date (YYYY-MM-DD)
- `confirmation_number` (string) - Confirmation/voucher number
- `voucher_issued` (boolean) - Whether voucher is issued (default: false)
- `notes` (text) - Additional notes

**Cost Calculation Logic:**
- **If operation_type = 'supplier':** total_cost = supplier_cost
- **If operation_type = 'self-operated':** total_cost = guide_cost + vehicle_cost + entrance_fees + other_costs
- **Margin:** margin = sell_price - total_cost

**Example Request (Supplier Operation):**
```bash
curl -X POST http://localhost:5000/api/booking-tours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "tour_name": "Ephesus Ancient City Tour",
    "tour_date": "2025-12-15",
    "duration": "Full Day",
    "pax_count": 4,
    "operation_type": "supplier",
    "supplier_id": 2,
    "supplier_cost": 250.00,
    "sell_price": 350.00,
    "payment_due_date": "2025-12-10",
    "confirmation_number": "EPH2025-001",
    "notes": "English speaking group"
  }'
```

**Example Request (Self-Operated):**
```bash
curl -X POST http://localhost:5000/api/booking-tours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "tour_name": "Pamukkale Hot Springs",
    "tour_date": "2025-12-16",
    "duration": "Full Day",
    "pax_count": 4,
    "operation_type": "self-operated",
    "guide_id": 3,
    "guide_cost": 100.00,
    "vehicle_id": 2,
    "vehicle_cost": 80.00,
    "entrance_fees": 40.00,
    "other_costs": 20.00,
    "sell_price": 400.00,
    "confirmation_number": "PAM2025-001"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking tour created successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "tour_name": "Ephesus Ancient City Tour",
    "tour_date": "2025-12-15",
    "duration": "Full Day",
    "pax_count": 4,
    "operation_type": "supplier",
    "supplier_id": 2,
    "supplier_cost": "250.00",
    "guide_id": null,
    "guide_cost": "0.00",
    "vehicle_id": null,
    "vehicle_cost": "0.00",
    "entrance_fees": "0.00",
    "other_costs": "0.00",
    "total_cost": "250.00",
    "sell_price": "350.00",
    "margin": "100.00",
    "payment_status": "pending",
    "paid_amount": "0.00",
    "payment_due_date": "2025-12-10",
    "confirmation_number": "EPH2025-001",
    "voucher_issued": false,
    "notes": "English speaking group",
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
    "message": "Operation type must be either \"supplier\" or \"self-operated\""
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Supplier ID is required for supplier operation type"
  }
}
```

**Not Found Error (404 Not Found):**
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

### 5. Update Booking Tour
**PUT** `/api/booking-tours/:id`

**Description:** Update an existing booking tour (costs and margin recalculated automatically)

**Note:** tour_name and operation_type are required in update requests

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/booking-tours/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "tour_name": "Ephesus Ancient City Tour - Extended",
    "tour_date": "2025-12-15",
    "duration": "Full Day",
    "pax_count": 6,
    "operation_type": "supplier",
    "supplier_id": 2,
    "supplier_cost": 300.00,
    "sell_price": 450.00,
    "payment_status": "paid",
    "paid_amount": 450.00,
    "voucher_issued": true
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking tour updated successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "tour_name": "Ephesus Ancient City Tour - Extended",
    "tour_date": "2025-12-15",
    "duration": "Full Day",
    "pax_count": 6,
    "operation_type": "supplier",
    "supplier_id": 2,
    "supplier_cost": "300.00",
    "guide_id": null,
    "guide_cost": "0.00",
    "vehicle_id": null,
    "vehicle_cost": "0.00",
    "entrance_fees": "0.00",
    "other_costs": "0.00",
    "total_cost": "300.00",
    "sell_price": "450.00",
    "margin": "150.00",
    "payment_status": "paid",
    "paid_amount": "450.00",
    "payment_due_date": "2025-12-10",
    "confirmation_number": "EPH2025-001",
    "voucher_issued": true,
    "notes": "English speaking group",
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
    "message": "Booking tour not found"
  }
}
```

---

### 6. Delete Booking Tour
**DELETE** `/api/booking-tours/:id`

**Description:** Delete a booking tour (hard delete due to CASCADE relationship)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/booking-tours/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking tour deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking tour not found"
  }
}
```

---

### 7. Get Booking Tour Statistics
**GET** `/api/booking-tours/stats/summary`

**Description:** Get comprehensive statistics for all booking tours

**Example Request:**
```bash
curl http://localhost:5000/api/booking-tours/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "supplier_operated": 28,
    "self_operated": 17,
    "pending_payment": 12,
    "paid": 33,
    "vouchers_issued": 40,
    "total_costs": 11250.50,
    "total_revenue": 16800.00,
    "total_margin": 5549.50,
    "total_paid": 14200.00
  }
}
```

---

## Database Schema

```sql
CREATE TABLE booking_tours (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    tour_name VARCHAR(255) NOT NULL,
    tour_date DATE,
    duration VARCHAR(50),
    pax_count INTEGER,
    operation_type VARCHAR(20) NOT NULL,
    supplier_id INTEGER REFERENCES tour_suppliers(id),
    supplier_cost DECIMAL(10,2),
    guide_id INTEGER REFERENCES guides(id),
    guide_cost DECIMAL(10,2) DEFAULT 0,
    vehicle_id INTEGER REFERENCES vehicles(id),
    vehicle_cost DECIMAL(10,2) DEFAULT 0,
    entrance_fees DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2),
    sell_price DECIMAL(10,2),
    margin DECIMAL(10,2),
    payment_status VARCHAR(30) DEFAULT 'pending',
    paid_amount DECIMAL(10,2) DEFAULT 0,
    payment_due_date DATE,
    confirmation_number VARCHAR(100),
    voucher_issued BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_tour_operation_type CHECK (operation_type IN ('supplier', 'self-operated')),
    CONSTRAINT chk_tour_payment_status CHECK (payment_status IN ('pending', 'paid'))
);
```

---

## Field Validations

### Required Fields:
- **booking_id:** Must reference a valid booking
- **tour_name:** Max 255 characters
- **operation_type:** Must be either 'supplier' or 'self-operated'

### Conditional Requirements:
- **supplier_id:** Required when operation_type is 'supplier'

### Optional Fields:
- **tour_date:** Date in YYYY-MM-DD format
- **duration:** Max 50 characters (e.g., "Full Day", "Half Day", "3 hours")
- **pax_count:** Integer (number of passengers)
- **supplier_cost:** Decimal (10,2)
- **guide_id:** References guides table
- **guide_cost:** Decimal (10,2), default 0
- **vehicle_id:** References vehicles table
- **vehicle_cost:** Decimal (10,2), default 0
- **entrance_fees:** Decimal (10,2), default 0
- **other_costs:** Decimal (10,2), default 0
- **sell_price:** Decimal (10,2)
- **payment_status:** 'pending' or 'paid', default 'pending'
- **paid_amount:** Decimal (10,2), default 0
- **payment_due_date:** Date in YYYY-MM-DD format
- **confirmation_number:** Max 100 characters
- **voucher_issued:** Boolean, default false
- **notes:** Text field

### Calculated Fields (Automatic):
- **total_cost:** Calculated based on operation_type
- **margin:** Calculated as sell_price - total_cost

---

## Cost Calculation Rules

### Supplier Operation (`operation_type = 'supplier'`):
```
total_cost = supplier_cost
```

### Self-Operated (`operation_type = 'self-operated'`):
```
total_cost = guide_cost + vehicle_cost + entrance_fees + other_costs
```

### Margin Calculation (both types):
```
margin = sell_price - total_cost
```

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Booking tour or related entity not found
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Booking
```bash
curl "http://localhost:5000/api/booking-tours?booking_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Date Range
```bash
curl "http://localhost:5000/api/booking-tours?tour_date_from=2025-12-01&tour_date_to=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter Pending Payments
```bash
curl "http://localhost:5000/api/booking-tours?payment_status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Tours
```bash
curl "http://localhost:5000/api/booking-tours?search=Ephesus" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Self-Operated Tours
```bash
curl "http://localhost:5000/api/booking-tours?operation_type=self-operated&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Combined Filters
```bash
curl "http://localhost:5000/api/booking-tours?operation_type=supplier&payment_status=pending&tour_date_from=2025-12-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Search Functionality

The search parameter searches across the following fields:
- Tour name
- Confirmation number
- Notes

**Example:**
```bash
# Search for "museum" - will find matches in any of the above fields
curl "http://localhost:5000/api/booking-tours?search=museum" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Related Entities

Booking tours can reference:
- **bookings** - Parent booking (required)
- **tour_suppliers** - External supplier (for supplier operations)
- **guides** - Tour guide (for self-operated tours)
- **vehicles** - Transportation (for self-operated tours)

Use the returned `supplier_name`, `guide_name`, and `vehicle_plate` fields to display related entity information without additional queries.

---

**Last Updated:** 2025-12-06
