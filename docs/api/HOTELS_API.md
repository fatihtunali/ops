# Hotel Management API

Base URL: `http://localhost:5000/api/hotels`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Hotels
**GET** `/api/hotels`

**Description:** List all hotels with optional filters

**Query Parameters:**
- `city` (optional) - Filter by city (case-insensitive)
- `country` (optional) - Filter by country (case-insensitive)
- `status` (optional) - Filter by status: `active` or `inactive`

**Example Request:**
```bash
curl http://localhost:5000/api/hotels?city=Istanbul&status=active \
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
      "name": "Grand Hotel Istanbul",
      "city": "Istanbul",
      "country": "Turkey",
      "contact_person": "John Smith",
      "contact_email": "contact@grandhotel.com",
      "contact_phone": "+90 212 555 1234",
      "standard_cost_per_night": 150.00,
      "notes": "5-star hotel in city center",
      "status": "active",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get Single Hotel
**GET** `/api/hotels/:id`

**Description:** Get a specific hotel by ID

**Example Request:**
```bash
curl http://localhost:5000/api/hotels/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grand Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "contact_person": "John Smith",
    "contact_email": "contact@grandhotel.com",
    "contact_phone": "+90 212 555 1234",
    "standard_cost_per_night": 150.00,
    "notes": "5-star hotel in city center",
    "status": "active",
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
    "message": "Hotel not found"
  }
}
```

---

### 3. Create Hotel
**POST** `/api/hotels`

**Description:** Create a new hotel

**Required Fields:**
- `name` (string) - Hotel name

**Optional Fields:**
- `city` (string) - City location
- `country` (string) - Country
- `contact_person` (string) - Contact person name
- `contact_email` (string) - Contact email
- `contact_phone` (string) - Contact phone number
- `standard_cost_per_night` (decimal) - Standard cost per night (must be positive)
- `notes` (string) - Additional notes
- `status` (string) - Status: `active` or `inactive` (default: `active`)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Grand Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "contact_person": "John Smith",
    "contact_email": "contact@grandhotel.com",
    "contact_phone": "+90 212 555 1234",
    "standard_cost_per_night": 150.00,
    "notes": "5-star hotel in city center"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Hotel created successfully",
  "data": {
    "id": 1,
    "name": "Grand Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "contact_person": "John Smith",
    "contact_email": "contact@grandhotel.com",
    "contact_phone": "+90 212 555 1234",
    "standard_cost_per_night": 150.00,
    "notes": "5-star hotel in city center",
    "status": "active",
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
    "message": "Hotel name is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Standard cost per night must be a valid positive number"
  }
}
```

**Duplicate Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ERROR",
    "message": "A hotel with this name already exists"
  }
}
```

---

### 4. Update Hotel
**PUT** `/api/hotels/:id`

**Description:** Update an existing hotel

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/hotels/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "standard_cost_per_night": 175.00,
    "notes": "Premium 5-star hotel"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel updated successfully",
  "data": {
    "id": 1,
    "name": "Grand Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "contact_person": "John Smith",
    "contact_email": "contact@grandhotel.com",
    "contact_phone": "+90 212 555 1234",
    "standard_cost_per_night": 175.00,
    "notes": "Premium 5-star hotel",
    "status": "active",
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
    "message": "Hotel not found"
  }
}
```

---

### 5. Delete Hotel (Soft Delete)
**DELETE** `/api/hotels/:id`

**Description:** Soft delete a hotel (sets status to 'inactive')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/hotels/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Hotel deleted successfully (status set to inactive)",
  "data": {
    "id": 1,
    "name": "Grand Hotel Istanbul",
    "city": "Istanbul",
    "country": "Turkey",
    "contact_person": "John Smith",
    "contact_email": "contact@grandhotel.com",
    "contact_phone": "+90 212 555 1234",
    "standard_cost_per_night": 175.00,
    "notes": "Premium 5-star hotel",
    "status": "inactive",
    "created_at": "06/11/2025 18:24"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    standard_cost_per_night DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);
```

---

## Field Validations

- **name:** Required, max 255 characters
- **city:** Optional, max 100 characters
- **country:** Optional, max 100 characters
- **contact_email:** Optional, valid email format
- **standard_cost_per_night:** Optional, must be positive number
- **status:** Must be either 'active' or 'inactive'

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Hotel not found
- `DUPLICATE_ERROR` (400) - Hotel name already exists
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by City
```bash
curl "http://localhost:5000/api/hotels?city=Istanbul" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Country and Status
```bash
curl "http://localhost:5000/api/hotels?country=Turkey&status=active" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Hotel with Minimal Data
```bash
curl -X POST http://localhost:5000/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Budget Hotel Ankara"
  }'
```

---

**Last Updated:** 2025-12-06
