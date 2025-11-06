# Operational Expenses Management API

Base URL: `http://localhost:5000/api/operational-expenses`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Operational Expenses
**GET** `/api/operational-expenses`

**Description:** List all operational expenses with optional filters

**Query Parameters:**
- `category` (optional) - Filter by category (partial match, case-insensitive)
- `from_date` (optional) - Filter expenses from this date (YYYY-MM-DD)
- `to_date` (optional) - Filter expenses up to this date (YYYY-MM-DD)
- `is_recurring` (optional) - Filter by recurring status (true/false)

**Example Request:**
```bash
curl "http://localhost:5000/api/operational-expenses?category=rent&from_date=2025-01-01&to_date=2025-12-31" \
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
      "expense_date": "2025-11-01",
      "category": "rent",
      "description": "Office rent for November",
      "amount": 5000.00,
      "currency": "USD",
      "payment_method": "Bank Transfer",
      "reference_number": "REF-2025-11-001",
      "is_recurring": true,
      "notes": "Monthly office space rental",
      "created_at": "06/11/2025 18:24"
    },
    {
      "id": 2,
      "expense_date": "2025-11-05",
      "category": "utilities",
      "description": "Electricity and water bills",
      "amount": 350.50,
      "currency": "USD",
      "payment_method": "Cash",
      "reference_number": "UTL-2025-11-001",
      "is_recurring": true,
      "notes": null,
      "created_at": "06/11/2025 19:15"
    }
  ]
}
```

---

### 2. Get Recurring Expenses Only
**GET** `/api/operational-expenses/recurring`

**Description:** Get only expenses marked as recurring

**Example Request:**
```bash
curl http://localhost:5000/api/operational-expenses/recurring \
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
      "expense_date": "2025-11-01",
      "category": "rent",
      "description": "Office rent for November",
      "amount": 5000.00,
      "currency": "USD",
      "payment_method": "Bank Transfer",
      "reference_number": "REF-2025-11-001",
      "is_recurring": true,
      "notes": "Monthly office space rental",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 3. Get Expenses by Category
**GET** `/api/operational-expenses/by-category/:category`

**Description:** Get all expenses for a specific category

**Example Request:**
```bash
curl http://localhost:5000/api/operational-expenses/by-category/salaries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 10,
      "expense_date": "2025-11-01",
      "category": "salaries",
      "description": "Staff salaries - November",
      "amount": 15000.00,
      "currency": "USD",
      "payment_method": "Bank Transfer",
      "reference_number": "SAL-2025-11",
      "is_recurring": true,
      "notes": "5 employees",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 4. Get Single Expense
**GET** `/api/operational-expenses/:id`

**Description:** Get a specific operational expense by ID

**Example Request:**
```bash
curl http://localhost:5000/api/operational-expenses/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "expense_date": "2025-11-01",
    "category": "rent",
    "description": "Office rent for November",
    "amount": 5000.00,
    "currency": "USD",
    "payment_method": "Bank Transfer",
    "reference_number": "REF-2025-11-001",
    "is_recurring": true,
    "notes": "Monthly office space rental",
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
    "message": "Operational expense not found"
  }
}
```

---

### 5. Create Operational Expense
**POST** `/api/operational-expenses`

**Description:** Create a new operational expense

**Required Fields:**
- `expense_date` (date) - Date of the expense (YYYY-MM-DD format)
- `category` (string) - Expense category (e.g., 'rent', 'salaries', 'utilities', 'marketing')
- `amount` (decimal) - Amount of the expense (must be > 0)

**Optional Fields:**
- `description` (string) - Description of the expense
- `currency` (string) - Currency code (default: 'USD')
- `payment_method` (string) - Method of payment
- `reference_number` (string) - Reference or invoice number
- `is_recurring` (boolean) - Whether this is a recurring expense (default: false)
- `notes` (text) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/operational-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expense_date": "2025-11-01",
    "category": "rent",
    "description": "Office rent for November",
    "amount": 5000.00,
    "currency": "USD",
    "payment_method": "Bank Transfer",
    "reference_number": "REF-2025-11-001",
    "is_recurring": true,
    "notes": "Monthly office space rental"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Operational expense created successfully",
  "data": {
    "id": 1,
    "expense_date": "2025-11-01",
    "category": "rent",
    "description": "Office rent for November",
    "amount": 5000.00,
    "currency": "USD",
    "payment_method": "Bank Transfer",
    "reference_number": "REF-2025-11-001",
    "is_recurring": true,
    "notes": "Monthly office space rental",
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
    "message": "Expense date is required"
  }
}
```

**Amount Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0"
  }
}
```

---

### 6. Update Operational Expense
**PUT** `/api/operational-expenses/:id`

**Description:** Update an existing operational expense

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/operational-expenses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount": 5200.00,
    "notes": "Rent increased due to annual review"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Operational expense updated successfully",
  "data": {
    "id": 1,
    "expense_date": "2025-11-01",
    "category": "rent",
    "description": "Office rent for November",
    "amount": 5200.00,
    "currency": "USD",
    "payment_method": "Bank Transfer",
    "reference_number": "REF-2025-11-001",
    "is_recurring": true,
    "notes": "Rent increased due to annual review",
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
    "message": "Operational expense not found"
  }
}
```

**Amount Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0"
  }
}
```

---

### 7. Delete Operational Expense
**DELETE** `/api/operational-expenses/:id`

**Description:** Delete an operational expense (hard delete)

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/operational-expenses/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Operational expense deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Operational expense not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE operational_expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_expense_amount CHECK (amount > 0)
);

CREATE INDEX idx_operational_expenses_date ON operational_expenses(expense_date);
CREATE INDEX idx_operational_expenses_category ON operational_expenses(category);
```

---

## Field Validations

- **expense_date:** Required, DATE format
- **category:** Required, max 100 characters
- **description:** Optional, max 255 characters
- **amount:** Required, decimal(10,2), must be > 0
- **currency:** Optional, max 10 characters, default 'USD'
- **payment_method:** Optional, max 50 characters
- **reference_number:** Optional, max 100 characters
- **is_recurring:** Optional, boolean, default false
- **notes:** Optional, text field

---

## Common Expense Categories

- `rent` - Office or facility rental expenses
- `salaries` - Employee salaries and wages
- `utilities` - Electricity, water, internet, phone bills
- `marketing` - Advertising and promotional expenses
- `insurance` - Business insurance premiums
- `maintenance` - Equipment and facility maintenance
- `supplies` - Office supplies and materials
- `travel` - Business travel expenses
- `software` - Software subscriptions and licenses
- `professional_services` - Legal, accounting, consulting fees

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data or amount <= 0
- `NOT_FOUND` (404) - Expense not found
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Date Range
```bash
curl "http://localhost:5000/api/operational-expenses?from_date=2025-01-01&to_date=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Category
```bash
curl "http://localhost:5000/api/operational-expenses?category=salaries" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Recurring Expenses Only
```bash
curl "http://localhost:5000/api/operational-expenses?is_recurring=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Combined Filters
```bash
curl "http://localhost:5000/api/operational-expenses?category=utilities&from_date=2025-11-01&is_recurring=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Minimal Expense
```bash
curl -X POST http://localhost:5000/api/operational-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expense_date": "2025-11-15",
    "category": "supplies",
    "amount": 125.50
  }'
```

### Create Recurring Expense
```bash
curl -X POST http://localhost:5000/api/operational-expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "expense_date": "2025-11-01",
    "category": "salaries",
    "description": "November staff salaries",
    "amount": 15000.00,
    "payment_method": "Bank Transfer",
    "is_recurring": true
  }'
```

### Update Payment Method
```bash
curl -X PUT http://localhost:5000/api/operational-expenses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "payment_method": "Credit Card",
    "reference_number": "CC-2025-11-001"
  }'
```

### Mark as Non-Recurring
```bash
curl -X PUT http://localhost:5000/api/operational-expenses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "is_recurring": false
  }'
```

---

## Best Practices

1. **Use Consistent Categories:** Maintain a standard list of categories for better reporting
2. **Reference Numbers:** Always include reference numbers for tracking and auditing
3. **Recurring Expenses:** Mark monthly/regular expenses as recurring for easier management
4. **Currency Tracking:** Specify currency for expenses in different currencies
5. **Date Range Queries:** Use from_date and to_date for reporting and analysis
6. **Detailed Notes:** Include relevant details in notes field for future reference

---

**Last Updated:** 2025-11-06
