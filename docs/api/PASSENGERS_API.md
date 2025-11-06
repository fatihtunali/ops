# Passenger Management API

Base URL: `http://localhost:5000/api/passengers`

All endpoints require authentication: `Authorization: Bearer <token>`

---

## Endpoints

### 1. Get All Passengers
**GET** `/api/passengers`

**Description:** List all passengers with optional booking_id filter

**Query Parameters:**
- `booking_id` (optional) - Filter by booking ID to get passengers for a specific booking

**Example Request:**
```bash
curl http://localhost:5000/api/passengers?booking_id=5 \
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
      "name": "John Smith",
      "passport_number": "AB1234567",
      "nationality": "United Kingdom",
      "date_of_birth": "15/03/1985",
      "special_requests": "Vegetarian meals"
    },
    {
      "id": 2,
      "booking_id": 5,
      "name": "Jane Smith",
      "passport_number": "AB7654321",
      "nationality": "United Kingdom",
      "date_of_birth": "22/07/1987",
      "special_requests": null
    }
  ],
  "count": 2
}
```

---

### 2. Get Single Passenger
**GET** `/api/passengers/:id`

**Description:** Get a specific passenger by ID

**Example Request:**
```bash
curl http://localhost:5000/api/passengers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 5,
    "name": "John Smith",
    "passport_number": "AB1234567",
    "nationality": "United Kingdom",
    "date_of_birth": "15/03/1985",
    "special_requests": "Vegetarian meals"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Passenger not found"
  }
}
```

---

### 3. Get Passengers by Booking
**GET** `/api/passengers/booking/:booking_id`

**Description:** Get all passengers for a specific booking. This endpoint validates that the booking exists before returning passengers.

**Example Request:**
```bash
curl http://localhost:5000/api/passengers/booking/5 \
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
      "name": "John Smith",
      "passport_number": "AB1234567",
      "nationality": "United Kingdom",
      "date_of_birth": "15/03/1985",
      "special_requests": "Vegetarian meals"
    },
    {
      "id": 2,
      "booking_id": 5,
      "name": "Jane Smith",
      "passport_number": "AB7654321",
      "nationality": "United Kingdom",
      "date_of_birth": "22/07/1987",
      "special_requests": null
    }
  ],
  "count": 2
}
```

**Error Response (404 Not Found):**
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

### 4. Create Passenger
**POST** `/api/passengers`

**Description:** Create a new passenger for a booking

**Required Fields:**
- `booking_id` (integer) - Must reference an existing booking
- `name` (string) - Passenger name

**Optional Fields:**
- `passport_number` (string) - Passport number
- `nationality` (string) - Passenger nationality
- `date_of_birth` (string) - Date of birth in `dd/mm/yyyy` format
- `special_requests` (text) - Any special requests (dietary, medical, etc.)

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/passengers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "name": "John Smith",
    "passport_number": "AB1234567",
    "nationality": "United Kingdom",
    "date_of_birth": "15/03/1985",
    "special_requests": "Vegetarian meals"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Passenger created successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "name": "John Smith",
    "passport_number": "AB1234567",
    "nationality": "United Kingdom",
    "date_of_birth": "15/03/1985",
    "special_requests": "Vegetarian meals"
  }
}
```

**Validation Errors (400 Bad Request):**

Missing booking_id:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Booking ID is required"
  }
}
```

Missing name:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Passenger name is required"
  }
}
```

Invalid date format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date format for date_of_birth. Use dd/mm/yyyy format"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found. Booking ID must exist in bookings table"
  }
}
```

---

### 5. Update Passenger
**PUT** `/api/passengers/:id`

**Description:** Update an existing passenger

**All fields are optional** - only send fields you want to update

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/passengers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nationality": "United States",
    "special_requests": "Vegetarian meals, window seat preferred"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Passenger updated successfully",
  "data": {
    "id": 1,
    "booking_id": 5,
    "name": "John Smith",
    "passport_number": "AB1234567",
    "nationality": "United States",
    "date_of_birth": "15/03/1985",
    "special_requests": "Vegetarian meals, window seat preferred"
  }
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Passenger name cannot be empty"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Passenger not found"
  }
}
```

---

### 6. Delete Passenger
**DELETE** `/api/passengers/:id`

**Description:** Permanently delete a passenger (hard delete). This operation is irreversible. When a booking is deleted, all associated passengers are automatically deleted due to CASCADE delete constraint.

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/passengers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Passenger deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Passenger not found"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    passport_number VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    special_requests TEXT
);
```

**Key Points:**
- `booking_id` has a foreign key constraint to the `bookings` table
- `ON DELETE CASCADE` means passengers are automatically deleted when their booking is deleted
- `name` is the only required field besides `booking_id`
- All other fields are optional

---

## Field Validations

- **booking_id:** Required, must reference an existing booking in the bookings table
- **name:** Required, max 255 characters, cannot be empty
- **passport_number:** Optional, max 50 characters
- **nationality:** Optional, max 100 characters
- **date_of_birth:** Optional, must be in `dd/mm/yyyy` format (e.g., "15/03/1985")
- **special_requests:** Optional, text field for any length of special requirements

---

## Date Format

All dates are formatted as **dd/mm/yyyy**:
- Input format: `"15/03/1985"` (string)
- Output format: `"15/03/1985"` (string)

**Examples:**
- Valid: `"01/01/2000"`, `"25/12/1990"`, `"15/03/1985"`
- Invalid: `"2000-01-01"`, `"01/31/2000"`, `"1/1/2000"`

---

## Common Use Cases

### 1. Create Multiple Passengers for a Booking

When creating a group booking, you'll typically create multiple passengers:

```bash
# Create first passenger
curl -X POST http://localhost:5000/api/passengers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "name": "John Smith",
    "passport_number": "AB1234567",
    "nationality": "United Kingdom",
    "date_of_birth": "15/03/1985"
  }'

# Create second passenger
curl -X POST http://localhost:5000/api/passengers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "booking_id": 5,
    "name": "Jane Smith",
    "passport_number": "AB7654321",
    "nationality": "United Kingdom",
    "date_of_birth": "22/07/1987"
  }'
```

### 2. View All Passengers for a Booking

```bash
# Get all passengers for booking ID 5
curl http://localhost:5000/api/passengers/booking/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Update Passenger Details

```bash
# Update passport information
curl -X PUT http://localhost:5000/api/passengers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "passport_number": "NEW123456",
    "nationality": "United States"
  }'
```

---

## Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data or missing required fields
- `NOT_FOUND` (404) - Passenger or booking not found
- `FOREIGN_KEY_ERROR` (400) - Invalid booking_id reference
- `INTERNAL_ERROR` (500) - Server error

---

## Relationship with Bookings

Passengers are child records of bookings:
- Each passenger must belong to exactly one booking
- When a booking is deleted, all its passengers are automatically deleted (CASCADE)
- A booking can have zero or many passengers
- Passenger records cannot exist without a valid booking

**Example Workflow:**
1. Create a booking first
2. Create passenger(s) for that booking
3. View/update passenger details as needed
4. When booking is cancelled/deleted, passengers are automatically removed

---

## Security & Authentication

All endpoints require a valid JWT token:
```
Authorization: Bearer <your-jwt-token>
```

Tokens can be obtained from the `/api/auth/login` endpoint.

---

**Last Updated:** 2025-12-06
