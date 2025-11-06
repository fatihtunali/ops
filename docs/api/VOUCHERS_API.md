# Voucher Management API

Base URL: `http://localhost:5000/api/vouchers`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Vouchers
**GET** `/api/vouchers`

**Description:** List all vouchers with optional filters

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID (integer)
- `voucher_type` (optional) - Filter by type: `hotel`, `tour`, `transfer`, or `flight`
- `search` (optional) - Search by voucher number (case-insensitive)

**Example Request:**
```bash
curl http://localhost:5000/api/vouchers?booking_id=5&voucher_type=hotel \
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
      "voucher_type": "hotel",
      "service_id": 12,
      "voucher_number": "VC-20251106-0001",
      "issued_date": "06/11/2025 14:30",
      "pdf_path": "/vouchers/VC-20251106-0001.pdf",
      "sent_to": "client@example.com",
      "sent_at": "06/11/2025 14:35"
    }
  ],
  "count": 1
}
```

---

### 2. Get Single Voucher
**GET** `/api/vouchers/:id`

**Description:** Get a specific voucher by ID

**Example Request:**
```bash
curl http://localhost:5000/api/vouchers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 5,
    "voucher_type": "hotel",
    "service_id": 12,
    "voucher_number": "VC-20251106-0001",
    "issued_date": "06/11/2025 14:30",
    "pdf_path": "/vouchers/VC-20251106-0001.pdf",
    "sent_to": "client@example.com",
    "sent_at": "06/11/2025 14:35"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Voucher not found"
  }
}
```

---

### 3. Create Voucher
**POST** `/api/vouchers`

**Description:** Create a new voucher with auto-generated voucher number

**Required Fields:**
- `booking_id` (integer) - Reference to booking
- `voucher_type` (string) - Must be one of: `hotel`, `tour`, `transfer`, `flight`

**Optional Fields:**
- `service_id` (integer) - References booking_hotels, booking_tours, etc.
- `pdf_path` (string) - File path to generated PDF
- `sent_to` (string) - Email address where voucher was sent

**Auto-Generated Fields:**
- `voucher_number` - Format: VC-YYYYMMDD-NNNN (e.g., VC-20251106-0001)
- `issued_date` - Automatically set to current timestamp
- `sent_at` - Automatically set when `sent_to` is provided

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/vouchers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "voucher_type": "hotel",
    "service_id": 12,
    "pdf_path": "/vouchers/hotel-booking-5.pdf",
    "sent_to": "client@example.com"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Voucher created successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "voucher_type": "hotel",
    "service_id": 12,
    "voucher_number": "VC-20251106-0001",
    "issued_date": "06/11/2025 14:30",
    "pdf_path": "/vouchers/hotel-booking-5.pdf",
    "sent_to": "client@example.com",
    "sent_at": "06/11/2025 14:30"
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
    "message": "Valid voucher type is required (hotel, tour, transfer, or flight)"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking not found"
  }
}
```

---

### 4. Update Voucher
**PUT** `/api/vouchers/:id`

**Description:** Update an existing voucher

**All fields are optional** - only send fields you want to update

**Updatable Fields:**
- `booking_id` (integer)
- `voucher_type` (string)
- `service_id` (integer)
- `pdf_path` (string)
- `sent_to` (string)

**Non-Updatable Fields:**
- `voucher_number` - Cannot be changed (auto-generated on create)
- `issued_date` - Cannot be changed (set on create)
- `sent_at` - Auto-updated when `sent_to` is modified

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/vouchers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pdf_path": "/vouchers/updated-VC-20251106-0001.pdf",
    "sent_to": "newemail@example.com"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Voucher updated successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "voucher_type": "hotel",
    "service_id": 12,
    "voucher_number": "VC-20251106-0001",
    "issued_date": "06/11/2025 14:30",
    "pdf_path": "/vouchers/updated-VC-20251106-0001.pdf",
    "sent_to": "newemail@example.com",
    "sent_at": "06/11/2025 15:45"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Voucher not found"
  }
}
```

---

### 5. Delete Voucher (Hard Delete)
**DELETE** `/api/vouchers/:id`

**Description:** Permanently delete a voucher

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/vouchers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Voucher deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Voucher not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    voucher_type VARCHAR(50), -- 'hotel', 'tour', 'transfer', 'flight'
    service_id INTEGER, -- references booking_hotels, booking_tours, etc.
    voucher_number VARCHAR(100) UNIQUE,
    issued_date TIMESTAMP DEFAULT NOW(),
    pdf_path VARCHAR(255), -- file path to generated PDF
    sent_to VARCHAR(255), -- email address where sent
    sent_at TIMESTAMP,
    CONSTRAINT chk_voucher_type CHECK (voucher_type IN ('hotel', 'tour', 'transfer', 'flight'))
);

CREATE INDEX idx_vouchers_booking ON vouchers(booking_id);
CREATE INDEX idx_vouchers_number ON vouchers(voucher_number);
```

---

## Voucher Number Format

Voucher numbers are **auto-generated** using the format:

```
VC-YYYYMMDD-NNNN
```

**Examples:**
- `VC-20251106-0001` - First voucher on November 6, 2025
- `VC-20251106-0002` - Second voucher on November 6, 2025
- `VC-20251107-0001` - First voucher on November 7, 2025

**Key Points:**
- Unique per day
- Sequential numbering resets daily
- Cannot be manually set or changed
- Guaranteed uniqueness via database constraint

---

## Field Validations

- **booking_id:** Required, must exist in bookings table
- **voucher_type:** Required, must be one of: `hotel`, `tour`, `transfer`, `flight`
- **service_id:** Optional, integer reference to service tables
- **voucher_number:** Auto-generated, unique, cannot be changed
- **issued_date:** Auto-set on creation, cannot be changed
- **pdf_path:** Optional, max 255 characters
- **sent_to:** Optional, typically an email address
- **sent_at:** Auto-set when sent_to is provided or updated

---

## Date Format

All dates are formatted as: **dd/mm/yyyy hh:mm**

**Examples:**
- `06/11/2025 14:30`
- `25/12/2025 09:15`

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Voucher not found
- `DUPLICATE_ERROR` (400) - Voucher number already exists (shouldn't happen with auto-generation)
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Create a hotel voucher
```bash
curl -X POST http://localhost:5000/api/vouchers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 10,
    "voucher_type": "hotel",
    "service_id": 5,
    "sent_to": "guest@hotel.com"
  }'
```

### Get all vouchers for a specific booking
```bash
curl "http://localhost:5000/api/vouchers?booking_id=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get all hotel vouchers
```bash
curl "http://localhost:5000/api/vouchers?voucher_type=hotel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search for a specific voucher
```bash
curl "http://localhost:5000/api/vouchers?search=VC-20251106" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark voucher as sent to a new recipient
```bash
curl -X PUT http://localhost:5000/api/vouchers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sent_to": "recipient@example.com"
  }'
```

---

**Last Updated:** 2025-11-06
