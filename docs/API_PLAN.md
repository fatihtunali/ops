# Backend API Plan - Funny Tourism Operations

**Based on Database Schema Version 1.0**
**Last Updated:** 2025-12-06

---

## Database Schema Review

### Core Tables (17 total):
1. **users** - System users (admin, staff, accountant)
2. **clients** - Agents and direct clients
3. **hotels** - Hotel database
4. **tour_suppliers** - Tour operator suppliers
5. **guides** - Guide database (for self-operated tours)
6. **vehicles** - Vehicle fleet
7. **bookings** - Main booking table
8. **passengers** - Passengers in each booking
9. **booking_hotels** - Hotel services in booking
10. **booking_tours** - Tour services in booking
11. **booking_transfers** - Transfer services in booking
12. **booking_flights** - Flight services in booking
13. **client_payments** - Money IN from clients
14. **supplier_payments** - Money OUT to suppliers
15. **operational_expenses** - Office expenses
16. **vouchers** - Generated voucher documents
17. **audit_log** - System audit trail

### Database Functions:
- `generate_booking_code()` - Auto-generates Funny-XXXX codes
- `calculate_booking_totals()` - Calculates booking totals
- `update_payment_status()` - Updates payment status

### Database Views:
- `view_outstanding_receivables` - Money to collect
- `view_outstanding_payables` - Money to pay
- `view_monthly_revenue` - Monthly P&L data
- `view_booking_services` - All services per booking

---

## API Architecture

### Technology Stack:
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database Client:** pg (node-postgres)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **CORS:** cors middleware

### Project Structure:
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   ├── controllers/
│   │   ├── authController.js    # Login, logout
│   │   ├── userController.js    # User management
│   │   ├── clientController.js  # Client CRUD
│   │   ├── hotelController.js   # Hotel CRUD
│   │   ├── tourSupplierController.js
│   │   ├── guideController.js
│   │   ├── vehicleController.js
│   │   ├── bookingController.js # Booking CRUD
│   │   ├── serviceController.js # Hotel/Tour/Transfer/Flight services
│   │   ├── paymentController.js # Client & supplier payments
│   │   ├── expenseController.js # Operational expenses
│   │   ├── reportController.js  # Financial reports
│   │   └── voucherController.js # Voucher generation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── clients.js
│   │   ├── hotels.js
│   │   ├── tourSuppliers.js
│   │   ├── guides.js
│   │   ├── vehicles.js
│   │   ├── bookings.js
│   │   ├── services.js
│   │   ├── payments.js
│   │   ├── expenses.js
│   │   ├── reports.js
│   │   └── vouchers.js
│   ├── services/
│   │   ├── bookingService.js    # Business logic
│   │   └── paymentService.js
│   └── utils/
│       ├── logger.js
│       └── helpers.js
├── server.js                     # Entry point
├── package.json
└── .env
```

---

## API Endpoints Plan

### Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Users

### POST `/auth/login`
**Description:** User login
**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@funnytourism.com",
    "full_name": "System Administrator",
    "role": "admin"
  }
}
```

### POST `/auth/logout`
**Description:** User logout (optional, mainly client-side)
**Headers:** `Authorization: Bearer <token>`

### GET `/auth/me`
**Description:** Get current user info
**Headers:** `Authorization: Bearer <token>`

### GET `/users`
**Description:** List all users (admin only)
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `?role=admin&status=active`

### POST `/users`
**Description:** Create new user (admin only)
**Request Body:**
```json
{
  "username": "staff1",
  "email": "staff1@funnytourism.com",
  "password": "password123",
  "full_name": "Staff Member",
  "role": "staff"
}
```

### PUT `/users/:id`
**Description:** Update user

### DELETE `/users/:id`
**Description:** Deactivate user (soft delete)

---

## 2. Client Management

### GET `/clients`
**Description:** List all clients
**Query Params:** `?type=agent&status=active&search=ABC`
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client_code": "CL001",
      "name": "ABC Travel Agency",
      "type": "agent",
      "email": "info@abctravel.com",
      "phone": "+90 555 1234567",
      "commission_rate": 15.00,
      "status": "active"
    }
  ]
}
```

### GET `/clients/:id`
**Description:** Get single client details
**Response:** Client object + booking history

### POST `/clients`
**Description:** Create new client
**Request Body:**
```json
{
  "name": "XYZ Tours",
  "type": "agent",
  "email": "info@xyztours.com",
  "phone": "+90 555 9876543",
  "address": "Istanbul, Turkey",
  "commission_rate": 12.50,
  "notes": "VIP client"
}
```

### PUT `/clients/:id`
**Description:** Update client

### DELETE `/clients/:id`
**Description:** Deactivate client (soft delete)

---

## 3. Hotel Management

### GET `/hotels`
**Description:** List all hotels
**Query Params:** `?city=Istanbul&status=active`

### GET `/hotels/:id`
**Description:** Get hotel details

### POST `/hotels`
**Description:** Create new hotel
**Request Body:**
```json
{
  "name": "Hilton Istanbul",
  "city": "Istanbul",
  "country": "Turkey",
  "contact_person": "John Doe",
  "contact_email": "reservations@hilton.com",
  "contact_phone": "+90 212 1234567",
  "standard_cost_per_night": 150.00,
  "notes": "5-star hotel"
}
```

### PUT `/hotels/:id`
**Description:** Update hotel

### DELETE `/hotels/:id`
**Description:** Deactivate hotel

---

## 4. Tour Suppliers Management

### GET `/tour-suppliers`
**Description:** List all tour suppliers

### GET `/tour-suppliers/:id`
**Description:** Get tour supplier details

### POST `/tour-suppliers`
**Request Body:**
```json
{
  "name": "Cappadocia Adventures",
  "contact_person": "Ali Yilmaz",
  "email": "info@cappadociaadv.com",
  "phone": "+90 555 1111111",
  "services_offered": "Hot air balloon, hiking tours",
  "payment_terms": "Payment within 7 days",
  "notes": "Reliable supplier"
}
```

### PUT `/tour-suppliers/:id`
### DELETE `/tour-suppliers/:id`

---

## 5. Guide Management

### GET `/guides`
**Description:** List all guides
**Query Params:** `?language=English&status=available`

### GET `/guides/:id`
**Description:** Get guide details + assignment history

### POST `/guides`
**Request Body:**
```json
{
  "name": "Mehmet Demir",
  "phone": "+90 555 2222222",
  "languages": "English, Turkish, Arabic",
  "daily_rate": 100.00,
  "specialization": "Historical tours",
  "availability_status": "available"
}
```

### PUT `/guides/:id`
### DELETE `/guides/:id`

### GET `/guides/:id/availability`
**Description:** Check guide availability for date range
**Query Params:** `?from=2025-12-10&to=2025-12-15`

---

## 6. Vehicle Management

### GET `/vehicles`
**Description:** List all vehicles
**Query Params:** `?type=Van&status=available`

### GET `/vehicles/:id`
**Description:** Get vehicle details + booking schedule

### POST `/vehicles`
**Request Body:**
```json
{
  "vehicle_number": "34 ABC 123",
  "type": "Mercedes Vito",
  "capacity": 7,
  "daily_rate": 120.00,
  "driver_name": "Ahmet Yildiz",
  "driver_phone": "+90 555 3333333",
  "status": "available"
}
```

### PUT `/vehicles/:id`
### DELETE `/vehicles/:id`

### GET `/vehicles/:id/availability`
**Description:** Check vehicle availability for date range

---

## 7. Booking Management (CORE)

### GET `/bookings`
**Description:** List all bookings
**Query Params:**
- `?status=confirmed`
- `?client_id=5`
- `?from_date=2025-12-01&to_date=2025-12-31`
- `?is_confirmed=true` (for financial reports)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "booking_code": "Funny-1046",
      "client_name": "ABC Travel",
      "pax_count": 2,
      "travel_date_from": "2025-12-10",
      "travel_date_to": "2025-12-15",
      "status": "confirmed",
      "total_sell_price": 2500.00,
      "total_cost_price": 1800.00,
      "gross_profit": 700.00,
      "payment_status": "partial",
      "amount_received": 1250.00
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

### GET `/bookings/:id`
**Description:** Get booking details with all services
**Response:** Complete booking object with:
- Client info
- Passengers list
- All services (hotels, tours, transfers, flights)
- Payment history
- Vouchers

### POST `/bookings`
**Description:** Create new booking
**Request Body:**
```json
{
  "client_id": 5,
  "pax_count": 2,
  "travel_date_from": "2025-12-10",
  "travel_date_to": "2025-12-15",
  "notes": "Honeymoon package"
}
```
**Response:** New booking with auto-generated `booking_code` (Funny-XXXX)

### PUT `/bookings/:id`
**Description:** Update booking details

### DELETE `/bookings/:id`
**Description:** Cancel booking (soft delete, status = 'cancelled')

### PATCH `/bookings/:id/status`
**Description:** Update booking status
**Request Body:**
```json
{
  "status": "confirmed"
}
```
**Note:** When status changes to "confirmed", sets `is_confirmed = true`

---

## 8. Passengers Management

### POST `/bookings/:bookingId/passengers`
**Description:** Add passenger to booking
**Request Body:**
```json
{
  "name": "John Doe",
  "passport_number": "AB1234567",
  "nationality": "USA",
  "date_of_birth": "1990-05-15",
  "special_requests": "Vegetarian meals"
}
```

### PUT `/bookings/:bookingId/passengers/:passengerId`
**Description:** Update passenger

### DELETE `/bookings/:bookingId/passengers/:passengerId`
**Description:** Remove passenger

---

## 9. Booking Services

### POST `/bookings/:bookingId/services/hotel`
**Description:** Add hotel service to booking
**Request Body:**
```json
{
  "hotel_id": 3,
  "check_in": "2025-12-10",
  "check_out": "2025-12-12",
  "room_type": "Deluxe Double",
  "number_of_rooms": 1,
  "cost_per_night": 150.00,
  "sell_price": 400.00,
  "payment_due_date": "2025-12-05",
  "confirmation_number": "H12345",
  "notes": "Sea view room"
}
```
**Note:** `total_cost` and `margin` calculated automatically by database triggers

### POST `/bookings/:bookingId/services/tour`
**Description:** Add tour service to booking
**Request Body (Supplier):**
```json
{
  "tour_name": "Cappadocia Hot Air Balloon",
  "tour_date": "2025-12-11",
  "duration": "Full Day",
  "pax_count": 2,
  "operation_type": "supplier",
  "supplier_id": 5,
  "supplier_cost": 300.00,
  "sell_price": 450.00,
  "payment_due_date": "2025-12-10"
}
```

**Request Body (Self-Operated):**
```json
{
  "tour_name": "Istanbul City Tour",
  "tour_date": "2025-12-10",
  "duration": "Full Day",
  "pax_count": 2,
  "operation_type": "self-operated",
  "guide_id": 2,
  "guide_cost": 100.00,
  "vehicle_id": 3,
  "vehicle_cost": 120.00,
  "entrance_fees": 50.00,
  "other_costs": 30.00,
  "sell_price": 450.00
}
```
**Note:** `total_cost` = guide_cost + vehicle_cost + entrance_fees + other_costs (auto-calculated)

### POST `/bookings/:bookingId/services/transfer`
**Description:** Add transfer service
**Request Body:**
```json
{
  "transfer_type": "Airport Pickup",
  "transfer_date": "2025-12-10",
  "from_location": "Istanbul Airport",
  "to_location": "Hilton Hotel",
  "pax_count": 2,
  "vehicle_type": "Sedan",
  "operation_type": "self-operated",
  "vehicle_id": 1,
  "cost_price": 30.00,
  "sell_price": 50.00
}
```

### POST `/bookings/:bookingId/services/flight`
**Description:** Add flight service
**Request Body:**
```json
{
  "airline": "Turkish Airlines",
  "flight_number": "TK123",
  "departure_date": "2025-12-10T10:00:00",
  "arrival_date": "2025-12-10T14:00:00",
  "from_airport": "JFK",
  "to_airport": "IST",
  "pax_count": 2,
  "cost_price": 800.00,
  "sell_price": 1000.00,
  "pnr": "ABC123"
}
```

### PUT `/bookings/:bookingId/services/:serviceType/:serviceId`
**Description:** Update service (hotel/tour/transfer/flight)

### DELETE `/bookings/:bookingId/services/:serviceType/:serviceId`
**Description:** Remove service from booking

---

## 10. Payment Management

### POST `/bookings/:bookingId/payments/client`
**Description:** Record client payment
**Request Body:**
```json
{
  "payment_date": "2025-12-01",
  "amount": 500.00,
  "currency": "USD",
  "payment_method": "bank_transfer",
  "reference_number": "TXN12345",
  "notes": "First payment"
}
```
**Note:** Triggers auto-update of `amount_received` and `payment_status` in bookings table

### POST `/payments/supplier`
**Description:** Record supplier payment
**Request Body:**
```json
{
  "booking_id": 10,
  "supplier_type": "hotel",
  "supplier_id": 3,
  "supplier_name": "Hilton Istanbul",
  "service_id": 25,
  "amount": 300.00,
  "currency": "USD",
  "payment_date": "2025-12-05",
  "due_date": "2025-12-05",
  "payment_method": "bank_transfer",
  "status": "paid",
  "reference_number": "PAY12345"
}
```

### GET `/payments/receivables`
**Description:** Get outstanding receivables (money to collect)
**Uses:** `view_outstanding_receivables` view

### GET `/payments/payables`
**Description:** Get outstanding payables (money to pay)
**Uses:** `view_outstanding_payables` view

### GET `/bookings/:bookingId/payments`
**Description:** Get all payments for a booking (client + supplier)

---

## 11. Operational Expenses

### GET `/expenses`
**Description:** List operational expenses
**Query Params:** `?category=rent&from_date=2025-12-01&to_date=2025-12-31`

### POST `/expenses`
**Description:** Record operational expense
**Request Body:**
```json
{
  "expense_date": "2025-12-01",
  "category": "rent",
  "description": "Office rent for December",
  "amount": 2000.00,
  "currency": "USD",
  "payment_method": "bank_transfer",
  "is_recurring": true
}
```

### PUT `/expenses/:id`
### DELETE `/expenses/:id`

---

## 12. Financial Reports

### GET `/reports/monthly-pl`
**Description:** Monthly Profit & Loss report
**Query Params:** `?month=2025-12`
**Response:**
```json
{
  "success": true,
  "data": {
    "month": "2025-12",
    "revenue": {
      "total_bookings_revenue": 42000.00,
      "booking_count": 28
    },
    "direct_costs": {
      "hotel_costs": 18000.00,
      "tour_costs": 8000.00,
      "transfer_costs": 3000.00,
      "flight_costs": 2500.00,
      "total": 31500.00
    },
    "gross_profit": 10500.00,
    "operational_expenses": {
      "rent": 2000.00,
      "salaries": 5000.00,
      "utilities": 300.00,
      "marketing": 500.00,
      "other": 200.00,
      "total": 8000.00
    },
    "net_profit": 2500.00
  }
}
```

### GET `/reports/booking-profitability/:bookingId`
**Description:** Per-booking profitability breakdown
**Uses:** Data from booking + all services

### GET `/reports/cash-flow`
**Description:** Cash flow report
**Query Params:** `?from_date=2025-12-01&to_date=2025-12-31`

### GET `/reports/sales-by-client`
**Description:** Sales performance by client

### GET `/reports/sales-by-service`
**Description:** Sales by service type (hotels, tours, transfers, flights)

---

## 13. Voucher Management

### POST `/bookings/:bookingId/vouchers/generate`
**Description:** Generate all vouchers for a booking
**Response:** Array of generated voucher objects

### GET `/vouchers`
**Description:** List all vouchers
**Query Params:** `?booking_id=10`

### GET `/vouchers/:id/pdf`
**Description:** Download voucher PDF

### POST `/vouchers/:id/send`
**Description:** Email voucher to supplier/client
**Request Body:**
```json
{
  "to_email": "hotel@example.com"
}
```

---

## Error Handling

### Standard Error Response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Codes:
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized for this action
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate resource
- `INTERNAL_ERROR` - Server error

---

## Authentication & Authorization

### JWT Token Structure:
```json
{
  "userId": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234597890
}
```

### Role-Based Access:
- **Admin:** Full access to all endpoints
- **Staff:** Read/write bookings, clients, suppliers (no user management, no deletion)
- **Accountant:** Read-only bookings, full access to payments and reports

---

## Database Triggers Integration

The API leverages PostgreSQL triggers for automatic calculations:

1. **Booking Totals:** When services are added/updated/deleted, `calculate_booking_totals()` automatically updates:
   - `total_sell_price`
   - `total_cost_price`
   - `gross_profit`

2. **Payment Status:** When client payments are recorded, `update_payment_status()` automatically updates:
   - `amount_received`
   - `payment_status` (pending/partial/paid)

**Important:** API endpoints don't need to manually calculate these values - database handles it automatically.

---

## Next Steps

1. ✅ Review this API plan
2. ⏳ Set up backend project structure
3. ⏳ Configure database connection
4. ⏳ Implement authentication endpoints
5. ⏳ Implement client management endpoints
6. ⏳ Implement booking management endpoints
7. ⏳ Test with Postman

---

**Last Updated:** 2025-12-06
**Status:** Planning Complete - Ready for Implementation
