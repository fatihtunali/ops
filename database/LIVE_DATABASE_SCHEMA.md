# Live Database Schema - Complete Documentation

**Generated:** 2025-11-07
**Database:** ops
**Total Tables:** 21

---

## Table: audit_log
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('audit_log_id_seq'::regclass) |
| user_id | integer | NULL | |
| action | character varying(50) | NOT NULL | |
| table_name | character varying(100) | NULL | |
| record_id | integer | NULL | |
| old_values | jsonb | NULL | |
| new_values | jsonb | NULL | |
| ip_address | character varying(50) | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: booking_flights
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('booking_flights_id_seq'::regclass) |
| booking_id | integer | NULL | |
| airline | character varying(100) | NULL | |
| flight_number | character varying(50) | NULL | |
| departure_date | timestamp without time zone | NULL | |
| arrival_date | timestamp without time zone | NULL | |
| from_airport | character varying(100) | NULL | |
| to_airport | character varying(100) | NULL | |
| pax_count | integer | NULL | |
| cost_price | numeric | NULL | |
| sell_price | numeric | NULL | |
| margin | numeric | NULL | |
| payment_status | character varying(30) | NULL | 'pending'::character varying |
| paid_amount | numeric | NULL | 0 |
| pnr | character varying(50) | NULL | |
| ticket_numbers | text | NULL | |
| voucher_issued | boolean | NULL | false |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: booking_hotels
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('booking_hotels_id_seq'::regclass) |
| booking_id | integer | NULL | |
| hotel_id | integer | NULL | |
| hotel_name | character varying(255) | NULL | |
| check_in | date | NULL | |
| check_out | date | NULL | |
| nights | integer | NULL | |
| room_type | character varying(100) | NULL | |
| number_of_rooms | integer | NULL | |
| cost_per_night | numeric | NULL | |
| total_cost | numeric | NULL | |
| sell_price | numeric | NULL | |
| margin | numeric | NULL | |
| payment_status | character varying(30) | NULL | 'pending'::character varying |
| paid_amount | numeric | NULL | 0 |
| payment_due_date | date | NULL | |
| confirmation_number | character varying(100) | NULL | |
| voucher_issued | boolean | NULL | false |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: booking_tours
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('booking_tours_id_seq'::regclass) |
| booking_id | integer | NULL | |
| tour_name | character varying(255) | NOT NULL | |
| tour_date | date | NULL | |
| duration | character varying(50) | NULL | |
| pax_count | integer | NULL | |
| operation_type | character varying(20) | NOT NULL | |
| supplier_id | integer | NULL | |
| supplier_cost | numeric | NULL | |
| guide_id | integer | NULL | |
| guide_cost | numeric | NULL | 0 |
| vehicle_id | integer | NULL | |
| vehicle_cost | numeric | NULL | 0 |
| entrance_fees | numeric | NULL | 0 |
| other_costs | numeric | NULL | 0 |
| total_cost | numeric | NULL | |
| sell_price | numeric | NULL | |
| margin | numeric | NULL | |
| payment_status | character varying(30) | NULL | 'pending'::character varying |
| paid_amount | numeric | NULL | 0 |
| payment_due_date | date | NULL | |
| confirmation_number | character varying(100) | NULL | |
| voucher_issued | boolean | NULL | false |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: booking_transfers
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('booking_transfers_id_seq'::regclass) |
| booking_id | integer | NULL | |
| transfer_type | character varying(50) | NULL | |
| transfer_date | date | NULL | |
| from_location | character varying(255) | NULL | |
| to_location | character varying(255) | NULL | |
| pax_count | integer | NULL | |
| vehicle_type | character varying(100) | NULL | |
| operation_type | character varying(20) | NOT NULL | |
| supplier_id | integer | NULL | |
| vehicle_id | integer | NULL | |
| cost_price | numeric | NULL | |
| sell_price | numeric | NULL | |
| margin | numeric | NULL | |
| payment_status | character varying(30) | NULL | 'pending'::character varying |
| paid_amount | numeric | NULL | 0 |
| confirmation_number | character varying(100) | NULL | |
| voucher_issued | boolean | NULL | false |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: bookings
**Row Count:** 6

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('bookings_id_seq'::regclass) |
| booking_code | character varying(50) | NOT NULL | |
| client_id | integer | NULL | |
| pax_count | integer | NULL | |
| travel_date_from | date | NULL | |
| travel_date_to | date | NULL | |
| status | character varying(30) | NOT NULL | 'inquiry'::character varying |
| is_confirmed | boolean | NULL | false |
| total_sell_price | numeric | NULL | 0 |
| total_cost_price | numeric | NULL | 0 |
| gross_profit | numeric | NULL | 0 |
| payment_status | character varying(30) | NULL | 'pending'::character varying |
| amount_received | numeric | NULL | 0 |
| created_at | timestamp without time zone | NULL | now() |
| confirmed_at | timestamp without time zone | NULL | |
| completed_at | timestamp without time zone | NULL | |
| notes | text | NULL | |

---

## Table: client_payments
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('client_payments_id_seq'::regclass) |
| booking_id | integer | NULL | |
| payment_date | date | NOT NULL | |
| amount | numeric | NOT NULL | |
| currency | character varying(10) | NULL | 'USD'::character varying |
| payment_method | character varying(50) | NULL | |
| reference_number | character varying(100) | NULL | |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: clients
**Row Count:** 7

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('clients_id_seq'::regclass) |
| client_code | character varying(50) | NULL | |
| name | character varying(255) | NOT NULL | |
| type | character varying(20) | NOT NULL | |
| email | character varying(255) | NULL | |
| phone | character varying(50) | NULL | |
| address | text | NULL | |
| commission_rate | numeric | NULL | |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |
| status | character varying(20) | NULL | 'active'::character varying |

---

## Table: guides
**Row Count:** 11

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('guides_id_seq'::regclass) |
| name | character varying(255) | NOT NULL | |
| phone | character varying(50) | NULL | |
| languages | character varying(255) | NULL | |
| daily_rate | numeric | NULL | |
| specialization | character varying(255) | NULL | |
| availability_status | character varying(20) | NULL | 'available'::character varying |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: hotels
**Row Count:** 14

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('hotels_id_seq'::regclass) |
| name | character varying(255) | NOT NULL | |
| city | character varying(100) | NULL | |
| country | character varying(100) | NULL | |
| contact_person | character varying(255) | NULL | |
| contact_email | character varying(255) | NULL | |
| contact_phone | character varying(50) | NULL | |
| standard_cost_per_night | numeric | NULL | |
| notes | text | NULL | |
| status | character varying(20) | NULL | 'active'::character varying |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: operational_expenses
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('operational_expenses_id_seq'::regclass) |
| expense_date | date | NOT NULL | |
| category | character varying(100) | NOT NULL | |
| description | character varying(255) | NULL | |
| amount | numeric | NOT NULL | |
| currency | character varying(10) | NULL | 'USD'::character varying |
| payment_method | character varying(50) | NULL | |
| reference_number | character varying(100) | NULL | |
| is_recurring | boolean | NULL | false |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: passengers
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('passengers_id_seq'::regclass) |
| booking_id | integer | NULL | |
| name | character varying(255) | NOT NULL | |
| passport_number | character varying(50) | NULL | |
| nationality | character varying(100) | NULL | |
| date_of_birth | date | NULL | |
| special_requests | text | NULL | |

---

## Table: supplier_payments
**Row Count:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('supplier_payments_id_seq'::regclass) |
| booking_id | integer | NULL | |
| supplier_type | character varying(20) | NOT NULL | |
| supplier_id | integer | NULL | |
| supplier_name | character varying(255) | NULL | |
| service_id | integer | NULL | |
| amount | numeric | NOT NULL | |
| currency | character varying(10) | NULL | 'USD'::character varying |
| payment_date | date | NULL | |
| due_date | date | NULL | |
| payment_method | character varying(50) | NULL | |
| status | character varying(20) | NULL | 'pending'::character varying |
| reference_number | character varying(100) | NULL | |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: tour_suppliers
**Row Count:** 9

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('tour_suppliers_id_seq'::regclass) |
| name | character varying(255) | NOT NULL | |
| contact_person | character varying(255) | NULL | |
| email | character varying(255) | NULL | |
| phone | character varying(50) | NULL | |
| services_offered | text | NULL | |
| payment_terms | text | NULL | |
| notes | text | NULL | |
| status | character varying(20) | NULL | 'active'::character varying |
| created_at | timestamp without time zone | NULL | now() |

---

## Table: users
**Row Count:** 4

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('users_id_seq'::regclass) |
| username | character varying(50) | NOT NULL | |
| email | character varying(255) | NOT NULL | |
| password_hash | character varying(255) | NOT NULL | |
| full_name | character varying(255) | NULL | |
| role | character varying(30) | NULL | 'staff'::character varying |
| is_active | boolean | NULL | true |
| created_at | timestamp without time zone | NULL | now() |
| last_login | timestamp without time zone | NULL | |

---

## Table: vehicles
**Row Count:** 5

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NOT NULL | nextval('vehicles_id_seq'::regclass) |
| **vehicle_number** | character varying(50) | NOT NULL | |
| type | character varying(100) | NULL | |
| capacity | integer | NULL | |
| daily_rate | numeric | NULL | |
| driver_name | character varying(255) | NULL | |
| driver_phone | character varying(50) | NULL | |
| status | character varying(20) | NULL | 'available'::character varying |
| notes | text | NULL | |
| created_at | timestamp without time zone | NULL | now() |

**IMPORTANT:** The vehicle identifier column is `vehicle_number`, NOT `plate_number` or `registration_number`.

---

## Views

### view_booking_services
Aggregates all booking services (hotels, tours, transfers, flights)

| Column | Type |
|--------|------|
| booking_id | integer |
| booking_code | character varying(50) |
| service_type | text |
| service_name | character varying |
| service_date | date |
| sell_price | numeric |
| total_cost | numeric |
| margin | numeric |
| payment_status | character varying(30) |

### view_monthly_revenue
Monthly revenue aggregation

| Column | Type |
|--------|------|
| month | timestamp without time zone |
| booking_count | bigint |
| total_revenue | numeric |
| total_costs | numeric |
| gross_profit | numeric |
| avg_profit_per_booking | numeric |

### view_supplier_outstanding
Outstanding supplier payments

| Column | Type |
|--------|------|
| supplier_type | character varying(20) |
| supplier_id | integer |
| supplier_name | character varying(255) |
| total_outstanding | numeric |
| oldest_due_date | date |

---

## Critical Column Names Reference

### Vehicles Table
- ✅ Correct: `vehicle_number`
- ❌ Wrong: `plate_number`, `registration_number`

### Tour Suppliers Table
- ✅ Correct: `name`
- ❌ Wrong: `company_name`

### Bookings Table
- ✅ Travel dates: `travel_date_from`, `travel_date_to`
- ❌ Wrong: `start_date`, `end_date`

### All Booking Services Tables
- ✅ Foreign key: `booking_id`
- ✅ Payment status: `payment_status`
- ✅ Paid amount: `paid_amount`

---

## Sample Data

### Active Bookings
Total: 6 bookings in system

### Active Clients
Total: 7 clients (mix of agents and direct clients)

### Available Resources
- 11 Guides
- 14 Hotels
- 9 Tour Suppliers
- 5 Vehicles

### Users
- 4 users (admin, staff, accountant roles)
