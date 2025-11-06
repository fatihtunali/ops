# Supplier Payments API

Base URL: `http://localhost:5000/api/supplier-payments`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Supplier Payments
**GET** `/api/supplier-payments`

**Description:** List all supplier payments with optional filters

**Query Parameters:**
- `status` (optional) - Filter by payment status: `pending` or `paid`
- `supplier_type` (optional) - Filter by supplier type: `hotel`, `tour`, `transfer`, `flight`, `guide`, `vehicle`, or `other`
- `due_date_from` (optional) - Filter payments with due date >= this date (format: YYYY-MM-DD)
- `due_date_to` (optional) - Filter payments with due date <= this date (format: YYYY-MM-DD)
- `booking_id` (optional) - Filter by booking ID

**Example Request:**
```bash
curl "http://localhost:5000/api/supplier-payments?status=pending&supplier_type=hotel" \
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
      "booking_id": 5,
      "supplier_type": "hotel",
      "supplier_id": 3,
      "supplier_name": "Grand Hotel Istanbul",
      "service_id": 12,
      "amount": 1500.00,
      "currency": "USD",
      "payment_date": null,
      "due_date": "2025-11-15",
      "payment_method": null,
      "status": "pending",
      "reference_number": null,
      "notes": "Payment for 3 nights accommodation",
      "created_at": "06/11/2025 18:24"
    },
    {
      "id": 2,
      "booking_id": 5,
      "supplier_type": "hotel",
      "supplier_id": 3,
      "supplier_name": "Grand Hotel Istanbul",
      "service_id": 13,
      "amount": 800.00,
      "currency": "USD",
      "payment_date": "2025-11-10",
      "due_date": "2025-11-20",
      "payment_method": "bank_transfer",
      "status": "paid",
      "reference_number": "PAY-2025-001",
      "notes": "Additional services",
      "created_at": "07/11/2025 10:15"
    }
  ]
}
```

---

### 2. Get Single Supplier Payment
**GET** `/api/supplier-payments/:id`

**Description:** Get a specific supplier payment by ID

**Example Request:**
```bash
curl http://localhost:5000/api/supplier-payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "service_id": 12,
    "amount": 1500.00,
    "currency": "USD",
    "payment_date": null,
    "due_date": "2025-11-15",
    "payment_method": null,
    "status": "pending",
    "reference_number": null,
    "notes": "Payment for 3 nights accommodation",
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
    "message": "Supplier payment not found"
  }
}
```

---

### 3. Create Supplier Payment
**POST** `/api/supplier-payments`

**Description:** Create a new supplier payment

**Required Fields:**
- `supplier_type` (string) - Type of supplier: `hotel`, `tour`, `transfer`, `flight`, `guide`, `vehicle`, or `other`
- `amount` (decimal) - Payment amount (must be positive)

**Optional Fields:**
- `booking_id` (integer) - Associated booking ID (must reference an existing booking)
- `supplier_id` (integer) - Supplier ID (references hotels, tour_suppliers, etc.)
- `supplier_name` (string) - Supplier name
- `service_id` (integer) - Service ID (references booking_hotels, booking_tours, etc.)
- `currency` (string) - Currency code (default: `USD`)
- `payment_date` (date) - Date payment was made (format: YYYY-MM-DD)
- `due_date` (date) - Payment due date (format: YYYY-MM-DD)
- `payment_method` (string) - Payment method used
- `status` (string) - Payment status: `pending` or `paid` (default: `pending`)
- `reference_number` (string) - Payment reference number
- `notes` (text) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/supplier-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "service_id": 12,
    "amount": 1500.00,
    "currency": "USD",
    "due_date": "2025-11-15",
    "status": "pending",
    "notes": "Payment for 3 nights accommodation"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Supplier payment created successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "service_id": 12,
    "amount": 1500.00,
    "currency": "USD",
    "payment_date": null,
    "due_date": "2025-11-15",
    "payment_method": null,
    "status": "pending",
    "reference_number": null,
    "notes": "Payment for 3 nights accommodation",
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
    "message": "Supplier type is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be a positive number"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Supplier type must be one of: hotel, tour, transfer, flight, guide, vehicle, other"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Status must be either \"pending\" or \"paid\""
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid booking_id: booking does not exist"
  }
}
```

**Foreign Key Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "FOREIGN_KEY_ERROR",
    "message": "Referenced booking does not exist"
  }
}
```

**Constraint Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "CONSTRAINT_ERROR",
    "message": "Invalid value for supplier_type, status, or amount"
  }
}
```

---

### 4. Update Supplier Payment
**PUT** `/api/supplier-payments/:id`

**Description:** Update an existing supplier payment

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/supplier-payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "paid",
    "payment_date": "2025-11-10",
    "payment_method": "bank_transfer",
    "reference_number": "PAY-2025-001"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Supplier payment updated successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "service_id": 12,
    "amount": 1500.00,
    "currency": "USD",
    "payment_date": "2025-11-10",
    "due_date": "2025-11-15",
    "payment_method": "bank_transfer",
    "status": "paid",
    "reference_number": "PAY-2025-001",
    "notes": "Payment for 3 nights accommodation",
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
    "message": "Supplier payment not found"
  }
}
```

**Validation Error (400 Bad Request):**
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

### 5. Delete Supplier Payment
**DELETE** `/api/supplier-payments/:id`

**Description:** Permanently delete a supplier payment record

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/supplier-payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Supplier payment deleted successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "service_id": 12,
    "amount": 1500.00,
    "currency": "USD",
    "payment_date": "2025-11-10",
    "due_date": "2025-11-15",
    "payment_method": "bank_transfer",
    "status": "paid",
    "reference_number": "PAY-2025-001",
    "notes": "Payment for 3 nights accommodation",
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
    "message": "Supplier payment not found"
  }
}
```

---

### 6. Get Supplier Payment Statistics
**GET** `/api/supplier-payments/stats`

**Description:** Get aggregate statistics for supplier payments

**Example Request:**
```bash
curl http://localhost:5000/api/supplier-payments/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_payments": 25,
      "pending_payments": 10,
      "paid_payments": 15,
      "overdue_payments": 3,
      "total_amount": 45000.00,
      "pending_amount": 15000.00,
      "paid_amount": 30000.00,
      "overdue_amount": 2500.00
    },
    "by_supplier_type": [
      {
        "supplier_type": "hotel",
        "count": 12,
        "total_amount": 22000.00,
        "pending_amount": 8000.00
      },
      {
        "supplier_type": "tour",
        "count": 8,
        "total_amount": 15000.00,
        "pending_amount": 5000.00
      },
      {
        "supplier_type": "transfer",
        "count": 5,
        "total_amount": 8000.00,
        "pending_amount": 2000.00
      }
    ]
  }
}
```

---

## Database Schema

```sql
CREATE TABLE supplier_payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    supplier_type VARCHAR(20) NOT NULL, -- 'hotel', 'tour', 'transfer', 'flight'
    supplier_id INTEGER,
    supplier_name VARCHAR(255),
    service_id INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_date DATE,
    due_date DATE,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_supplier_payment_status CHECK (status IN ('pending', 'paid')),
    CONSTRAINT chk_supplier_payment_amount CHECK (amount > 0),
    CONSTRAINT chk_supplier_type CHECK (supplier_type IN ('hotel', 'tour', 'transfer', 'flight', 'guide', 'vehicle', 'other'))
);

CREATE INDEX idx_supplier_payments_booking ON supplier_payments(booking_id);
CREATE INDEX idx_supplier_payments_status ON supplier_payments(status);
CREATE INDEX idx_supplier_payments_due_date ON supplier_payments(due_date);
```

---

## Field Validations

- **booking_id:** Optional, must reference an existing booking
- **supplier_type:** Required, must be one of: `hotel`, `tour`, `transfer`, `flight`, `guide`, `vehicle`, `other`
- **supplier_id:** Optional, integer
- **supplier_name:** Optional, max 255 characters
- **service_id:** Optional, integer
- **amount:** Required, must be a positive decimal number
- **currency:** Optional, max 10 characters (default: `USD`)
- **payment_date:** Optional, date format YYYY-MM-DD
- **due_date:** Optional, date format YYYY-MM-DD
- **payment_method:** Optional, max 50 characters
- **status:** Optional, must be `pending` or `paid` (default: `pending`)
- **reference_number:** Optional, max 100 characters
- **notes:** Optional, text

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Supplier payment not found
- `FOREIGN_KEY_ERROR` (400) - Referenced booking does not exist
- `CONSTRAINT_ERROR` (400) - Database constraint violation
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter Pending Payments
```bash
curl "http://localhost:5000/api/supplier-payments?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Date Range
```bash
curl "http://localhost:5000/api/supplier-payments?due_date_from=2025-11-01&due_date_to=2025-11-30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Supplier Type and Status
```bash
curl "http://localhost:5000/api/supplier-payments?supplier_type=hotel&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Booking ID
```bash
curl "http://localhost:5000/api/supplier-payments?booking_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Payment with Minimal Data
```bash
curl -X POST http://localhost:5000/api/supplier-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_type": "tour",
    "amount": 500.00
  }'
```

### Mark Payment as Paid
```bash
curl -X PUT http://localhost:5000/api/supplier-payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "paid",
    "payment_date": "2025-11-10",
    "payment_method": "bank_transfer",
    "reference_number": "PAY-2025-001"
  }'
```

### Find Overdue Payments
To find overdue pending payments, use the date filter:
```bash
curl "http://localhost:5000/api/supplier-payments?status=pending&due_date_to=$(date -I)" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Workflows

### 1. Recording a Hotel Payment
```bash
# Create a pending payment for a hotel
curl -X POST http://localhost:5000/api/supplier-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "supplier_type": "hotel",
    "supplier_id": 3,
    "supplier_name": "Grand Hotel Istanbul",
    "amount": 1500.00,
    "due_date": "2025-11-15",
    "notes": "Payment for 3 nights"
  }'
```

### 2. Processing a Payment
```bash
# Update payment to paid status
curl -X PUT http://localhost:5000/api/supplier-payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "paid",
    "payment_date": "2025-11-10",
    "payment_method": "bank_transfer",
    "reference_number": "TXN-2025-001"
  }'
```

### 3. Tracking Payments for a Booking
```bash
# Get all payments for a specific booking
curl "http://localhost:5000/api/supplier-payments?booking_id=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Monitoring Pending Payments
```bash
# Get all pending hotel payments
curl "http://localhost:5000/api/supplier-payments?status=pending&supplier_type=hotel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated:** 2025-11-06
