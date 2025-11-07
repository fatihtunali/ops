# Phase 5 - Service Management Implementation Plan

**Date:** 2025-11-07
**Goal:** Complete booking service management (Step 2) in create/edit booking flow

---

## Backend API Verification

### Booking Hotels API
**Base:** `/api/booking-hotels`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all booking hotels |
| GET | `/:id` | Get single booking hotel |
| POST | `/` | Create new booking hotel |
| PUT | `/:id` | Update booking hotel |
| DELETE | `/:id` | Delete booking hotel |

### Booking Tours API
**Base:** `/api/booking-tours`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all booking tours |
| GET | `/:id` | Get single booking tour |
| POST | `/` | Create new booking tour |
| PUT | `/:id` | Update booking tour |
| DELETE | `/:id` | Delete booking tour |

### Booking Transfers API
**Base:** `/api/booking-transfers`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all booking transfers |
| GET | `/:id` | Get single booking transfer |
| POST | `/` | Create new booking transfer |
| PUT | `/:id` | Update booking transfer |
| DELETE | `/:id` | Delete booking transfer |

### Booking Flights API
**Base:** `/api/booking-flights`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all booking flights |
| GET | `/:id` | Get single booking flight |
| POST | `/` | Create new booking flight |
| PUT | `/:id` | Update booking flight |
| DELETE | `/:id` | Delete booking flight |

---

## Database Schema Reference

### booking_hotels
```
id (PK)
booking_id (FK)
hotel_id
hotel_name
check_in (date)
check_out (date)
nights (integer)
room_type
number_of_rooms
cost_per_night (numeric)
total_cost (numeric)
sell_price (numeric)
margin (numeric)
payment_status
paid_amount (numeric)
payment_due_date (date)
confirmation_number
voucher_issued (boolean)
notes
created_at
```

### booking_tours
```
id (PK)
booking_id (FK)
tour_name
tour_date (date)
duration
pax_count
operation_type ('supplier' | 'self-operated')
supplier_id (FK)
supplier_cost (numeric)
guide_id (FK)
guide_cost (numeric)
vehicle_id (FK)
vehicle_cost (numeric)
entrance_fees (numeric)
other_costs (numeric)
total_cost (numeric)
sell_price (numeric)
margin (numeric)
payment_status
paid_amount (numeric)
payment_due_date (date)
confirmation_number
voucher_issued (boolean)
notes
created_at
```

### booking_transfers
```
id (PK)
booking_id (FK)
transfer_type
transfer_date (date)
from_location
to_location
pax_count
vehicle_type
operation_type ('supplier' | 'self-operated')
supplier_id (FK)
vehicle_id (FK)
cost_price (numeric)
sell_price (numeric)
margin (numeric)
payment_status
paid_amount (numeric)
confirmation_number
voucher_issued (boolean)
notes
created_at
```

### booking_flights
```
id (PK)
booking_id (FK)
airline
flight_number
departure_date (timestamp)
arrival_date (timestamp)
from_airport
to_airport
pax_count
cost_price (numeric)
sell_price (numeric)
margin (numeric)
payment_status
paid_amount (numeric)
pnr
ticket_numbers
voucher_issued (boolean)
notes
created_at
```

---

## Implementation Plan

### Step 1: Update CreateBooking Component Structure
- ✅ Add tabs for each service type (Hotels, Tours, Transfers, Flights)
- ✅ Create service list display with add/edit/delete buttons
- ✅ Add service summary cards

### Step 2: Create Service Forms

#### A. Hotel Service Form
**Required Fields:**
- Hotel selection (dropdown from hotels API)
- Check-in date
- Check-out date (auto-calculate nights)
- Room type
- Number of rooms
- Cost per night
- Sell price (auto-calculate total)

**Optional Fields:**
- Payment status
- Paid amount
- Payment due date
- Confirmation number
- Voucher issued
- Notes

#### B. Tour Service Form
**Required Fields:**
- Tour name
- Tour date
- PAX count
- Operation type (supplier/self-operated)

**Conditional Fields (if supplier):**
- Supplier selection
- Supplier cost

**Conditional Fields (if self-operated):**
- Guide selection
- Guide cost
- Vehicle selection
- Vehicle cost
- Entrance fees
- Other costs

**Common Fields:**
- Sell price
- Payment details
- Confirmation number
- Notes

#### C. Transfer Service Form
**Required Fields:**
- Transfer type (Airport Pickup, Airport Drop-off, Inter-city, etc.)
- Transfer date
- From location
- To location
- PAX count
- Vehicle type
- Operation type (supplier/self-operated)

**Conditional Fields:**
- Supplier selection (if supplier)
- Vehicle selection (if self-operated)
- Cost price
- Sell price

**Optional Fields:**
- Payment details
- Confirmation number
- Notes

#### D. Flight Service Form
**Required Fields:**
- Airline
- Flight number
- Departure date/time
- Arrival date/time
- From airport
- To airport
- PAX count
- Cost price
- Sell price

**Optional Fields:**
- PNR
- Ticket numbers
- Payment details
- Voucher issued
- Notes

### Step 3: Auto-calculations
- Auto-calculate hotel nights from check-in/check-out
- Auto-calculate total cost from component costs
- Auto-calculate margins (sell price - cost)
- Aggregate all service costs for booking total

### Step 4: Validation
- Ensure dates are valid and in sequence
- Ensure PAX count matches booking PAX
- Validate cost/price fields are numbers
- Require operation type selection
- Require conditional fields based on operation type

### Step 5: Integration
- Services stored in component state during creation
- On submit, send services array with booking
- Backend processes services after booking creation
- Update booking totals based on service costs

---

## Frontend Service Structure

```javascript
// State structure in CreateBooking
const [services, setServices] = useState({
  hotels: [
    {
      hotel_id: null,
      hotel_name: '',
      check_in: '',
      check_out: '',
      nights: 0,
      room_type: '',
      number_of_rooms: 1,
      cost_per_night: 0,
      total_cost: 0,
      sell_price: 0,
      margin: 0,
      // ... other fields
    }
  ],
  tours: [...],
  transfers: [...],
  flights: [...]
});
```

---

## UI/UX Design

### Step 2 Layout
```
┌─────────────────────────────────────────────────────┐
│ Add Services                                        │
├─────────────────────────────────────────────────────┤
│ [ Hotels ] [ Tours ] [ Transfers ] [ Flights ]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Hotels (2)                          [+ Add Hotel] │
│  ┌───────────────────────────────────────────────┐ │
│  │ Hilton Istanbul                               │ │
│  │ Dec 15 - Dec 18 (3 nights)                    │ │
│  │ 2x Standard Double                            │ │
│  │ Cost: $450 | Sell: $600 | Margin: $150       │ │
│  │                             [Edit] [Delete]   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Add Hotel Form - Modal or Inline]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Add Service Modal/Form
- Clean, simple form
- Grouped fields (Basic Info, Pricing, Payment, Notes)
- Real-time calculation of totals and margins
- Validation messages inline
- Save & Add Another / Save & Close buttons

---

## Testing Checklist

### Unit Tests
- [ ] Hotel form validation
- [ ] Tour form validation
- [ ] Transfer form validation
- [ ] Flight form validation
- [ ] Auto-calculations (nights, totals, margins)
- [ ] Service add/edit/delete operations

### Integration Tests
- [ ] Create booking with hotels only
- [ ] Create booking with tours only
- [ ] Create booking with all service types
- [ ] Edit booking - modify existing services
- [ ] Totals update correctly when services change
- [ ] Backend receives correct service data

### Edge Cases
- [ ] No services added (should show $0 totals)
- [ ] Delete all services
- [ ] Operation type switching (supplier ↔ self-operated)
- [ ] Invalid dates
- [ ] Negative costs/prices
- [ ] Very long text in notes

---

## Dependencies

### Backend APIs (Already exist)
- ✅ Hotels API (`/api/hotels`)
- ✅ Tour Suppliers API (`/api/tour-suppliers`)
- ✅ Guides API (`/api/guides`)
- ✅ Vehicles API (`/api/vehicles`)
- ✅ Booking Hotels CRUD
- ✅ Booking Tours CRUD
- ✅ Booking Transfers CRUD
- ✅ Booking Flights CRUD

### Frontend Services (Need to verify)
- Check if we have service files for each API
- Ensure consistent error handling
- Add TypeScript types/prop types

---

## Timeline

1. **Verification (30 min)** - Verify all APIs and schemas ✅
2. **Hotel Form (2 hours)** - Build complete hotel service form
3. **Tour Form (2 hours)** - Build complete tour service form
4. **Transfer Form (1.5 hours)** - Build transfer service form
5. **Flight Form (1.5 hours)** - Build flight service form
6. **Integration (1 hour)** - Wire everything to submit flow
7. **Testing (1 hour)** - Test all scenarios
8. **Refinement (30 min)** - Fix bugs, improve UX

**Total:** ~10 hours

---

## Next Steps

1. Complete backend API verification
2. Check frontend service files
3. Start with Hotel service form (simplest)
4. Build reusable components for common fields
5. Progressive enhancement for each service type
