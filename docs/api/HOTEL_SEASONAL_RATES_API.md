# Hotel Seasonal Rates API Documentation

## Overview
The Hotel Seasonal Rates API allows you to manage pricing for hotels based on different seasons or periods. Each hotel can have multiple rate periods with different pricing structures for various room types and age groups.

## Base URL
```
http://localhost:5000/api/hotels/:hotelId/seasonal-rates
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Pricing Structure

Each seasonal rate includes:

| Field | Type | Description |
|-------|------|-------------|
| `price_per_person_double` | Decimal(10,2) | Price per person in a double room |
| `price_single_supplement` | Decimal(10,2) | Additional charge for single occupancy |
| `price_per_person_triple` | Decimal(10,2) | Price per person in a triple room |
| `price_child_0_2` | Decimal(10,2) | Child aged 0-2.99 years with 2 adults |
| `price_child_3_5` | Decimal(10,2) | Child aged 3-5.99 years with 2 adults |
| `price_child_6_11` | Decimal(10,2) | Child aged 6-11.99 years with 2 adults |

## Supported Room Types
- **DBL** (Double) - Two guests
- **SGL** (Single) - One guest (uses double rate + single supplement)
- **TRP** (Triple) - Three guests
- **Suite** - Premium rooms (custom pricing)
- **Special** - Custom configurations

---

## Endpoints

### 1. Get All Seasonal Rates for a Hotel

**GET** `/api/hotels/:hotelId/seasonal-rates`

Retrieves all seasonal rate periods for a specific hotel.

**Path Parameters:**
- `hotelId` (integer) - Hotel ID

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "hotel_id": 1,
      "season_name": "Summer 2025",
      "valid_from": "2025-06-01",
      "valid_to": "2025-08-31",
      "price_per_person_double": 80.00,
      "price_single_supplement": 30.00,
      "price_per_person_triple": 70.00,
      "price_child_0_2": 0.00,
      "price_child_3_5": 20.00,
      "price_child_6_11": 40.00,
      "notes": "Peak summer season",
      "created_at": "2025-01-15 10:30:00",
      "updated_at": "2025-01-15 10:30:00"
    },
    {
      "id": 2,
      "hotel_id": 1,
      "season_name": "Winter 2025",
      "valid_from": "2025-12-01",
      "valid_to": "2026-02-28",
      "price_per_person_double": 60.00,
      "price_single_supplement": 25.00,
      "price_per_person_triple": 55.00,
      "price_child_0_2": 0.00,
      "price_child_3_5": 15.00,
      "price_child_6_11": 30.00,
      "notes": "Off-season pricing",
      "created_at": "2025-01-15 10:35:00",
      "updated_at": "2025-01-15 10:35:00"
    }
  ]
}
```

---

### 2. Get Rate for Specific Date

**GET** `/api/hotels/:hotelId/seasonal-rates/date/:date`

Get the applicable rate for a hotel on a specific date.

**Path Parameters:**
- `hotelId` (integer) - Hotel ID
- `date` (string) - Date in YYYY-MM-DD format (e.g., "2025-07-15")

**Response:**
```json
{
  "success": true,
  "data": {
    "rate_id": 1,
    "season_name": "Summer 2025",
    "price_per_person_double": 80.00,
    "price_single_supplement": 30.00,
    "price_per_person_triple": 70.00,
    "price_child_0_2": 0.00,
    "price_child_3_5": 20.00,
    "price_child_6_11": 40.00
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No rate found for the specified date"
  }
}
```

---

### 3. Create Seasonal Rate

**POST** `/api/hotels/:hotelId/seasonal-rates`

Create a new seasonal rate period for a hotel.

**Path Parameters:**
- `hotelId` (integer) - Hotel ID

**Request Body:**
```json
{
  "season_name": "Summer 2025",
  "valid_from": "2025-06-01",
  "valid_to": "2025-08-31",
  "price_per_person_double": 80.00,
  "price_single_supplement": 30.00,
  "price_per_person_triple": 70.00,
  "price_child_0_2": 0.00,
  "price_child_3_5": 20.00,
  "price_child_6_11": 40.00,
  "notes": "Peak summer season"
}
```

**Required Fields:**
- `season_name` (string) - Name of the season/period
- `valid_from` (date) - Start date (YYYY-MM-DD)
- `valid_to` (date) - End date (YYYY-MM-DD)

**Optional Fields:**
- All price fields (default to null if not provided)
- `notes` (text) - Additional notes

**Success Response (201):**
```json
{
  "success": true,
  "message": "Seasonal rate created successfully",
  "data": {
    "id": 1,
    "hotel_id": 1,
    "season_name": "Summer 2025",
    "valid_from": "2025-06-01",
    "valid_to": "2025-08-31",
    "price_per_person_double": 80.00,
    "price_single_supplement": 30.00,
    "price_per_person_triple": 70.00,
    "price_child_0_2": 0.00,
    "price_child_3_5": 20.00,
    "price_child_6_11": 40.00,
    "notes": "Peak summer season",
    "created_at": "2025-01-15 10:30:00",
    "updated_at": "2025-01-15 10:30:00"
  }
}
```

**Error Response - Overlapping Dates (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Date range overlaps with existing season: Winter 2025"
  }
}
```

---

### 4. Update Seasonal Rate

**PUT** `/api/hotels/:hotelId/seasonal-rates/:rateId`

Update an existing seasonal rate period.

**Path Parameters:**
- `hotelId` (integer) - Hotel ID
- `rateId` (integer) - Seasonal rate ID

**Request Body:**
```json
{
  "season_name": "Summer 2025 - Updated",
  "price_per_person_double": 85.00,
  "price_single_supplement": 35.00,
  "notes": "Updated pricing for peak summer"
}
```

**Note:** Only include fields you want to update. All fields are optional.

**Success Response:**
```json
{
  "success": true,
  "message": "Seasonal rate updated successfully",
  "data": {
    "id": 1,
    "hotel_id": 1,
    "season_name": "Summer 2025 - Updated",
    "valid_from": "2025-06-01",
    "valid_to": "2025-08-31",
    "price_per_person_double": 85.00,
    "price_single_supplement": 35.00,
    "price_per_person_triple": 70.00,
    "price_child_0_2": 0.00,
    "price_child_3_5": 20.00,
    "price_child_6_11": 40.00,
    "notes": "Updated pricing for peak summer",
    "created_at": "2025-01-15 10:30:00",
    "updated_at": "2025-01-15 12:45:00"
  }
}
```

---

### 5. Delete Seasonal Rate

**DELETE** `/api/hotels/:hotelId/seasonal-rates/:rateId`

Delete a seasonal rate period.

**Path Parameters:**
- `hotelId` (integer) - Hotel ID
- `rateId` (integer) - Seasonal rate ID

**Success Response:**
```json
{
  "success": true,
  "message": "Seasonal rate deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Seasonal rate not found for this hotel"
  }
}
```

---

## Pricing Calculation Examples

### Example 1: Double Room for 2 Adults
- **Room Type:** DBL
- **Guests:** 2 adults
- **Calculation:** 2 × `price_per_person_double`
- **Example:** 2 × $80 = **$160 per night**

### Example 2: Single Room
- **Room Type:** SGL
- **Guests:** 1 adult
- **Calculation:** `price_per_person_double` + `price_single_supplement`
- **Example:** $80 + $30 = **$110 per night**

### Example 3: Triple Room for 3 Adults
- **Room Type:** TRP
- **Guests:** 3 adults
- **Calculation:** 3 × `price_per_person_triple`
- **Example:** 3 × $70 = **$210 per night**

### Example 4: Family Room (2 Adults + 1 Child aged 4)
- **Room Type:** DBL
- **Guests:** 2 adults + 1 child (aged 4)
- **Calculation:** (2 × `price_per_person_double`) + `price_child_3_5`
- **Example:** (2 × $80) + $20 = **$180 per night**

### Example 5: Family Room (2 Adults + 2 Children aged 1 and 7)
- **Room Type:** Special
- **Guests:** 2 adults + 2 children (aged 1 and 7)
- **Calculation:** (2 × `price_per_person_double`) + `price_child_0_2` + `price_child_6_11`
- **Example:** (2 × $80) + $0 + $40 = **$200 per night**

---

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `NOT_FOUND` | 404 | Hotel or rate not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing the API

### Using cURL:

**Get all rates for hotel ID 1:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/hotels/1/seasonal-rates
```

**Get rate for specific date:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/hotels/1/seasonal-rates/date/2025-07-15
```

**Create new rate:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "season_name": "Summer 2025",
    "valid_from": "2025-06-01",
    "valid_to": "2025-08-31",
    "price_per_person_double": 80.00,
    "price_single_supplement": 30.00,
    "price_per_person_triple": 70.00,
    "price_child_0_2": 0.00,
    "price_child_3_5": 20.00,
    "price_child_6_11": 40.00
  }' \
  http://localhost:5000/api/hotels/1/seasonal-rates
```

---

## Notes

- Date ranges for a hotel **cannot overlap**
- Dates must be in **YYYY-MM-DD** format
- All prices are stored as `DECIMAL(10,2)` (supports up to 99,999,999.99)
- Prices can be `null` if not applicable
- The system automatically selects the most recent rate if multiple rates could apply to a date
- When a rate is deleted, it's permanently removed (not a soft delete)

---

**Last Updated:** 2025-11-07
