# Vehicle Rates System Implementation

**Date:** 2025-11-08
**Status:** ✅ Backend Complete | ⏳ Frontend Pending

---

## Overview

Implemented a comprehensive vehicle pricing system with seasonal rates from suppliers, supporting multiple cities, vehicle types, and service types (full day, half day, transfers).

## System Architecture

### Hierarchy

```
CITY (Primary)
  └─> SUPPLIER (Multiple per city)
      └─> SEASON (Winter 2025-26, Summer 2026, etc.)
          └─> VEHICLE TYPE (4 fixed types)
              └─> SERVICE TYPE → PRICE
```

---

## Database Implementation ✅

### Tables Created

#### 1. `vehicle_types` (Master Data - 4 Fixed Types)

| ID | Name | Capacity | Description |
|----|------|----------|-------------|
| 1 | Mercedes Vito | 4 | Luxury sedan, suitable for small families |
| 2 | Mercedes Sprinter | 10 | Mini van, ideal for small groups |
| 3 | Isuzu Midibus | 20 | Midi bus, perfect for medium-sized groups |
| 4 | Coach Bus | 50 | Full-size coach, for large groups |

**Features:**
- Fixed vehicle types (system-wide standard)
- Auto-populated in dropdowns
- Cannot be modified by users

#### 2. `vehicle_rates` (Pricing Table)

**Fields:**
- `city` - Location (Antalya, Bodrum, Istanbul, etc.)
- `supplier_id` - FK to tour_suppliers
- `supplier_name` - Denormalized for quick access
- `season_name` - Season identifier
- `start_date` / `end_date` - Date range
- `vehicle_type_id` - FK to vehicle_types
- `currency` - Default EUR
- **Pricing fields:**
  - `full_day_price`
  - `half_day_price`
  - `airport_to_hotel`
  - `hotel_to_airport`
  - `round_trip`

**Constraints:**
- Unique combination: (city, supplier, season, vehicle_type)
- Date validation: start_date <= end_date
- Price validation: All prices >= 0 or NULL

**Indexes:**
- City-based lookup
- Supplier-based lookup
- Date range lookup
- Composite index for fast booking lookups

#### 3. `view_vehicle_rates_detailed` (View)

Joins `vehicle_rates` with `vehicle_types` for easy querying with vehicle details.

---

## Backend API Implementation ✅

### Vehicle Types API

**Base:** `/api/vehicle-types`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vehicle-types` | GET | Get all vehicle types |
| `/api/vehicle-types/:id` | GET | Get single vehicle type |

**Sample Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mercedes Vito",
      "max_capacity": 4,
      "description": "Luxury sedan...",
      "is_active": true
    }
  ]
}
```

### Vehicle Rates API

**Base:** `/api/vehicle-rates`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vehicle-rates` | GET | Get all rates (with filters) |
| `/api/vehicle-rates/cities` | GET | Get list of cities |
| `/api/vehicle-rates/suppliers?city=X` | GET | Get suppliers for city |
| `/api/vehicle-rates/:id` | GET | Get single rate |
| `/api/vehicle-rates` | POST | Create new rate |
| `/api/vehicle-rates/:id` | PUT | Update rate |
| `/api/vehicle-rates/:id` | DELETE | Soft delete rate |

**Query Filters:**
- `city` - Filter by city
- `supplier_id` - Filter by supplier
- `season_name` - Filter by season
- `vehicle_type_id` - Filter by vehicle type
- `date` - Find rates active on specific date
- `is_active` - Show active/inactive rates
- `page` / `limit` - Pagination

**Sample Request (Create):**
```json
{
  "city": "Antalya",
  "supplier_id": 1,
  "supplier_name": "Örnek A Firması",
  "season_name": "Winter 2025-26",
  "start_date": "2025-11-01",
  "end_date": "2026-03-14",
  "vehicle_type_id": 1,
  "currency": "EUR",
  "full_day_price": 70,
  "half_day_price": 45,
  "airport_to_hotel": 45,
  "hotel_to_airport": 45,
  "round_trip": 80,
  "notes": "Standard winter rates"
}
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "city": "Antalya",
    "supplier_name": "Örnek A Firması",
    "season_name": "Winter 2025-26",
    "vehicle_type": "Mercedes Vito",
    "max_capacity": 4,
    "full_day_price": 70,
    "half_day_price": 45,
    "airport_to_hotel": 45,
    "hotel_to_airport": 45,
    "round_trip": 80,
    "currency": "EUR"
  }
}
```

---

## Files Created

### Database
- ✅ `database/migrations/006_vehicle_types_and_rates.sql` - Migration script
- ✅ `database/scripts/run_vehicle_migration.js` - Migration runner
- ✅ `backend/run_vehicle_migration.js` - Quick migration script

### Backend
- ✅ `backend/src/controllers/vehicleTypeController.js`
- ✅ `backend/src/controllers/vehicleRateController.js`
- ✅ `backend/src/routes/vehicleTypes.js`
- ✅ `backend/src/routes/vehicleRates.js`
- ✅ `backend/server.js` (updated with new routes)
- ✅ `backend/test_vehicle_apis.js` - API test script

---

## Next Steps (Frontend)

### 1. Create Vehicle Rates Management Page

**Location:** `frontend/src/pages/VehicleRates/VehicleRatesList.jsx`

**Features:**
- List all vehicle rates
- Filter by: City, Supplier, Season, Vehicle Type
- Add new rate (modal form)
- Edit rate (modal form)
- Delete rate (soft delete)
- Pagination
- Search functionality

**UI Components Needed:**
- VehicleRatesList.jsx (main page)
- VehicleRateForm.jsx (add/edit modal)
- VehicleRateCard.jsx (display component)

### 2. Integration with Booking Transfers

**When creating a transfer booking:**
1. User selects: City
2. System shows: Available suppliers for that city
3. User selects: Supplier, Date
4. System shows: Available vehicles with prices (based on date range)
5. User selects: Vehicle, Transfer type (Airport→Hotel, Full Day, etc.)
6. System auto-populates: `cost_price` with the appropriate rate

**Files to modify:**
- `frontend/src/components/Booking/AddTransferService.jsx`
- `backend/src/controllers/bookingTransferController.js`

### 3. Integration with Booking Tours

**When creating a self-operated tour:**
1. User selects: City, Date
2. System shows: Available vehicles with full_day/half_day prices
3. User selects: Vehicle
4. System auto-populates: `vehicle_cost`

**Files to modify:**
- `frontend/src/components/Booking/AddTourService.jsx`
- `backend/src/controllers/bookingTourController.js`

### 4. Excel Import/Export

**Import:**
- Upload Excel file with vehicle rates
- Map columns to database fields
- Validate data
- Bulk insert rates

**Export:**
- Download current rates as Excel
- Filter by city/supplier/season
- Format for easy editing and re-import

**File to create:**
- `backend/src/controllers/vehicleRateImportController.js`

---

## Usage Example

### Backend API Usage

```javascript
// Get all vehicle types (for dropdown)
GET /api/vehicle-types
→ Returns: 4 fixed vehicle types

// Get rates for Antalya on a specific date
GET /api/vehicle-rates?city=Antalya&date=2025-12-15
→ Returns: All active rates in Antalya valid on Dec 15, 2025

// Get available suppliers in Istanbul
GET /api/vehicle-rates/suppliers?city=Istanbul
→ Returns: List of suppliers with rates in Istanbul

// Create a new rate
POST /api/vehicle-rates
Body: { city, supplier_id, vehicle_type_id, prices... }
→ Returns: Created rate with ID

// Update pricing
PUT /api/vehicle-rates/123
Body: { full_day_price: 80, half_day_price: 50 }
→ Returns: Updated rate
```

### Frontend Usage (To Be Implemented)

```javascript
// In VehicleRatesList.jsx
const { data: vehicleTypes } = await vehicleTypesService.getAll();
const { data: rates } = await vehicleRatesService.getAll({ city: 'Antalya' });

// In AddTransferService.jsx
const { data: rates } = await vehicleRatesService.getAll({
  city: 'Antalya',
  supplier_id: selectedSupplier,
  date: transferDate
});

// Auto-populate cost_price
const selectedRate = rates.find(r =>
  r.vehicle_type_id === selectedVehicle &&
  r.supplier_id === selectedSupplier
);
const costPrice = selectedRate.airport_to_hotel; // Based on service type
```

---

## Testing

### Manual Testing Steps

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test migration:**
   ```bash
   node run_vehicle_migration.js
   ```

3. **Get auth token:**
   ```bash
   POST http://localhost:5000/api/auth/login
   {
     "username": "admin",
     "password": "your_password"
   }
   ```

4. **Test APIs:**
   - Update `AUTH_TOKEN` in `test_vehicle_apis.js`
   - Uncomment `testVehicleAPIs()` call
   - Run: `node test_vehicle_apis.js`

### Expected Results

✅ All 4 vehicle types visible
✅ Can create rates for any city/supplier/season
✅ Filters work correctly
✅ Soft delete works (rates hidden but not removed)
✅ Unique constraint prevents duplicates

---

## Data Model Summary

```
tour_suppliers (existing)
  ├─> vehicle_rates (new)
  │   └─> vehicle_types (new, 4 fixed)
  │
  └─> booking_transfers (existing)
      └─> Will use vehicle_rates for pricing

bookings (existing)
  └─> booking_tours (existing)
      └─> Will use vehicle_rates for vehicle_cost
```

---

## Benefits

### For Operations Team
- ✅ Centralized rate management
- ✅ Seasonal pricing support
- ✅ Multi-supplier comparison
- ✅ Automatic pricing in bookings
- ✅ Rate history tracking

### For System
- ✅ Consistent vehicle types across all suppliers
- ✅ Date-based rate lookup
- ✅ Automatic price calculation
- ✅ No manual entry errors
- ✅ Easy bulk updates via Excel

---

## Migration Notes

**Run migration:**
```bash
cd backend
node run_vehicle_migration.js
```

**Rollback (if needed):**
```sql
DROP VIEW IF EXISTS view_vehicle_rates_detailed;
DROP TABLE IF EXISTS vehicle_rates;
DROP TABLE IF EXISTS vehicle_types;
```

---

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | 2 tables, 1 view, triggers |
| Backend API | ✅ Complete | 9 endpoints, full CRUD |
| Server Integration | ✅ Complete | Routes registered |
| API Testing | ✅ Complete | Test script provided |
| Frontend UI | ⏳ Pending | Next phase |
| Integration (Transfers) | ⏳ Pending | After UI |
| Integration (Tours) | ⏳ Pending | After UI |
| Excel Import/Export | ⏳ Pending | Future enhancement |

---

**Implementation Time:** ~2 hours
**Next Phase:** Frontend UI development
**Estimated Time:** 2-3 hours

---

**Last Updated:** 2025-11-08
**Status:** Backend Ready ✅ | Frontend Pending ⏳
