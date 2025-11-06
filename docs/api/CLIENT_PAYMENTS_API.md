# Client Payments API

Base URL: `http://localhost:5000/api/client-payments`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Client Payments
**GET** `/api/client-payments`

**Description:** List all client payments with optional filters

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID
- `payment_date_from` (optional) - Filter from date (format: YYYY-MM-DD)
- `payment_date_to` (optional) - Filter to date (format: YYYY-MM-DD)
- `payment_method` (optional) - Filter by payment method (e.g., 'cash', 'credit_card', 'bank_transfer')
- `currency` (optional) - Filter by currency (e.g., 'USD', 'EUR', 'GBP')

**Example Request:**
```bash
curl http://localhost:5000/api/client-payments?booking_id=1&payment_date_from=2025-01-01 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": 1,
      "payment_date": "2025-01-15",
      "amount": 1500.00,
      "currency": "USD",
      "payment_method": "bank_transfer",
      "reference_number": "TXN123456",
      "notes": "First installment",
      "created_at": "06/11/2025 18:24",
      "booking_number": "BK-2025-001",
      "client_name": "ABC Travel Agency"
    }
  ],
  "count": 1
}
```

---

### 2. Get Single Client Payment
**GET** `/api/client-payments/:id`

**Description:** Get a specific client payment by ID

**Example Request:**
```bash
curl http://localhost:5000/api/client-payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 1,
    "payment_date": "2025-01-15",
    "amount": 1500.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "reference_number": "TXN123456",
    "notes": "First installment",
    "created_at": "06/11/2025 18:24",
    "booking_number": "BK-2025-001",
    "client_name": "ABC Travel Agency"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client payment not found"
  }
}
```

---

### 3. Get Payments by Booking ID
**GET** `/api/client-payments/booking/:booking_id`

**Description:** Get all payments for a specific booking

**Example Request:**
```bash
curl http://localhost:5000/api/client-payments/booking/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_id": 1,
      "payment_date": "2025-01-15",
      "amount": 1500.00,
      "currency": "USD",
      "payment_method": "bank_transfer",
      "reference_number": "TXN123456",
      "notes": "First installment",
      "created_at": "06/11/2025 18:24"
    },
    {
      "id": 2,
      "booking_id": 1,
      "payment_date": "2025-02-01",
      "amount": 1500.00,
      "currency": "USD",
      "payment_method": "credit_card",
      "reference_number": "CC789012",
      "notes": "Final payment",
      "created_at": "06/11/2025 19:45"
    }
  ],
  "count": 2
}
```

---

### 4. Create Client Payment
**POST** `/api/client-payments`

**Description:** Create a new client payment

**Required Fields:**
- `booking_id` (integer) - ID of the booking
- `payment_date` (date) - Payment date (format: YYYY-MM-DD)
- `amount` (decimal) - Payment amount (must be > 0)

**Optional Fields:**
- `currency` (string) - Currency code (default: 'USD')
- `payment_method` (string) - Payment method (e.g., 'cash', 'credit_card', 'bank_transfer', 'check')
- `reference_number` (string) - Transaction/check/reference number
- `notes` (string) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/client-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "payment_date": "2025-01-15",
    "amount": 1500.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "reference_number": "TXN123456",
    "notes": "First installment"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Client payment created successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "payment_date": "2025-01-15",
    "amount": 1500.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "reference_number": "TXN123456",
    "notes": "First installment",
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
    "message": "Payment amount must be greater than 0"
  }
}
```

**Foreign Key Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "FOREIGN_KEY_ERROR",
    "message": "Invalid booking ID"
  }
}
```

---

### 5. Update Client Payment
**PUT** `/api/client-payments/:id`

**Description:** Update an existing client payment

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/client-payments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 1750.00,
    "notes": "Updated amount - first installment"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client payment updated successfully",
  "data": {
    "id": 1,
    "booking_id": 1,
    "payment_date": "2025-01-15",
    "amount": 1750.00,
    "currency": "USD",
    "payment_method": "bank_transfer",
    "reference_number": "TXN123456",
    "notes": "Updated amount - first installment",
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
    "message": "Client payment not found"
  }
}
```

---

### 6. Delete Client Payment
**DELETE** `/api/client-payments/:id`

**Description:** Delete a client payment (hard delete)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/client-payments/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Client payment deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client payment not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE client_payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);
```

---

## Database Trigger

**Important:** The database has a trigger that automatically updates the booking's payment status after any client payment changes:

```sql
-- Trigger: update_booking_payment_status_on_client_payment
-- Fires: AFTER INSERT, UPDATE, DELETE ON client_payments
-- Function: update_booking_payment_status()
```

This trigger automatically:
- Calculates total paid amount for a booking
- Compares it with the booking's total amount
- Updates `booking_payment_status` to:
  - `'pending'` - No payments received
  - `'partial'` - Some payment received (< total)
  - `'paid'` - Full payment received (>= total)

**You don't need to manually update the booking payment status** - it happens automatically when you create, update, or delete client payments.

---

## Field Validations

- **booking_id:** Required, must reference an existing booking
- **payment_date:** Required, date format YYYY-MM-DD
- **amount:** Required, must be greater than 0 (decimal with 2 decimal places)
- **currency:** Optional, defaults to 'USD', max 10 characters
- **payment_method:** Optional, max 50 characters (common values: 'cash', 'credit_card', 'bank_transfer', 'check', 'wire_transfer')
- **reference_number:** Optional, max 100 characters (transaction ID, check number, etc.)
- **notes:** Optional, text field for additional information

---

## Common Payment Methods

- `cash` - Cash payment
- `credit_card` - Credit/debit card
- `bank_transfer` - Bank transfer/wire
- `check` - Check payment
- `wire_transfer` - Wire transfer
- `paypal` - PayPal
- `stripe` - Stripe payment
- `other` - Other payment method

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data or amount <= 0
- `NOT_FOUND` (404) - Payment or booking not found
- `FOREIGN_KEY_ERROR` (400) - Invalid booking ID
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Track Multiple Installments

```bash
# First installment
curl -X POST http://localhost:5000/api/client-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "payment_date": "2025-01-15",
    "amount": 1000.00,
    "payment_method": "bank_transfer",
    "notes": "First installment - 50% deposit"
  }'

# Second installment
curl -X POST http://localhost:5000/api/client-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 1,
    "payment_date": "2025-02-01",
    "amount": 1000.00,
    "payment_method": "credit_card",
    "notes": "Final payment - remaining 50%"
  }'
```

### Get Payment Summary for Date Range

```bash
curl "http://localhost:5000/api/client-payments?payment_date_from=2025-01-01&payment_date_to=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Payment Method

```bash
curl "http://localhost:5000/api/client-payments?payment_method=bank_transfer" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated:** 2025-11-06
