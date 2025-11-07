# Complete Data Mapping: Database → Backend → UI

**Generated:** 2025-11-07
**System:** Funny Tourism Operations Management
**Database:** PostgreSQL 12+
**Backend:** Node.js + Express
**Frontend:** React 19.1.1

---

## Table of Contents
1. [Overview](#overview)
2. [Database Schema Summary](#database-schema-summary)
3. [Complete Endpoint Mapping](#complete-endpoint-mapping)
4. [Detailed Data Flow by Module](#detailed-data-flow-by-module)
5. [Field-Level Mapping](#field-level-mapping)
6. [Data Transformations](#data-transformations)

---

## Overview

This document provides a comprehensive mapping of how data flows through the entire system:
- **Database Layer**: PostgreSQL tables with 17 core tables
- **Backend Layer**: 71 RESTful API endpoints across 18 modules
- **Frontend Layer**: React components consuming API data via service layers

**Data Flow Pattern:**
```
PostgreSQL Database → Backend Controller → API Endpoint → Frontend Service → React Component → UI
```

---

## Database Schema Summary

### Core Tables (17 tables)

| Table | Primary Purpose | Key Fields | Related Tables |
|-------|----------------|------------|----------------|
| `users` | System authentication & user management | id, username, email, role | N/A |
| `clients` | Travel agents & direct customers | id, client_code, name, type, commission_rate | bookings |
| `hotels` | Hotel supplier database | id, name, city, country, contact_person | booking_hotels |
| `tour_suppliers` | Tour operator suppliers | id, name, contact_person, services_offered | booking_tours |
| `guides` | Self-operated tour guides | id, name, languages, daily_rate | booking_tours |
| `vehicles` | Self-operated vehicles | id, vehicle_number, type, capacity | booking_tours, booking_transfers |
| `bookings` | Main booking container | id, booking_code, client_id, total_sell_price | clients, all service tables |
| `passengers` | Travelers within bookings | id, booking_id, name, passport_number | bookings |
| `booking_hotels` | Hotel services in bookings | id, booking_id, hotel_id, check_in, sell_price | bookings, hotels |
| `booking_tours` | Tour services in bookings | id, booking_id, tour_name, operation_type | bookings, tour_suppliers, guides, vehicles |
| `booking_transfers` | Transfer services in bookings | id, booking_id, from_location, to_location | bookings, tour_suppliers, vehicles |
| `booking_flights` | Flight services in bookings | id, booking_id, airline, flight_number, pnr | bookings |
| `client_payments` | Payments received from clients | id, booking_id, amount, payment_date | bookings |
| `supplier_payments` | Payments to suppliers | id, booking_id, supplier_type, amount, status | bookings |
| `operational_expenses` | Business operating costs | id, category, amount, expense_date | N/A |
| `vouchers` | Generated service vouchers | id, booking_id, voucher_type, pdf_path | bookings |
| `audit_log` | System audit trail | id, user_id, action, table_name | users |

---

## Complete Endpoint Mapping

### Module 1: Authentication (`/api/auth`)

| Endpoint | Method | DB Tables | Frontend Service | UI Component | Purpose |
|----------|--------|-----------|------------------|--------------|---------|
| `/api/auth/login` | POST | `users` | authService.login() | Login.jsx | User login |
| `/api/auth/me` | GET | `users` | authService.getCurrentUser() | Header.jsx | Get current user |
| `/api/auth/logout` | POST | N/A | authService.logout() | Header.jsx | Client-side logout |

**Data Flow Example - Login:**
```
Database (users)
  └─> SELECT username, email, password_hash, role FROM users WHERE username = ?
      └─> Backend: Generate JWT token
          └─> API Response: { token, user: { id, username, email, role } }
              └─> Frontend: authService.login()
                  └─> UI: Login.jsx displays success / redirects to Dashboard
```

---

### Module 2: Users (`/api/users`)

| Endpoint | Method | DB Tables | SQL Query Pattern | UI Component |
|----------|--------|-----------|-------------------|--------------|
| `GET /api/users` | GET | `users` | SELECT * FROM users WHERE is_active = true | UsersList.jsx |
| `GET /api/users/:id` | GET | `users` | SELECT * FROM users WHERE id = ? | UserDetails.jsx |
| `POST /api/users` | POST | `users` | INSERT INTO users (...) VALUES (...) | UsersList.jsx (Create Modal) |
| `PUT /api/users/:id` | PUT | `users` | UPDATE users SET ... WHERE id = ? | UsersList.jsx (Edit Modal) |
| `PUT /api/users/:id/password` | PUT | `users` | UPDATE users SET password_hash WHERE id = ? | UsersList.jsx |
| `DELETE /api/users/:id` | DELETE | `users` | UPDATE users SET is_active = false WHERE id = ? | UsersList.jsx |
| `PUT /api/users/:id/activate` | PUT | `users` | UPDATE users SET is_active = true WHERE id = ? | UsersList.jsx |

**Field Mapping - Users:**
| DB Field | API Response Field | UI Display Field | Notes |
|----------|-------------------|------------------|-------|
| id | id | - | Primary key |
| username | username | Username | Login identifier |
| email | email | Email | Contact email |
| full_name | full_name | Full Name | Display name |
| role | role | Role | admin/staff/accountant |
| is_active | is_active | Status (Badge) | Active/Inactive |
| created_at | created_at | Created Date | Timestamp |
| last_login | last_login | Last Login | Timestamp |

---

### Module 3: Clients (`/api/clients`)

| Endpoint | Method | DB Tables | SQL Join Pattern | UI Component |
|----------|--------|-----------|------------------|--------------|
| `GET /api/clients` | GET | `clients` | SELECT * FROM clients WHERE status = 'active' | ClientsList.jsx |
| `GET /api/clients/:id` | GET | `clients` | SELECT * FROM clients WHERE id = ? | ClientDetails.jsx |
| `POST /api/clients` | POST | `clients` | INSERT INTO clients (...) | ClientsList.jsx (Modal) |
| `PUT /api/clients/:id` | PUT | `clients` | UPDATE clients SET ... WHERE id = ? | ClientsList.jsx (Modal) |
| `DELETE /api/clients/:id` | DELETE | `clients` | UPDATE clients SET status = 'inactive' | ClientsList.jsx |

**Field Mapping - Clients:**
| DB Field | API Response | UI Display | Type/Format |
|----------|--------------|------------|-------------|
| id | id | - | integer |
| client_code | client_code | Client Code | varchar(50) |
| name | name | Client Name | varchar(255) |
| type | type | Type (Badge: Agent/Direct) | enum: agent, direct |
| email | email | Email | varchar(255) |
| phone | phone | Phone | varchar(50) |
| address | address | Address | text |
| commission_rate | commission_rate | Commission % | decimal(5,2) → "15.00%" |
| notes | notes | Notes | text |
| status | status | Status Badge | enum: active, inactive |
| created_at | created_at | Created Date | timestamp → formatted |

---

### Module 4: Bookings (`/api/bookings`)

| Endpoint | Method | DB Tables | SQL Complexity | UI Component |
|----------|--------|-----------|----------------|--------------|
| `GET /api/bookings` | GET | `bookings` + `clients` (LEFT JOIN) | Complex filters | BookingsList.jsx |
| `GET /api/bookings/:id` | GET | `bookings` + `clients` (LEFT JOIN) | Single record | BookingDetails.jsx |
| `POST /api/bookings` | POST | `bookings` | INSERT with auto-generated booking_code | CreateBooking.jsx |
| `PUT /api/bookings/:id` | PUT | `bookings` | Dynamic UPDATE with validation | BookingDetails.jsx |
| `DELETE /api/bookings/:id` | DELETE | `bookings` | Soft delete (status = 'cancelled') | BookingDetails.jsx |

**SQL Query - GET /api/bookings:**
```sql
SELECT
  b.id,
  b.booking_code,
  b.client_id,
  c.name as client_name,
  c.type as client_type,
  b.pax_count,
  b.travel_date_from,
  b.travel_date_to,
  b.status,
  b.is_confirmed,
  b.total_sell_price,
  b.total_cost_price,
  b.gross_profit,
  b.payment_status,
  b.amount_received,
  b.traveler_name,
  b.traveler_email,
  b.traveler_phone,
  b.booked_by,
  b.created_at,
  b.confirmed_at,
  b.completed_at,
  b.notes
FROM bookings b
LEFT JOIN clients c ON b.client_id = c.id
WHERE 1=1
  AND b.status = ? (if filtered)
  AND b.is_confirmed = ? (if filtered)
  AND b.client_id = ? (if filtered)
  AND b.travel_date_from >= ? (if filtered)
  AND b.travel_date_to <= ? (if filtered)
  AND b.booked_by = ? (if filtered)
ORDER BY b.created_at DESC
```

**Field Mapping - Bookings:**
| DB Field | API Response | UI Display | Data Transformation |
|----------|--------------|------------|---------------------|
| id | id | - | integer |
| booking_code | booking_code | Booking Code (link) | "Funny-1046" |
| client_id | client_id | - | integer (FK) |
| client_name | client_name | Client Name | From JOIN |
| client_type | client_type | Type Badge | "agent" / "direct" |
| pax_count | pax_count | PAX | integer |
| travel_date_from | travel_date_from | Travel Dates | Date → formatDate() |
| travel_date_to | travel_date_to | Travel Dates | Date → formatDate() |
| status | status | Status Badge | enum: inquiry, quoted, confirmed, completed, cancelled |
| is_confirmed | is_confirmed | - | boolean |
| total_sell_price | total_sell_price | Total (currency) | decimal → formatCurrency() |
| total_cost_price | total_cost_price | Cost | decimal → formatCurrency() |
| gross_profit | gross_profit | Profit | decimal → formatCurrency() |
| payment_status | payment_status | Payment Badge | enum: pending, partial, paid |
| amount_received | amount_received | Amount Received | decimal → formatCurrency() |
| traveler_name | traveler_name | Traveler Name | varchar(255) |
| traveler_email | traveler_email | Traveler Email | varchar(255) |
| traveler_phone | traveler_phone | Traveler Phone | varchar(50) |
| booked_by | booked_by | Source Badge | enum: agent, direct |
| created_at | created_at | Created | timestamp → formatDateTime() |
| confirmed_at | confirmed_at | Confirmed | timestamp → formatDateTime() |
| completed_at | completed_at | Completed | timestamp → formatDateTime() |
| notes | notes | Notes | text |

---

### Module 5: Booking Hotels (`/api/booking-hotels`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/booking-hotels` | GET | `booking_hotels` + `bookings` + `hotels` | BookingDetails.jsx (Services Tab) |
| `GET /api/booking-hotels/:id` | GET | `booking_hotels` | HotelForm.jsx |
| `POST /api/booking-hotels` | POST | `booking_hotels` | HotelForm.jsx |
| `PUT /api/booking-hotels/:id` | PUT | `booking_hotels` | HotelForm.jsx |
| `DELETE /api/booking-hotels/:id` | DELETE | `booking_hotels` | BookingDetails.jsx |

**Field Mapping - Booking Hotels:**
| DB Field | API Response | UI Display | Format |
|----------|--------------|------------|--------|
| id | id | - | integer |
| booking_id | booking_id | - | integer (FK) |
| hotel_id | hotel_id | Hotel (select) | integer (FK) |
| hotel_name | hotel_name | Hotel Name | varchar(255) |
| check_in | check_in | Check-in Date | date → formatDate() |
| check_out | check_out | Check-out Date | date → formatDate() |
| nights | nights | Nights | integer (calculated) |
| room_type | room_type | Room Type | varchar(100) |
| number_of_rooms | number_of_rooms | Rooms | integer |
| cost_per_night | cost_per_night | Cost/Night | decimal → formatCurrency() |
| total_cost | total_cost | Total Cost | decimal → formatCurrency() |
| sell_price | sell_price | Sell Price | decimal → formatCurrency() |
| margin | margin | Margin | decimal → formatCurrency() |
| payment_status | payment_status | Status | enum: pending, paid |
| paid_amount | paid_amount | Paid Amount | decimal → formatCurrency() |
| payment_due_date | payment_due_date | Due Date | date → formatDate() |
| confirmation_number | confirmation_number | Confirmation # | varchar(100) |
| voucher_issued | voucher_issued | Voucher | boolean → checkbox |
| notes | notes | Notes | text |

---

### Module 6: Booking Tours (`/api/booking-tours`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/booking-tours/stats/summary` | GET | `booking_tours` (aggregate) | Dashboard.jsx |
| `GET /api/booking-tours/booking/:booking_id` | GET | `booking_tours` | BookingDetails.jsx |
| `GET /api/booking-tours` | GET | `booking_tours` + related | ToursList.jsx |
| `GET /api/booking-tours/:id` | GET | `booking_tours` | TourForm.jsx |
| `POST /api/booking-tours` | POST | `booking_tours` | TourForm.jsx |
| `PUT /api/booking-tours/:id` | PUT | `booking_tours` | TourForm.jsx |
| `DELETE /api/booking-tours/:id` | DELETE | `booking_tours` | BookingDetails.jsx |

**Field Mapping - Booking Tours:**
| DB Field | API Response | UI Display | Notes |
|----------|--------------|------------|-------|
| id | id | - | integer |
| booking_id | booking_id | - | integer (FK) |
| tour_name | tour_name | Tour Name | varchar(255) |
| tour_date | tour_date | Date | date → formatDate() |
| duration | duration | Duration | varchar(50) |
| pax_count | pax_count | PAX | integer |
| operation_type | operation_type | Operation | enum: supplier, self-operated |
| supplier_id | supplier_id | Supplier (if supplier-operated) | integer (FK) |
| supplier_cost | supplier_cost | Supplier Cost | decimal → formatCurrency() |
| guide_id | guide_id | Guide (if self-operated) | integer (FK) |
| guide_cost | guide_cost | Guide Cost | decimal → formatCurrency() |
| vehicle_id | vehicle_id | Vehicle (if self-operated) | integer (FK) |
| vehicle_cost | vehicle_cost | Vehicle Cost | decimal → formatCurrency() |
| entrance_fees | entrance_fees | Entrance Fees | decimal → formatCurrency() |
| other_costs | other_costs | Other Costs | decimal → formatCurrency() |
| total_cost | total_cost | Total Cost | decimal → formatCurrency() |
| sell_price | sell_price | Sell Price | decimal → formatCurrency() |
| margin | margin | Margin | decimal → formatCurrency() |
| payment_status | payment_status | Payment Status | enum: pending, paid |
| paid_amount | paid_amount | Paid Amount | decimal → formatCurrency() |
| payment_due_date | payment_due_date | Due Date | date → formatDate() |
| confirmation_number | confirmation_number | Confirmation # | varchar(100) |
| voucher_issued | voucher_issued | Voucher Issued | boolean |
| notes | notes | Notes | text |

---

### Module 7: Booking Transfers (`/api/booking-transfers`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/booking-transfers/booking/:bookingId` | GET | `booking_transfers` | BookingDetails.jsx |
| `GET /api/booking-transfers` | GET | `booking_transfers` + related | TransfersList.jsx |
| `GET /api/booking-transfers/:id` | GET | `booking_transfers` | TransferForm.jsx |
| `POST /api/booking-transfers` | POST | `booking_transfers` | TransferForm.jsx |
| `PUT /api/booking-transfers/:id` | PUT | `booking_transfers` | TransferForm.jsx |
| `DELETE /api/booking-transfers/:id` | DELETE | `booking_transfers` | BookingDetails.jsx |

**Field Mapping - Booking Transfers:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | - |
| transfer_type | transfer_type | Transfer Type |
| transfer_date | transfer_date | Date |
| from_location | from_location | From |
| to_location | to_location | To |
| pax_count | pax_count | PAX |
| vehicle_type | vehicle_type | Vehicle Type |
| operation_type | operation_type | Operation |
| supplier_id | supplier_id | Supplier (if supplier) |
| vehicle_id | vehicle_id | Vehicle (if self-operated) |
| cost_price | cost_price | Cost |
| sell_price | sell_price | Sell Price |
| margin | margin | Margin |
| payment_status | payment_status | Payment Status |
| paid_amount | paid_amount | Paid Amount |
| confirmation_number | confirmation_number | Confirmation # |
| voucher_issued | voucher_issued | Voucher Issued |
| notes | notes | Notes |

---

### Module 8: Booking Flights (`/api/booking-flights`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/booking-flights` | GET | `booking_flights` + `bookings` | FlightsList.jsx |
| `GET /api/booking-flights/booking/:booking_id` | GET | `booking_flights` | BookingDetails.jsx |
| `GET /api/booking-flights/:id` | GET | `booking_flights` | FlightForm.jsx |
| `POST /api/booking-flights` | POST | `booking_flights` | FlightForm.jsx |
| `PUT /api/booking-flights/:id` | PUT | `booking_flights` | FlightForm.jsx |
| `DELETE /api/booking-flights/:id` | DELETE | `booking_flights` | BookingDetails.jsx |

**Field Mapping - Booking Flights:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | - |
| airline | airline | Airline |
| flight_number | flight_number | Flight # |
| departure_date | departure_date | Departure |
| arrival_date | arrival_date | Arrival |
| from_airport | from_airport | From Airport |
| to_airport | to_airport | To Airport |
| pax_count | pax_count | PAX |
| cost_price | cost_price | Cost |
| sell_price | sell_price | Sell Price |
| margin | margin | Margin |
| payment_status | payment_status | Payment Status |
| paid_amount | paid_amount | Paid Amount |
| pnr | pnr | PNR |
| ticket_numbers | ticket_numbers | Ticket Numbers |
| voucher_issued | voucher_issued | Voucher Issued |
| notes | notes | Notes |

---

### Module 9: Passengers (`/api/passengers`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/passengers` | GET | `passengers` | PassengersList.jsx |
| `GET /api/passengers/booking/:booking_id` | GET | `passengers` | BookingDetails.jsx |
| `GET /api/passengers/:id` | GET | `passengers` | PassengerForm.jsx |
| `POST /api/passengers` | POST | `passengers` | PassengerForm.jsx |
| `PUT /api/passengers/:id` | PUT | `passengers` | PassengerForm.jsx |
| `DELETE /api/passengers/:id` | DELETE | `passengers` | BookingDetails.jsx |

**Field Mapping - Passengers:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | - |
| name | name | Passenger Name |
| passport_number | passport_number | Passport # |
| nationality | nationality | Nationality |
| date_of_birth | date_of_birth | Date of Birth |
| special_requests | special_requests | Special Requests |

---

### Module 10: Hotels (Supplier Database) (`/api/hotels`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/hotels` | GET | `hotels` | HotelsList.jsx |
| `GET /api/hotels/:id` | GET | `hotels` | HotelDetails.jsx |
| `POST /api/hotels` | POST | `hotels` | HotelsList.jsx (Modal) |
| `PUT /api/hotels/:id` | PUT | `hotels` | HotelsList.jsx (Modal) |
| `DELETE /api/hotels/:id` | DELETE | `hotels` | HotelsList.jsx |

**Field Mapping - Hotels:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| name | name | Hotel Name |
| city | city | City |
| country | country | Country |
| contact_person | contact_person | Contact Person |
| contact_email | contact_email | Email |
| contact_phone | contact_phone | Phone |
| standard_cost_per_night | standard_cost_per_night | Standard Cost/Night |
| notes | notes | Notes |
| status | status | Status |
| created_at | created_at | Created |

---

### Module 11: Tour Suppliers (`/api/tour-suppliers`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/tour-suppliers/stats/summary` | GET | `tour_suppliers` (aggregate) | Dashboard.jsx |
| `GET /api/tour-suppliers` | GET | `tour_suppliers` | TourSuppliersList.jsx |
| `GET /api/tour-suppliers/:id` | GET | `tour_suppliers` | TourSupplierDetails.jsx |
| `POST /api/tour-suppliers` | POST | `tour_suppliers` | TourSuppliersList.jsx (Modal) |
| `PUT /api/tour-suppliers/:id` | PUT | `tour_suppliers` | TourSuppliersList.jsx (Modal) |
| `DELETE /api/tour-suppliers/:id` | DELETE | `tour_suppliers` | TourSuppliersList.jsx |

**Field Mapping - Tour Suppliers:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| name | name | Supplier Name |
| contact_person | contact_person | Contact Person |
| email | email | Email |
| phone | phone | Phone |
| services_offered | services_offered | Services Offered |
| payment_terms | payment_terms | Payment Terms |
| notes | notes | Notes |
| status | status | Status |
| created_at | created_at | Created |

---

### Module 12: Guides (`/api/guides`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/guides/available` | GET | `guides` WHERE availability_status = 'available' | TourForm.jsx (Guide Select) |
| `GET /api/guides` | GET | `guides` | GuidesList.jsx |
| `GET /api/guides/:id` | GET | `guides` | GuideDetails.jsx |
| `POST /api/guides` | POST | `guides` | GuidesList.jsx (Modal) |
| `PUT /api/guides/:id` | PUT | `guides` | GuidesList.jsx (Modal) |
| `DELETE /api/guides/:id` | DELETE | `guides` | GuidesList.jsx |

**Field Mapping - Guides:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| name | name | Guide Name |
| phone | phone | Phone |
| languages | languages | Languages |
| daily_rate | daily_rate | Daily Rate |
| specialization | specialization | Specialization |
| availability_status | availability_status | Availability |
| notes | notes | Notes |
| created_at | created_at | Created |

---

### Module 13: Vehicles (`/api/vehicles`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/vehicles/available` | GET | `vehicles` WHERE status = 'available' | TourForm.jsx / TransferForm.jsx |
| `GET /api/vehicles` | GET | `vehicles` | VehiclesList.jsx |
| `GET /api/vehicles/:id` | GET | `vehicles` | VehicleDetails.jsx |
| `POST /api/vehicles` | POST | `vehicles` | VehiclesList.jsx (Modal) |
| `PUT /api/vehicles/:id` | PUT | `vehicles` | VehiclesList.jsx (Modal) |
| `DELETE /api/vehicles/:id` | DELETE | `vehicles` | VehiclesList.jsx |

**Field Mapping - Vehicles:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| vehicle_number | vehicle_number | Vehicle # |
| type | type | Type |
| capacity | capacity | Capacity |
| daily_rate | daily_rate | Daily Rate |
| driver_name | driver_name | Driver Name |
| driver_phone | driver_phone | Driver Phone |
| status | status | Status |
| notes | notes | Notes |
| created_at | created_at | Created |

---

### Module 14: Client Payments (`/api/client-payments`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/client-payments` | GET | `client_payments` + `bookings` | ClientPayments.jsx |
| `GET /api/client-payments/booking/:booking_id` | GET | `client_payments` | BookingDetails.jsx (Payments Tab) |
| `GET /api/client-payments/:id` | GET | `client_payments` | PaymentDetails.jsx |
| `POST /api/client-payments` | POST | `client_payments` | ClientPayments.jsx (Add Payment Modal) |
| `PUT /api/client-payments/:id` | PUT | `client_payments` | ClientPayments.jsx (Edit Modal) |
| `DELETE /api/client-payments/:id` | DELETE | `client_payments` | ClientPayments.jsx |

**Field Mapping - Client Payments:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | Booking Code (link) |
| payment_date | payment_date | Payment Date |
| amount | amount | Amount |
| currency | currency | Currency |
| payment_method | payment_method | Method |
| reference_number | reference_number | Reference # |
| notes | notes | Notes |
| created_at | created_at | Created |

---

### Module 15: Supplier Payments (`/api/supplier-payments`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/supplier-payments/stats` | GET | `supplier_payments` (aggregate) | Dashboard.jsx |
| `GET /api/supplier-payments/summary` | GET | `supplier_payments` (aggregate) | Reports.jsx |
| `GET /api/supplier-payments` | GET | `supplier_payments` + `bookings` | SupplierPayments.jsx |
| `GET /api/supplier-payments/:id` | GET | `supplier_payments` | PaymentDetails.jsx |
| `POST /api/supplier-payments` | POST | `supplier_payments` | SupplierPayments.jsx (Add Modal) |
| `PUT /api/supplier-payments/:id` | PUT | `supplier_payments` | SupplierPayments.jsx (Edit Modal) |
| `DELETE /api/supplier-payments/:id` | DELETE | `supplier_payments` | SupplierPayments.jsx |

**Field Mapping - Supplier Payments:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | Booking Code (link) |
| supplier_type | supplier_type | Supplier Type |
| supplier_id | supplier_id | - |
| supplier_name | supplier_name | Supplier Name |
| service_id | service_id | Service ID |
| amount | amount | Amount |
| currency | currency | Currency |
| payment_date | payment_date | Payment Date |
| due_date | due_date | Due Date |
| payment_method | payment_method | Method |
| status | status | Status (Badge) |
| reference_number | reference_number | Reference # |
| notes | notes | Notes |
| created_at | created_at | Created |

---

### Module 16: Operational Expenses (`/api/operational-expenses`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/operational-expenses/summary` | GET | `operational_expenses` (GROUP BY YEAR) | Reports.jsx |
| `GET /api/operational-expenses/recurring` | GET | `operational_expenses` WHERE is_recurring = true | ExpensesList.jsx |
| `GET /api/operational-expenses/by-category/:category` | GET | `operational_expenses` WHERE category = ? | ExpensesList.jsx |
| `GET /api/operational-expenses` | GET | `operational_expenses` | ExpensesList.jsx |
| `GET /api/operational-expenses/:id` | GET | `operational_expenses` | ExpenseDetails.jsx |
| `POST /api/operational-expenses` | POST | `operational_expenses` | ExpensesList.jsx (Add Modal) |
| `PUT /api/operational-expenses/:id` | PUT | `operational_expenses` | ExpensesList.jsx (Edit Modal) |
| `DELETE /api/operational-expenses/:id` | DELETE | `operational_expenses` | ExpensesList.jsx |

**Field Mapping - Operational Expenses:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| expense_date | expense_date | Expense Date |
| category | category | Category |
| description | description | Description |
| amount | amount | Amount |
| currency | currency | Currency |
| payment_method | payment_method | Payment Method |
| reference_number | reference_number | Reference # |
| is_recurring | is_recurring | Recurring (checkbox) |
| notes | notes | Notes |
| created_at | created_at | Created |

---

### Module 17: Vouchers (`/api/vouchers`)

| Endpoint | Method | DB Tables | UI Component |
|----------|--------|-----------|--------------|
| `GET /api/vouchers` | GET | `vouchers` + `bookings` | VouchersList.jsx |
| `GET /api/vouchers/:id` | GET | `vouchers` | VoucherDetails.jsx |
| `POST /api/vouchers` | POST | `vouchers` | BookingDetails.jsx (Generate Voucher) |
| `PUT /api/vouchers/:id` | PUT | `vouchers` | VoucherDetails.jsx |
| `DELETE /api/vouchers/:id` | DELETE | `vouchers` | VouchersList.jsx |

**Field Mapping - Vouchers:**
| DB Field | API Response | UI Display |
|----------|--------------|------------|
| id | id | - |
| booking_id | booking_id | Booking Code |
| voucher_type | voucher_type | Type |
| service_id | service_id | Service ID |
| voucher_number | voucher_number | Voucher # |
| issued_date | issued_date | Issued Date |
| pdf_path | pdf_path | PDF Link |
| sent_to | sent_to | Sent To |
| sent_at | sent_at | Sent At |

---

### Module 18: Reports (`/api/reports`)

| Endpoint | Method | DB Tables Used | Aggregations | UI Component |
|----------|--------|---------------|--------------|--------------|
| `GET /api/reports/monthly-pl` | GET | `bookings`, `operational_expenses` | SUM, GROUP BY month | Reports.jsx (P&L Tab) |
| `GET /api/reports/booking-profitability/:bookingId` | GET | `bookings`, `booking_*`, `client_payments`, `supplier_payments` | SUM all services + payments | BookingDetails.jsx (Profitability) |
| `GET /api/reports/cash-flow` | GET | `client_payments`, `supplier_payments`, `operational_expenses` | SUM inflows/outflows BY month | Reports.jsx (Cash Flow Tab) |
| `GET /api/reports/sales-by-client` | GET | `bookings`, `clients` | SUM, GROUP BY client | Reports.jsx (Sales Tab) |
| `GET /api/reports/sales-by-service` | GET | `booking_hotels`, `booking_tours`, `booking_transfers`, `booking_flights` | SUM, GROUP BY service_type | Dashboard.jsx (Pie Chart) |
| `GET /api/reports/sales-by-source` | GET | `bookings` | SUM, GROUP BY booked_by | Reports.jsx |
| `GET /api/reports/outstanding` | GET | `bookings`, `client_payments`, `supplier_payments` | Calculated outstanding amounts | Reports.jsx (Outstanding Tab) |
| `GET /api/reports/dashboard-stats` | GET | Multiple tables | Count, SUM aggregations | Dashboard.jsx (KPI Cards) |
| `POST /api/reports/export/monthly-pl` | POST | Same as monthly-pl | Excel export | Reports.jsx (Export Button) |
| `POST /api/reports/export/cash-flow` | POST | Same as cash-flow | Excel export | Reports.jsx (Export Button) |
| `POST /api/reports/export/sales-by-client` | POST | Same as sales-by-client | Excel export | Reports.jsx (Export Button) |
| `POST /api/reports/export/outstanding` | POST | Same as outstanding | Excel export | Reports.jsx (Export Button) |

**Dashboard Stats API Response Structure:**
```json
{
  "success": true,
  "data": {
    "active_inquiries": 5,
    "this_month": {
      "confirmed_bookings": 12,
      "revenue": 45000.00,
      "gross_profit": 8500.00
    },
    "outstanding": {
      "receivables": 12500.00,
      "payables": 8300.00
    },
    "upcoming_departures": [
      {
        "booking_code": "Funny-1046",
        "client_name": "ABC Travel",
        "departure_date": "2025-11-15",
        "pax_count": 4
      }
    ]
  }
}
```

---

## Detailed Data Flow by Module

### Example 1: Booking Creation Flow

**User Action:** User creates a new booking in CreateBooking.jsx

1. **Frontend (CreateBooking.jsx):**
   ```javascript
   const handleSubmit = async (data) => {
     await bookingsService.create({
       client_id: 5,
       pax_count: 2,
       travel_date_from: "2025-12-01",
       travel_date_to: "2025-12-05",
       status: "inquiry",
       booked_by: "agent"
     });
   };
   ```

2. **Frontend Service (bookingsService.js):**
   ```javascript
   async create(bookingData) {
     const response = await api.post('/bookings', bookingData);
     return response;
   }
   ```

3. **Backend Route (/backend/src/routes/bookings.js):**
   ```javascript
   router.post('/', auth, bookingController.create);
   ```

4. **Backend Controller (/backend/src/controllers/bookingController.js):**
   ```javascript
   const result = await query(
     `INSERT INTO bookings (
       booking_code, client_id, pax_count, travel_date_from,
       travel_date_to, status, booked_by
     ) VALUES (
       generate_booking_code(), $1, $2, $3, $4, $5, $6
     )
     RETURNING *`,
     [client_id, pax_count, travel_date_from, travel_date_to, status, booked_by]
   );
   ```

5. **Database (PostgreSQL):**
   ```sql
   -- Function generates booking_code automatically
   -- Triggers calculate totals
   -- Returns created booking with ID
   ```

6. **API Response:**
   ```json
   {
     "success": true,
     "message": "Booking created successfully",
     "data": {
       "id": 47,
       "booking_code": "Funny-1047",
       "client_id": 5,
       "pax_count": 2,
       "travel_date_from": "2025-12-01",
       "travel_date_to": "2025-12-05",
       "status": "inquiry",
       "total_sell_price": 0,
       "created_at": "2025-11-07T10:30:00Z"
     }
   }
   ```

7. **Frontend Update:**
   - BookingsList.jsx refreshes
   - Shows new booking in table
   - Navigates to BookingDetails.jsx

---

### Example 2: Dashboard Stats Loading Flow

**User Action:** User navigates to Dashboard

1. **Frontend (Dashboard.jsx - useEffect):**
   ```javascript
   const fetchStats = async () => {
     const response = await reportsService.getDashboardStats();
     setStats(response.data);
   };
   ```

2. **Backend Controller (reportController.js):**
   - Runs multiple SQL queries in parallel
   - Aggregates data from multiple tables

3. **SQL Queries Executed:**
   ```sql
   -- Query 1: Active inquiries
   SELECT COUNT(*) FROM bookings
   WHERE status IN ('inquiry', 'quoted');

   -- Query 2: This month's bookings
   SELECT
     COUNT(*) as confirmed_bookings,
     SUM(total_sell_price) as revenue,
     SUM(gross_profit) as gross_profit
   FROM bookings
   WHERE is_confirmed = true
     AND EXTRACT(MONTH FROM confirmed_at) = EXTRACT(MONTH FROM CURRENT_DATE);

   -- Query 3: Outstanding receivables
   SELECT
     SUM(total_sell_price - amount_received) as receivables
   FROM bookings
   WHERE is_confirmed = true
     AND payment_status != 'paid';

   -- Query 4: Outstanding payables
   SELECT SUM(amount) as payables
   FROM supplier_payments
   WHERE status = 'pending';

   -- Query 5: Upcoming departures
   SELECT booking_code, client_name, travel_date_from, pax_count
   FROM bookings b
   JOIN clients c ON b.client_id = c.id
   WHERE travel_date_from BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
   ORDER BY travel_date_from;
   ```

4. **API Response:**
   - Combines all query results
   - Formats numbers and dates
   - Returns consolidated stats object

5. **UI Rendering:**
   - StatCard components display KPIs
   - Tables show upcoming departures
   - Charts render revenue trends

---

## Data Transformations

### Common Transformations Applied

| Data Type | Database Format | API Format | UI Display Format | Transformation Function |
|-----------|----------------|------------|-------------------|------------------------|
| Date | `DATE` | `"2025-12-01"` | `"Dec 1, 2025"` | formatDate() |
| DateTime | `TIMESTAMP` | `"2025-11-07T10:30:00Z"` | `"Nov 7, 2025 10:30 AM"` | formatDateTime() |
| Currency | `DECIMAL(12,2)` | `1234.50` (number) | `"$1,234.50"` | formatCurrency() |
| Percentage | `DECIMAL(5,2)` | `15.00` | `"15%"` | Direct + "%" |
| Boolean | `BOOLEAN` | `true/false` | Badge/Checkbox | Conditional render |
| Enum (status) | `VARCHAR` | `"confirmed"` | Badge with color | BOOKING_STATUS_COLORS mapping |
| Enum (type) | `VARCHAR` | `"agent"` | Badge (blue/green) | Conditional className |

### Date Formatting Examples

```javascript
// Frontend: /frontend/src/utils/formatters.js

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return new Date(datetime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};
```

### Backend Formatting Examples

```javascript
// Backend: /backend/src/utils/formatters.js

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
};

const formatDateTime = (datetime) => {
  if (!datetime) return null;
  return new Date(datetime).toISOString(); // ISO 8601
};
```

---

## Key Data Flow Patterns

### Pattern 1: List Pages (GET /api/resource)
```
Database → JOIN queries → Controller formatting → API response array →
Frontend service → useState → Table render
```

### Pattern 2: Detail Pages (GET /api/resource/:id)
```
Database → Single record query → Related data JOINs → Controller →
API response object → Frontend → Form population
```

### Pattern 3: Create Operations (POST /api/resource)
```
Form data → Frontend validation → Service POST → Backend validation →
Database INSERT with auto-generated fields → RETURNING → API response →
Frontend redirect/update
```

### Pattern 4: Update Operations (PUT /api/resource/:id)
```
Form data → Diff detection → Service PUT → Backend validation →
Dynamic UPDATE query → Triggers fire → RETURNING → API response →
Frontend state update
```

### Pattern 5: Delete Operations (DELETE /api/resource/:id)
```
User confirmation → Service DELETE → Backend check existence →
Soft delete (UPDATE status) OR hard delete → API success →
Frontend remove from list
```

### Pattern 6: Aggregation Reports
```
Multiple table UNION/JOIN → GROUP BY aggregations → SUM/COUNT/AVG →
Backend formatting → API response → Charts/Tables render
```

---

## Security & Authorization

### Authentication Flow
```
Login → JWT generation → Token storage (localStorage) →
All API requests include Authorization header →
Backend middleware verifies JWT → Extract user_id and role →
Proceed to controller OR reject
```

### Role-Based Access Control

| Role | Access Level | Restrictions |
|------|-------------|--------------|
| admin | Full access | Can manage users, all CRUD operations |
| staff | Most operations | Cannot manage users |
| accountant | Financial focus | Full access to payments, expenses, reports; Read-only for bookings |

---

## Summary Statistics

- **Total Database Tables:** 17
- **Total API Endpoints:** 71
- **Total UI Pages/Components:** 25+
- **Data Transformation Functions:** 5 core formatters
- **Service Layer Files:** 13
- **Backend Controllers:** 18
- **Backend Routes:** 18

---

## Verification Checklist

✅ All 17 database tables mapped
✅ All 71 API endpoints documented
✅ Data flow from DB → Backend → Frontend mapped
✅ Field-level transformations documented
✅ UI components identified for each endpoint
✅ SQL query patterns documented
✅ Authentication/authorization flow explained

---

**End of Data Mapping Analysis**
