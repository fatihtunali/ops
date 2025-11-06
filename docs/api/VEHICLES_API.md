# Vehicles Management API

Base URL: `http://localhost:5000/api/vehicles`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Vehicles
**GET** `/api/vehicles`

**Description:** List all vehicles (excluding inactive) with optional filters

**Query Parameters:**
- `status` (optional) - Filter by status: `available`, `in_use`, or `maintenance`
- `type` (optional) - Filter by vehicle type (partial match)

**Example Request:**
```bash
curl "http://localhost:5000/api/vehicles?status=available&type=minibus" \
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
      "vehicle_number": "34 ABC 123",
      "type": "Minibus",
      "capacity": 14,
      "daily_rate": 300.00,
      "driver_name": "Ahmet Yılmaz",
      "driver_phone": "+90 555 1234567",
      "status": "available",
      "notes": "Air-conditioned, excellent condition",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 2. Get Available Vehicles Only
**GET** `/api/vehicles/available`

**Description:** Get only vehicles with 'available' status

**Example Request:**
```bash
curl http://localhost:5000/api/vehicles/available \
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
      "vehicle_number": "34 ABC 123",
      "type": "Minibus",
      "capacity": 14,
      "daily_rate": 300.00,
      "driver_name": "Ahmet Yılmaz",
      "driver_phone": "+90 555 1234567",
      "status": "available",
      "notes": "Air-conditioned, excellent condition",
      "created_at": "06/11/2025 18:24"
    }
  ]
}
```

---

### 3. Get Single Vehicle
**GET** `/api/vehicles/:id`

**Description:** Get a specific vehicle by ID

**Example Request:**
```bash
curl http://localhost:5000/api/vehicles/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vehicle_number": "34 ABC 123",
    "type": "Minibus",
    "capacity": 14,
    "daily_rate": 300.00,
    "driver_name": "Ahmet Yılmaz",
    "driver_phone": "+90 555 1234567",
    "status": "available",
    "notes": "Air-conditioned, excellent condition",
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
    "message": "Vehicle not found"
  }
}
```

---

### 4. Create Vehicle
**POST** `/api/vehicles`

**Description:** Create a new vehicle

**Required Fields:**
- `vehicle_number` (string) - Vehicle plate number (must be unique)

**Optional Fields:**
- `type` (string) - Vehicle type (e.g., "Minibus", "Coach", "Van")
- `capacity` (integer) - Passenger capacity
- `daily_rate` (decimal) - Daily rental rate
- `driver_name` (string) - Assigned driver name
- `driver_phone` (string) - Driver phone number
- `status` (string) - Status: `available`, `in_use`, `maintenance`, or `inactive` (default: `available`)
- `notes` (string) - Additional notes

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vehicle_number": "34 ABC 123",
    "type": "Minibus",
    "capacity": 14,
    "daily_rate": 300.00,
    "driver_name": "Ahmet Yılmaz",
    "driver_phone": "+90 555 1234567",
    "notes": "Air-conditioned, excellent condition"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "id": 1,
    "vehicle_number": "34 ABC 123",
    "type": "Minibus",
    "capacity": 14,
    "daily_rate": 300.00,
    "driver_name": "Ahmet Yılmaz",
    "driver_phone": "+90 555 1234567",
    "status": "available",
    "notes": "Air-conditioned, excellent condition",
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
    "message": "Vehicle number is required"
  }
}
```

**Invalid Status Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid status. Must be: available, in_use, maintenance, or inactive"
  }
}
```

**Duplicate Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ERROR",
    "message": "Vehicle number already exists"
  }
}
```

---

### 5. Update Vehicle
**PUT** `/api/vehicles/:id`

**Description:** Update an existing vehicle

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/vehicles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "daily_rate": 350.00,
    "status": "in_use",
    "notes": "Premium minibus - recently serviced"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle updated successfully",
  "data": {
    "id": 1,
    "vehicle_number": "34 ABC 123",
    "type": "Minibus",
    "capacity": 14,
    "daily_rate": 350.00,
    "driver_name": "Ahmet Yılmaz",
    "driver_phone": "+90 555 1234567",
    "status": "in_use",
    "notes": "Premium minibus - recently serviced",
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
    "message": "Vehicle not found"
  }
}
```

**Duplicate Error (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ERROR",
    "message": "Vehicle number already exists"
  }
}
```

---

### 6. Delete Vehicle (Soft Delete)
**DELETE** `/api/vehicles/:id`

**Description:** Soft delete a vehicle (sets status to 'inactive')

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/vehicles/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

**Already Deleted Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_DELETED",
    "message": "Vehicle already deleted"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100),
    capacity INTEGER,
    daily_rate DECIMAL(10,2),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Field Validations

- **vehicle_number:** Required, max 50 characters, must be unique
- **type:** Optional, max 100 characters
- **capacity:** Optional, integer
- **daily_rate:** Optional, decimal(10,2)
- **driver_name:** Optional, max 255 characters
- **driver_phone:** Optional, max 50 characters
- **status:** Must be 'available', 'in_use', 'maintenance', or 'inactive'
- **notes:** Optional, text field

---

## Status Values

- `available` - Vehicle is available for bookings
- `in_use` - Vehicle is currently in use
- `maintenance` - Vehicle is under maintenance
- `inactive` - Vehicle is deactivated (soft deleted)

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `NOT_FOUND` (404) - Vehicle not found
- `DUPLICATE_ERROR` (409) - Vehicle number already exists
- `ALREADY_DELETED` (400) - Vehicle already soft deleted
- `INTERNAL_ERROR` (500) - Server error

---

## Usage Examples

### Filter by Status
```bash
curl "http://localhost:5000/api/vehicles?status=available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filter by Type
```bash
curl "http://localhost:5000/api/vehicles?type=coach" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Available Vehicles
```bash
curl http://localhost:5000/api/vehicles/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Vehicle with Minimal Data
```bash
curl -X POST http://localhost:5000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vehicle_number": "06 XYZ 789"
  }'
```

### Update Vehicle Status to Maintenance
```bash
curl -X PUT http://localhost:5000/api/vehicles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "maintenance"
  }'
```

### Assign Driver to Vehicle
```bash
curl -X PUT http://localhost:5000/api/vehicles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "driver_name": "Mehmet Demir",
    "driver_phone": "+90 555 9876543"
  }'
```

---

## Common Vehicle Types

- Vito (4 passengers) - Max 4 pax 
- Minibus (04-12 passengers) - Max 12 pax
- Isuzu (12-20 passengers) - Max 20 pax
- Coach (30-46 passengers) - Max 44 pax

---

**Last Updated:** 2025-12-06
