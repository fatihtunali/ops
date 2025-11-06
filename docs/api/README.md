# Funny Tourism Operations - API Documentation

**Base URL:** `http://localhost:5000`
**Production URL:** (To be configured)

---

## Authentication

All API endpoints (except login) require authentication using JWT tokens.

**Login to get token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Use token in requests:**
```bash
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Available API Endpoints

### Authentication
- [Authentication API](./AUTH_API.md) - Login, logout, get current user
  - `POST /api/auth/login` - Login
  - `GET /api/auth/me` - Get current user
  - `POST /api/auth/logout` - Logout

### Management APIs

#### Client Management
- [Clients API](./CLIENTS_API.md) - Manage agents and direct clients
  - `GET /api/clients` - List all clients
  - `GET /api/clients/:id` - Get single client
  - `POST /api/clients` - Create client
  - `PUT /api/clients/:id` - Update client
  - `DELETE /api/clients/:id` - Delete client (soft delete)

#### Hotel Management
- [Hotels API](./HOTELS_API.md) - Manage hotel database
  - `GET /api/hotels` - List all hotels
  - `GET /api/hotels/:id` - Get single hotel
  - `POST /api/hotels` - Create hotel
  - `PUT /api/hotels/:id` - Update hotel
  - `DELETE /api/hotels/:id` - Delete hotel (soft delete)

#### Tour Suppliers Management
- [Tour Suppliers API](./TOUR_SUPPLIERS_API.md) - Manage tour operators
  - `GET /api/tour-suppliers` - List all suppliers
  - `GET /api/tour-suppliers/:id` - Get single supplier
  - `POST /api/tour-suppliers` - Create supplier
  - `PUT /api/tour-suppliers/:id` - Update supplier
  - `DELETE /api/tour-suppliers/:id` - Delete supplier (soft delete)
  - `GET /api/tour-suppliers/stats/summary` - Get statistics

#### Guides Management
- [Guides API](./GUIDES_API.md) - Manage tour guides
  - `GET /api/guides` - List all guides
  - `GET /api/guides/available` - Get available guides only
  - `GET /api/guides/:id` - Get single guide
  - `POST /api/guides` - Create guide
  - `PUT /api/guides/:id` - Update guide
  - `DELETE /api/guides/:id` - Delete guide (soft delete)

#### Vehicles Management
- [Vehicles API](./VEHICLES_API.md) - Manage vehicle fleet
  - `GET /api/vehicles` - List all vehicles
  - `GET /api/vehicles/available` - Get available vehicles only
  - `GET /api/vehicles/:id` - Get single vehicle
  - `POST /api/vehicles` - Create vehicle
  - `PUT /api/vehicles/:id` - Update vehicle
  - `DELETE /api/vehicles/:id` - Delete vehicle (soft delete)

### Booking APIs
- [Bookings API](./BOOKINGS_API.md) - Manage tour bookings (inquiries, quotes, confirmed bookings)
  - `GET /api/bookings` - List all bookings
  - `GET /api/bookings/:id` - Get single booking
  - `POST /api/bookings` - Create booking (auto-generates booking code)
  - `PUT /api/bookings/:id` - Update booking
  - `DELETE /api/bookings/:id` - Delete booking (soft delete - sets status to cancelled)

- [Passengers API](./PASSENGERS_API.md) - Manage passengers in bookings
  - `GET /api/passengers` - List all passengers
  - `GET /api/passengers/:id` - Get single passenger
  - `GET /api/passengers/booking/:booking_id` - Get all passengers for a booking
  - `POST /api/passengers` - Create passenger
  - `PUT /api/passengers/:id` - Update passenger
  - `DELETE /api/passengers/:id` - Delete passenger

### Booking Services APIs
- [Booking Hotels API](./BOOKING_HOTELS_API.md) - Add hotel services to bookings
  - `GET /api/booking-hotels` - List all booking hotels
  - `GET /api/booking-hotels/:id` - Get single booking hotel
  - `POST /api/booking-hotels` - Create booking hotel
  - `PUT /api/booking-hotels/:id` - Update booking hotel
  - `DELETE /api/booking-hotels/:id` - Delete booking hotel

- [Booking Tours API](./BOOKING_TOURS_API.md) - Add tour services to bookings (supplier or self-operated)
  - `GET /api/booking-tours` - List all booking tours
  - `GET /api/booking-tours/:id` - Get single booking tour
  - `GET /api/booking-tours/booking/:booking_id` - Get all tours for a booking
  - `GET /api/booking-tours/stats/summary` - Get tour statistics
  - `POST /api/booking-tours` - Create booking tour
  - `PUT /api/booking-tours/:id` - Update booking tour
  - `DELETE /api/booking-tours/:id` - Delete booking tour

- [Booking Transfers API](./BOOKING_TRANSFERS_API.md) - Add transfer services to bookings
  - `GET /api/booking-transfers` - List all booking transfers
  - `GET /api/booking-transfers/:id` - Get single booking transfer
  - `GET /api/booking-transfers/booking/:booking_id` - Get all transfers for a booking
  - `POST /api/booking-transfers` - Create booking transfer
  - `PUT /api/booking-transfers/:id` - Update booking transfer
  - `DELETE /api/booking-transfers/:id` - Delete booking transfer

- [Booking Flights API](./BOOKING_FLIGHTS_API.md) - Add flight services to bookings
  - `GET /api/booking-flights` - List all booking flights
  - `GET /api/booking-flights/:id` - Get single booking flight
  - `GET /api/booking-flights/booking/:booking_id` - Get all flights for a booking
  - `POST /api/booking-flights` - Create booking flight
  - `PUT /api/booking-flights/:id` - Update booking flight
  - `DELETE /api/booking-flights/:id` - Delete booking flight

### Payment APIs
- [Client Payments API](./CLIENT_PAYMENTS_API.md) - Track payments from clients (money IN)
  - `GET /api/client-payments` - List all client payments
  - `GET /api/client-payments/:id` - Get single payment
  - `GET /api/client-payments/booking/:booking_id` - Get all payments for a booking
  - `POST /api/client-payments` - Create client payment
  - `PUT /api/client-payments/:id` - Update client payment
  - `DELETE /api/client-payments/:id` - Delete client payment

- [Supplier Payments API](./SUPPLIER_PAYMENTS_API.md) - Track payments to suppliers (money OUT)
  - `GET /api/supplier-payments` - List all supplier payments
  - `GET /api/supplier-payments/:id` - Get single payment
  - `GET /api/supplier-payments/stats` - Get payment statistics
  - `POST /api/supplier-payments` - Create supplier payment
  - `PUT /api/supplier-payments/:id` - Update supplier payment
  - `DELETE /api/supplier-payments/:id` - Delete supplier payment

### Financial APIs
- [Operational Expenses API](./OPERATIONAL_EXPENSES_API.md) - Track operational expenses (rent, salaries, utilities, etc.)
  - `GET /api/operational-expenses` - List all expenses
  - `GET /api/operational-expenses/:id` - Get single expense
  - `GET /api/operational-expenses/recurring` - Get recurring expenses only
  - `GET /api/operational-expenses/by-category/:category` - Get expenses by category
  - `POST /api/operational-expenses` - Create expense
  - `PUT /api/operational-expenses/:id` - Update expense
  - `DELETE /api/operational-expenses/:id` - Delete expense

- Reports API - Generate financial reports (Coming Soon)

### Voucher APIs
- [Vouchers API](./VOUCHERS_API.md) - Generate and manage vouchers
  - `GET /api/vouchers` - List all vouchers
  - `GET /api/vouchers/:id` - Get single voucher
  - `POST /api/vouchers` - Create voucher (auto-generates voucher number)
  - `PUT /api/vouchers/:id` - Update voucher
  - `DELETE /api/vouchers/:id` - Delete voucher

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Common HTTP Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST (resource created)
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required or token invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., unique constraint)
- `500 Internal Server Error` - Server error

---

## Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ERROR` - Duplicate resource
- `INTERNAL_ERROR` - Server error

---

## Date & Time Format

All dates and times are formatted as:
- **Date:** `dd/mm/yyyy` (e.g., 06/12/2025)
- **Time:** `hh:mm` (24-hour format, e.g., 14:30)
- **DateTime:** `dd/mm/yyyy hh:mm` (e.g., 06/12/2025 14:30)

Example in API responses:
```json
{
  "created_at": "06/11/2025 18:24",
  "travel_date": "10/12/2025"
}
```

---

## Pagination (Where Applicable)

Some endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response includes pagination info:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## Filtering & Search

Many endpoints support filtering:

**Common Query Parameters:**
- `status` - Filter by status (active/inactive)
- `search` - Search by name or other fields
- `type` - Filter by type (entity-specific)

**Example:**
```bash
GET /api/clients?type=agent&status=active&search=ABC
```

---

## Testing with curl

**Login:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' | \
  grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

**Use token:**
```bash
curl http://localhost:5000/api/clients \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing with Postman

1. **Import Environment:**
   - Create variable: `baseUrl` = `http://localhost:5000`
   - Create variable: `token` = (empty, will be set by login)

2. **Login Request:**
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Body: `{"username":"admin","password":"your_password"}`
   - In Tests tab, add: `pm.environment.set("token", pm.response.json().token);`

3. **Use in other requests:**
   - Add header: `Authorization: Bearer {{token}}`

---

## Rate Limiting

Currently no rate limiting is implemented. May be added in future versions.

---

## API Versioning

Current version: **v1.0**
All endpoints are under `/api/` prefix

Future versions may use `/api/v2/` prefix.

---

## Support

For API issues or questions:
- Check individual API documentation files
- Review [API_PLAN.md](../API_PLAN.md) for implementation details
- Check server logs for error details

---

**Last Updated:** 2025-12-06
**API Version:** 1.0
**Server:** Node.js + Express + PostgreSQL
