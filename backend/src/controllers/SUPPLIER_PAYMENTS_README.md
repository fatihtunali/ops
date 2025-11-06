# Supplier Payments Controller - Quick Reference

## Controller: supplierPaymentController.js

### Available Functions

1. **getAll(req, res)** - Get all supplier payments with filters
2. **getById(req, res)** - Get single supplier payment by ID
3. **create(req, res)** - Create new supplier payment
4. **update(req, res)** - Update existing supplier payment
5. **deletePayment(req, res)** - Delete supplier payment
6. **getStats(req, res)** - Get payment statistics

### Filter Parameters (getAll)

```javascript
// status: 'pending' | 'paid'
// supplier_type: 'hotel' | 'tour' | 'transfer' | 'flight' | 'guide' | 'vehicle' | 'other'
// due_date_from: 'YYYY-MM-DD'
// due_date_to: 'YYYY-MM-DD'
// booking_id: number

GET /api/supplier-payments?status=pending&supplier_type=hotel
GET /api/supplier-payments?due_date_from=2025-11-01&due_date_to=2025-11-30
GET /api/supplier-payments?booking_id=5
```

### Request Body Schema

#### Create/Update Fields

```javascript
{
  // Required for create
  "supplier_type": "hotel",  // Required
  "amount": 1500.00,        // Required, must be > 0

  // Optional
  "booking_id": 5,
  "supplier_id": 3,
  "supplier_name": "Grand Hotel Istanbul",
  "service_id": 12,
  "currency": "USD",         // Default: USD
  "payment_date": "2025-11-10",
  "due_date": "2025-11-15",
  "payment_method": "bank_transfer",
  "status": "pending",       // Default: pending
  "reference_number": "PAY-2025-001",
  "notes": "Payment for 3 nights"
}
```

### Validation Rules

- **supplier_type**: Required, must be one of: hotel, tour, transfer, flight, guide, vehicle, other
- **amount**: Required, must be positive number
- **status**: Must be 'pending' or 'paid' (default: pending)
- **booking_id**: Must reference existing booking (if provided)
- **currency**: Default is 'USD'

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Supplier payment not found
- `FOREIGN_KEY_ERROR` (400) - Invalid booking reference
- `CONSTRAINT_ERROR` (400) - Database constraint violation
- `INTERNAL_ERROR` (500) - Server error

### Statistics Response

```javascript
{
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
    }
  ]
}
```

### Usage Examples

```javascript
// Create payment
const response = await fetch('/api/supplier-payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    booking_id: 5,
    supplier_type: 'hotel',
    amount: 1500.00,
    due_date: '2025-11-15'
  })
});

// Get pending hotel payments
const payments = await fetch('/api/supplier-payments?status=pending&supplier_type=hotel', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// Mark as paid
const updated = await fetch('/api/supplier-payments/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    status: 'paid',
    payment_date: '2025-11-10',
    payment_method: 'bank_transfer',
    reference_number: 'PAY-2025-001'
  })
});

// Get statistics
const stats = await fetch('/api/supplier-payments/stats', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

### Database Constraints

```sql
-- Check constraints
CONSTRAINT chk_supplier_payment_status CHECK (status IN ('pending', 'paid'))
CONSTRAINT chk_supplier_payment_amount CHECK (amount > 0)
CONSTRAINT chk_supplier_type CHECK (supplier_type IN ('hotel', 'tour', 'transfer', 'flight', 'guide', 'vehicle', 'other'))

-- Foreign key
booking_id INTEGER REFERENCES bookings(id)

-- Indexes
idx_supplier_payments_booking ON supplier_payments(booking_id)
idx_supplier_payments_status ON supplier_payments(status)
idx_supplier_payments_due_date ON supplier_payments(due_date)
```
