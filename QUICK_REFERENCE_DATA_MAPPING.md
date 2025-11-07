# Quick Reference: Data Mapping Guide

**Last Updated:** 2025-11-07
**Status:** ✅ All mappings verified

---

## 🎯 How to Use This Guide

This is your quick lookup reference for understanding how data flows through the system. When entering data, refer to this guide to ensure correct field names and formats.

---

## 📋 Core Entities Overview

| Entity | DB Table | API Endpoint Base | UI Page |
|--------|----------|------------------|---------|
| Bookings | `bookings` | `/api/bookings` | `/bookings` |
| Clients | `clients` | `/api/clients` | `/clients` |
| Hotels (Suppliers) | `hotels` | `/api/hotels` | `/hotels` |
| Hotel Services | `booking_hotels` | `/api/booking-hotels` | `/bookings/:id` (Services Tab) |
| Tours | `booking_tours` | `/api/booking-tours` | `/bookings/:id` (Services Tab) |
| Transfers | `booking_transfers` | `/api/booking-transfers` | `/bookings/:id` (Services Tab) |
| Flights | `booking_flights` | `/api/booking-flights` | `/bookings/:id` (Services Tab) |
| Passengers | `passengers` | `/api/passengers` | `/bookings/:id` (Passengers Tab) |
| Client Payments | `client_payments` | `/api/client-payments` | `/payments/client` |
| Supplier Payments | `supplier_payments` | `/api/supplier-payments` | `/payments/supplier` |
| Guides | `guides` | `/api/guides` | `/resources/guides` |
| Vehicles | `vehicles` | `/api/vehicles` | `/resources/vehicles` |
| Tour Suppliers | `tour_suppliers` | `/api/tour-suppliers` | `/resources/suppliers` |

---

## 🔢 Booking Fields Reference

### When Creating/Editing a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| client_id | Integer | Optional | Must be valid client ID | 5 |
| pax_count | Integer | Optional | 0 or positive | 4 |
| travel_date_from | Date | Optional | YYYY-MM-DD | "2025-12-01" |
| travel_date_to | Date | Optional | YYYY-MM-DD | "2025-12-05" |
| status | String | Optional | inquiry, quoted, confirmed, completed, cancelled | "inquiry" |
| is_confirmed | Boolean | Optional | true or false | false |
| booked_by | String | Optional | agent or direct | "agent" |
| traveler_name | String | Optional | Free text | "John Doe" |
| traveler_email | String | Optional | Email format | "john@example.com" |
| traveler_phone | String | Optional | Free text | "+1 555-1234" |
| notes | String | Optional | Free text | "VIP guest" |

**Auto-Generated Fields:**
- `booking_code` - Generated as "Funny-####" (e.g., "Funny-1046")
- `total_sell_price` - Auto-calculated from services
- `total_cost_price` - Auto-calculated from services
- `gross_profit` - Auto-calculated (sell - cost)
- `payment_status` - Auto-updated based on payments

---

## 🏨 Hotel Service Fields Reference

### When Adding a Hotel to a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| hotel_id | Integer | Optional | Valid hotel ID | 3 |
| hotel_name | String | Optional | Free text | "Grand Hotel Istanbul" |
| check_in | Date | Optional | YYYY-MM-DD | "2025-12-01" |
| check_out | Date | Optional | YYYY-MM-DD | "2025-12-05" |
| nights | Integer | Optional | Positive number | 4 |
| room_type | String | Optional | Free text | "Deluxe Double" |
| number_of_rooms | Integer | Optional | Positive number | 2 |
| cost_per_night | Decimal | Optional | Positive number | 100.00 |
| total_cost | Decimal | Optional | Positive number | 800.00 |
| sell_price | Decimal | Optional | Positive number | 1000.00 |
| payment_status | String | Optional | pending or paid | "pending" |
| paid_amount | Decimal | Optional | 0 or positive | 0 |
| payment_due_date | Date | Optional | YYYY-MM-DD | "2025-11-30" |
| confirmation_number | String | Optional | Free text | "HTL123456" |
| voucher_issued | Boolean | Optional | true or false | false |
| notes | String | Optional | Free text | "Early check-in requested" |

**Auto-Calculated Field:**
- `margin` - Automatically calculated as (sell_price - total_cost)

---

## 🚐 Tour Service Fields Reference

### When Adding a Tour to a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| tour_name | String | **YES** | Free text | "Cappadocia Hot Air Balloon" |
| tour_date | Date | Optional | YYYY-MM-DD | "2025-12-02" |
| duration | String | Optional | Free text | "Full Day" |
| pax_count | Integer | Optional | Positive number | 4 |
| operation_type | String | **YES** | supplier or self-operated | "supplier" |
| **If operation_type = "supplier":** ||||
| supplier_id | Integer | Optional | Valid supplier ID | 8 |
| supplier_cost | Decimal | Optional | Positive number | 400.00 |
| **If operation_type = "self-operated":** ||||
| guide_id | Integer | Optional | Valid guide ID | 2 |
| guide_cost | Decimal | Optional | Positive number | 150.00 |
| vehicle_id | Integer | Optional | Valid vehicle ID | 5 |
| vehicle_cost | Decimal | Optional | Positive number | 200.00 |
| entrance_fees | Decimal | Optional | Positive number | 50.00 |
| other_costs | Decimal | Optional | Positive number | 0 |
| **Common fields:** ||||
| sell_price | Decimal | Optional | Positive number | 600.00 |
| payment_status | String | Optional | pending or paid | "pending" |
| payment_due_date | Date | Optional | YYYY-MM-DD | "2025-11-30" |
| notes | String | Optional | Free text | "Sunrise tour" |

**Auto-Calculated Fields:**
- `total_cost` - If supplier: = supplier_cost; If self-operated: = guide_cost + vehicle_cost + entrance_fees + other_costs
- `margin` - = sell_price - total_cost

---

## 🚗 Transfer Service Fields Reference

### When Adding a Transfer to a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| transfer_type | String | Optional | Free text | "Airport Pickup" |
| transfer_date | Date | Optional | YYYY-MM-DD | "2025-12-01" |
| from_location | String | Optional | Free text | "Istanbul Airport" |
| to_location | String | Optional | Free text | "Hotel Grand" |
| pax_count | Integer | Optional | Positive number | 4 |
| vehicle_type | String | Optional | Free text | "Van" |
| operation_type | String | **YES** | supplier or self-operated | "self-operated" |
| supplier_id | Integer | Optional | Valid supplier ID (if supplier) | 5 |
| vehicle_id | Integer | Optional | Valid vehicle ID (if self-operated) | 3 |
| cost_price | Decimal | Optional | Positive number | 50.00 |
| sell_price | Decimal | Optional | Positive number | 80.00 |
| payment_status | String | Optional | pending or paid | "pending" |
| notes | String | Optional | Free text | "Meet at terminal 1" |

**Auto-Calculated Field:**
- `margin` - = sell_price - cost_price

---

## ✈️ Flight Service Fields Reference

### When Adding a Flight to a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| airline | String | Optional | Free text | "Turkish Airlines" |
| flight_number | String | Optional | Free text | "TK1234" |
| departure_date | DateTime | Optional | YYYY-MM-DD HH:MM:SS | "2025-12-01 10:30:00" |
| arrival_date | DateTime | Optional | YYYY-MM-DD HH:MM:SS | "2025-12-01 14:45:00" |
| from_airport | String | Optional | Free text | "IST" |
| to_airport | String | Optional | Free text | "AYT" |
| pax_count | Integer | Optional | Positive number | 4 |
| cost_price | Decimal | Optional | Positive number | 800.00 |
| sell_price | Decimal | Optional | Positive number | 1000.00 |
| payment_status | String | Optional | pending or paid | "pending" |
| pnr | String | Optional | Free text | "ABC123" |
| ticket_numbers | String | Optional | Free text | "1234567890, 0987654321" |
| notes | String | Optional | Free text | "Extra baggage requested" |

**Auto-Calculated Field:**
- `margin` - = sell_price - cost_price

---

## 👥 Passenger Fields Reference

### When Adding a Passenger to a Booking

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| name | String | **YES** | Free text | "John Smith" |
| passport_number | String | Optional | Free text | "A12345678" |
| nationality | String | Optional | Free text | "United States" |
| date_of_birth | Date | Optional | YYYY-MM-DD | "1985-05-15" |
| special_requests | String | Optional | Free text | "Vegetarian meal" |

---

## 💳 Client Payment Fields Reference

### When Recording a Payment from Client

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | **YES** | Valid booking ID | 47 |
| payment_date | Date | **YES** | YYYY-MM-DD | "2025-11-07" |
| amount | Decimal | **YES** | Positive number > 0 | 500.00 |
| currency | String | Optional | Currency code | "USD" |
| payment_method | String | Optional | Free text | "bank_transfer" |
| reference_number | String | Optional | Free text | "TRX123456" |
| notes | String | Optional | Free text | "First payment" |

**Auto-Updates After Payment:**
- Booking's `amount_received` is updated (sum of all payments)
- Booking's `payment_status` is auto-updated:
  - "pending" if amount_received = 0
  - "partial" if 0 < amount_received < total_sell_price
  - "paid" if amount_received >= total_sell_price

---

## 💰 Supplier Payment Fields Reference

### When Recording a Payment to Supplier

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| booking_id | Integer | Optional | Valid booking ID | 47 |
| supplier_type | String | **YES** | hotel, tour, transfer, flight, guide, vehicle, other | "hotel" |
| supplier_id | Integer | Optional | Valid supplier ID | 3 |
| supplier_name | String | Optional | Free text | "Grand Hotel" |
| service_id | Integer | Optional | Service record ID | 25 |
| amount | Decimal | **YES** | Positive number > 0 | 800.00 |
| currency | String | Optional | Currency code | "USD" |
| payment_date | Date | Optional | YYYY-MM-DD | "2025-11-07" |
| due_date | Date | Optional | YYYY-MM-DD | "2025-11-30" |
| payment_method | String | Optional | Free text | "bank_transfer" |
| status | String | Optional | pending or paid | "pending" |
| reference_number | String | Optional | Free text | "PAY123" |
| notes | String | Optional | Free text | "Deposit payment" |

---

## 🏢 Client Fields Reference

### When Creating/Editing a Client

| Field Name | Data Type | Required | Format/Values | Example |
|------------|-----------|----------|---------------|---------|
| client_code | String | Optional | Unique code | "AGT001" |
| name | String | **YES** | Free text | "ABC Travel Agency" |
| type | String | **YES** | agent or direct | "agent" |
| email | String | Optional | Email format | "info@abctravel.com" |
| phone | String | Optional | Free text | "+1 555-1234" |
| address | String | Optional | Free text | "123 Main St" |
| commission_rate | Decimal | Optional | 0-100 | 15.00 |
| notes | String | Optional | Free text | "Preferred partner" |
| status | String | Optional | active or inactive | "active" |

---

## 📊 Important Data Rules

### 1. Auto-Generated Fields (DO NOT SEND)
- `booking_code` - Backend generates (e.g., "Funny-1046")
- `id` - Database auto-increment
- `created_at` - Database timestamp
- Booking totals (`total_sell_price`, `total_cost_price`, `gross_profit`) - Auto-calculated
- `margin` fields on services - Auto-calculated
- `amount_received` on bookings - Auto-calculated from payments
- `payment_status` on bookings - Auto-updated

### 2. Date Formats
- **Frontend to Backend:** Send as "YYYY-MM-DD" (e.g., "2025-12-01")
- **Backend to Frontend:** Receives "YYYY-MM-DD"
- **Frontend Display:** Shows as "Dec 1, 2025" (use formatDate() function)

### 3. DateTime Formats
- **Frontend to Backend:** Send as "YYYY-MM-DD HH:MM:SS"
- **Backend to Frontend:** Receives ISO 8601 "2025-11-07T10:30:00Z"
- **Frontend Display:** Shows as "Nov 7, 2025 10:30 AM" (use formatDateTime() function)

### 4. Currency/Decimal Formats
- **Frontend to Backend:** Send as number (e.g., 1234.50)
- **Backend to Frontend:** Receives as float
- **Frontend Display:** Shows as "$1,234.50" (use formatCurrency() function)

### 5. Enum Values (Use Exact Values)

**Booking Status:**
- `inquiry`
- `quoted`
- `confirmed`
- `completed`
- `cancelled`

**Payment Status:**
- `pending`
- `partial`
- `paid`

**Client Type:**
- `agent`
- `direct`

**Booking Source (booked_by):**
- `agent`
- `direct`

**Operation Type:**
- `supplier`
- `self-operated`

**Supplier Type:**
- `hotel`
- `tour`
- `transfer`
- `flight`
- `guide`
- `vehicle`
- `other`

---

## ⚡ Auto-Calculation Examples

### Example 1: Adding Hotel to Booking

**You enter:**
```json
{
  "booking_id": 47,
  "sell_price": 1000,
  "total_cost": 800
}
```

**System auto-calculates:**
- `margin` = 1000 - 800 = 200

**System updates booking:**
- `total_sell_price` = (sum of all services sell_price)
- `total_cost_price` = (sum of all services costs)
- `gross_profit` = (total_sell_price - total_cost_price)

### Example 2: Adding Payment

**You enter:**
```json
{
  "booking_id": 47,
  "amount": 500
}
```

**Booking currently:**
- `total_sell_price` = 1000
- `amount_received` = 0
- `payment_status` = "pending"

**System auto-updates:**
- `amount_received` = 500
- `payment_status` = "partial" (because 500 < 1000)

---

## 🔍 Quick Troubleshooting

### Problem: "Booking not found" error
**Solution:** Ensure `booking_id` is a valid ID from the bookings table

### Problem: "Client not found" error
**Solution:** Ensure `client_id` exists in clients table

### Problem: Totals not updating
**Solution:** Database triggers handle this automatically. Refresh the booking details page.

### Problem: Payment status not changing
**Solution:** Database triggers handle this automatically. Refresh the booking details page after adding payment.

### Problem: Cannot delete booking
**Solution:** System uses soft delete - booking status is set to 'cancelled', not actually deleted

---

## 📌 Common Workflows

### Workflow 1: Create Complete Booking

1. **Create Booking**
   ```
   POST /api/bookings
   {
     "client_id": 5,
     "pax_count": 2,
     "travel_date_from": "2025-12-01",
     "travel_date_to": "2025-12-05"
   }
   ```
   → Receives booking with `booking_code` = "Funny-1047"

2. **Add Hotel Service**
   ```
   POST /api/booking-hotels
   {
     "booking_id": 47,
     "hotel_id": 3,
     "check_in": "2025-12-01",
     "sell_price": 500,
     "total_cost": 400
   }
   ```
   → Booking totals auto-update

3. **Add Tour Service**
   ```
   POST /api/booking-tours
   {
     "booking_id": 47,
     "tour_name": "City Tour",
     "operation_type": "supplier",
     "supplier_id": 8,
     "sell_price": 300,
     "supplier_cost": 200
   }
   ```
   → Booking totals auto-update again

4. **Add Passengers**
   ```
   POST /api/passengers
   {
     "booking_id": 47,
     "name": "John Smith",
     "passport_number": "A12345"
   }
   ```

5. **Record Payment**
   ```
   POST /api/client-payments
   {
     "booking_id": 47,
     "payment_date": "2025-11-07",
     "amount": 400
   }
   ```
   → Payment status auto-updates to "partial"

6. **Confirm Booking**
   ```
   PUT /api/bookings/47
   {
     "status": "confirmed",
     "is_confirmed": true
   }
   ```
   → `confirmed_at` timestamp auto-set

---

## 🎓 Key Takeaways

✅ **Always use exact enum values** (case-sensitive)
✅ **Date format:** YYYY-MM-DD
✅ **Don't send auto-calculated fields** (booking totals, margins, payment status)
✅ **booking_id is required** when adding services or payments
✅ **System auto-refreshes** totals and statuses via database triggers
✅ **Soft deletes** - records aren't removed, just marked inactive/cancelled

---

**End of Quick Reference**
