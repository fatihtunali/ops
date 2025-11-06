# Guides Management API

Base URL: `http://localhost:5000/api/guides`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Guides
**GET** `/api/guides`

**Description:** List all guides with optional filters

**Query Parameters:**
- `availability_status` (optional) - Filter by status: `available`, `busy`, or `inactive`
- `languages` (optional) - Search for guides by language (partial match)

**Example Request:**
```bash
curl "http://localhost:5000/api/guides?availability_status=available&languages=English" \
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
      "name": "Mehmet Yılmaz",
      "phone": "+90 555 1234567",
      "languages": "English, Turkish, German",
      "daily_rate": 200.00,
      "specialization": "Historical sites, Museums",
      "availability_status": "available",
      "notes": "Expert in Ottoman history",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get Available Guides Only
**GET** `/api/guides/available`

**Description:** Get only guides with 'available' status

**Example Request:**
```bash
curl http://localhost:5000/api/guides/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Mehmet Yılmaz",
      "phone": "+90 555 1234567",
      "languages": "English, Turkish, German",
      "daily_rate": 200.00,
      "specialization": "Historical sites, Museums",
      "availability_status": "available",
      "notes": "Expert in Ottoman history",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 3. Get Single Guide
**GET** `/api/guides/:id`

**Description:** Get a specific guide by ID

**Example Request:**
```bash
curl http://localhost:5000/api/guides/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mehmet Yılmaz",
    "phone": "+90 555 1234567",
    "languages": "English, Turkish, German",
    "daily_rate": 200.00,
    "specialization": "Historical sites, Museums",
    "availability_status": "available",
    "notes": "Expert in Ottoman history",
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
    "message": "Guide not found"
  }
}
```

---

### 4. Create Guide
**POST** `/api/guides`

**Description:** Create a new guide

**Required Fields:**
- `name` (string) - Guide's full name

**Optional Fields:**
- `phone` (string) - Phone number
- `languages` (string) - Languages spoken (comma-separated)
- `daily_rate` (decimal) - Daily rate for guide services
- `specialization` (string) - Areas of expertise
- `availability_status` (string) - Status: `available`, `busy`, or `inactive` (default: `available`)
- `notes` (string) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/guides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mehmet Yılmaz",
    "phone": "+90 555 1234567",
    "languages": "English, Turkish, German",
    "daily_rate": 200.00,
    "specialization": "Historical sites, Museums",
    "notes": "Expert in Ottoman history"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Guide created successfully",
  "data": {
    "id": 1,
    "name": "Mehmet Yılmaz",
    "phone": "+90 555 1234567",
    "languages": "English, Turkish, German",
    "daily_rate": 200.00,
    "specialization": "Historical sites, Museums",
    "availability_status": "available",
    "notes": "Expert in Ottoman history",
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
    "message": "Name is required"
  }
}
```

**Invalid Status Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid availability status. Must be: available, busy, or inactive"
  }
}
```

---

### 5. Update Guide
**PUT** `/api/guides/:id`

**Description:** Update an existing guide

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/guides/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "daily_rate": 250.00,
    "availability_status": "busy",
    "notes": "Premium guide - Ottoman history expert"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Guide updated successfully",
  "data": {
    "id": 1,
    "name": "Mehmet Yılmaz",
    "phone": "+90 555 1234567",
    "languages": "English, Turkish, German",
    "daily_rate": 250.00,
    "specialization": "Historical sites, Museums",
    "availability_status": "busy",
    "notes": "Premium guide - Ottoman history expert",
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
    "message": "Guide not found"
  }
}
```

---

### 6. Delete Guide (Soft Delete)
**DELETE** `/api/guides/:id`

**Description:** Soft delete a guide (sets availability_status to 'inactive')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/guides/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Guide deleted successfully (soft delete)",
  "data": {
    "id": 1,
    "name": "Mehmet Yılmaz",
    "phone": "+90 555 1234567",
    "languages": "English, Turkish, German",
    "daily_rate": 250.00,
    "specialization": "Historical sites, Museums",
    "availability_status": "inactive",
    "notes": "Premium guide - Ottoman history expert",
    "created_at": "06/11/2025 18:24"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE guides (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    languages VARCHAR(255),
    daily_rate DECIMAL(10,2),
    specialization TEXT,
    availability_status VARCHAR(20) DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Field Validations

- **name:** Required, max 255 characters
- **phone:** Optional, max 50 characters
- **languages:** Optional, max 255 characters (comma-separated)
- **daily_rate:** Optional, decimal(10,2)
- **specialization:** Optional, text field
- **availability_status:** Must be 'available', 'busy', or 'inactive'
- **notes:** Optional, text field

---

## Availability Status Values

- `available` - Guide is available for bookings
- `busy` - Guide is currently occupied
- `inactive` - Guide is not active (soft deleted)

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Guide not found
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Availability
```bash
curl "http://localhost:5000/api/guides?availability_status=available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search by Language
```bash
curl "http://localhost:5000/api/guides?languages=German" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Available Guides
```bash
curl http://localhost:5000/api/guides/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Guide with Minimal Data
```bash
curl -X POST http://localhost:5000/api/guides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Ayşe Demir"
  }'
```

### Update Guide Status
```bash
curl -X PUT http://localhost:5000/api/guides/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "availability_status": "busy"
  }'
```

---

## Languages Format

Languages should be stored as comma-separated strings:
- ✅ Correct: `"English, Turkish, German"`
- ✅ Correct: `"Spanish, French"`
- ✅ Correct: `"Chinese"`

The languages filter supports partial matches, so searching for "English" will find all guides who speak English.

---

**Last Updated:** 2025-12-06
