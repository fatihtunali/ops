# Tour Suppliers API

Base URL: `http://localhost:5000/api/tour-suppliers`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Tour Suppliers
**GET** `/api/tour-suppliers`

**Description:** List all tour suppliers with optional filters and pagination

**Query Parameters:**
- `status` (optional) - Filter by status: `active` or `inactive`
- `search` (optional) - Search in name, contact_person, email, phone, or services_offered
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example Request:**
```bash
curl "http://localhost:5000/api/tour-suppliers?status=active&search=museum&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Museum Tours Turkey",
      "contact_person": "Ali Yılmaz",
      "email": "info@museumtours.com",
      "phone": "+90 555 1234567",
      "services_offered": "Museum tours, Historical site visits, Guided tours",
      "payment_terms": "50% advance, 50% after tour completion",
      "notes": "Reliable supplier for museum tours",
      "status": "active",
      "created_at": "06/11/2025 18:24"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2
  }
}
```

---

### 2. Get Single Tour Supplier
**GET** `/api/tour-suppliers/:id`

**Description:** Get a specific tour supplier by ID

**Example Request:**
```bash
curl http://localhost:5000/api/tour-suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Museum Tours Turkey",
    "contact_person": "Ali Yılmaz",
    "email": "info@museumtours.com",
    "phone": "+90 555 1234567",
    "services_offered": "Museum tours, Historical site visits, Guided tours",
    "payment_terms": "50% advance, 50% after tour completion",
    "notes": "Reliable supplier for museum tours",
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
    "message": "Tour supplier not found"
  }
}
```

---

### 3. Create Tour Supplier
**POST** `/api/tour-suppliers`

**Description:** Create a new tour supplier

**Required Fields:**
- `name` (string) - Tour supplier name (must be unique)

**Optional Fields:**
- `contact_person` (string) - Contact person name
- `email` (string) - Email address
- `phone` (string) - Phone number
- `services_offered` (string) - Description of services offered
- `payment_terms` (string) - Payment terms and conditions
- `notes` (string) - Additional notes
- `status` (string) - Status: `active` or `inactive` (default: `active`)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/tour-suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Museum Tours Turkey",
    "contact_person": "Ali Yılmaz",
    "email": "info@museumtours.com",
    "phone": "+90 555 1234567",
    "services_offered": "Museum tours, Historical site visits, Guided tours",
    "payment_terms": "50% advance, 50% after tour completion",
    "notes": "Reliable supplier for museum tours"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Tour supplier created successfully",
  "data": {
    "id": 1,
    "name": "Museum Tours Turkey",
    "contact_person": "Ali Yılmaz",
    "email": "info@museumtours.com",
    "phone": "+90 555 1234567",
    "services_offered": "Museum tours, Historical site visits, Guided tours",
    "payment_terms": "50% advance, 50% after tour completion",
    "notes": "Reliable supplier for museum tours",
    "status": "active",
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
    "message": "Tour supplier name is required"
  }
}
```

**Duplicate Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Tour supplier with this name already exists"
  }
}
```

---

### 4. Update Tour Supplier
**PUT** `/api/tour-suppliers/:id`

**Description:** Update an existing tour supplier

**Note:** Name is required in update requests

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/tour-suppliers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Museum Tours Turkey",
    "payment_terms": "40% advance, 60% after tour completion",
    "notes": "Premium supplier for museum tours"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Tour supplier updated successfully",
  "data": {
    "id": 1,
    "name": "Museum Tours Turkey",
    "contact_person": "Ali Yılmaz",
    "email": "info@museumtours.com",
    "phone": "+90 555 1234567",
    "services_offered": "Museum tours, Historical site visits, Guided tours",
    "payment_terms": "40% advance, 60% after tour completion",
    "notes": "Premium supplier for museum tours",
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
    "message": "Tour supplier not found"
  }
}
```

**Duplicate Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Another tour supplier with this name already exists"
  }
}
```

---

### 5. Delete Tour Supplier (Soft Delete)
**DELETE** `/api/tour-suppliers/:id`

**Description:** Soft delete a tour supplier (sets status to 'inactive')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/tour-suppliers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Tour supplier deleted successfully (status set to inactive)"
}
```

---

### 6. Get Tour Supplier Statistics
**GET** `/api/tour-suppliers/stats/summary`

**Description:** Get summary statistics of tour suppliers

**Example Request:**
```bash
curl http://localhost:5000/api/tour-suppliers/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "active": 20,
    "inactive": 5
  }
}
```

---

## Database Schema

```sql
CREATE TABLE tour_suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    services_offered TEXT,
    payment_terms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active'
);
```

---

## Field Validations

- **name:** Required, max 255 characters, must be unique
- **contact_person:** Optional, max 255 characters
- **email:** Optional, max 255 characters
- **phone:** Optional, max 50 characters
- **services_offered:** Optional, text field
- **payment_terms:** Optional, text field
- **status:** Must be either 'active' or 'inactive'

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Tour supplier not found
- `CONFLICT` (409) - Duplicate tour supplier name
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Search Across Multiple Fields
```bash
curl "http://localhost:5000/api/tour-suppliers?search=museum" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Active Suppliers with Pagination
```bash
curl "http://localhost:5000/api/tour-suppliers?status=active&page=2&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Statistics
```bash
curl http://localhost:5000/api/tour-suppliers/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Search Functionality

The search parameter searches across the following fields:
- Tour supplier name
- Contact person name
- Email address
- Phone number
- Services offered

**Example:**
```bash
# Search for "Ali" - will find matches in any of the above fields
curl "http://localhost:5000/api/tour-suppliers?search=Ali" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated:** 2025-12-06
