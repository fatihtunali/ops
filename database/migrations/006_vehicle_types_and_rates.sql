-- Migration: Vehicle Types and Vehicle Rates System
-- Created: 2025-11-08
-- Description: Creates fixed vehicle types and seasonal rate management

-- =====================================================
-- 1. CREATE VEHICLE TYPES TABLE (Master Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicle_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  max_capacity INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE vehicle_types IS 'Master table for fixed vehicle types (4 standard types)';
COMMENT ON COLUMN vehicle_types.name IS 'Vehicle type name (e.g., Mercedes Vito)';
COMMENT ON COLUMN vehicle_types.max_capacity IS 'Maximum passenger capacity';

-- Insert the 4 fixed vehicle types
INSERT INTO vehicle_types (name, max_capacity, description) VALUES
('Mercedes Vito', 4, 'Luxury sedan, suitable for small families or business travelers'),
('Mercedes Sprinter', 10, 'Mini van, ideal for small groups'),
('Isuzu Midibus', 20, 'Midi bus, perfect for medium-sized groups'),
('Coach Bus', 50, 'Full-size coach, for large groups and tours')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. CREATE VEHICLE RATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS vehicle_rates (
  id SERIAL PRIMARY KEY,

  -- Hierarchy: City → Supplier → Season → Vehicle Type
  city VARCHAR(100) NOT NULL,

  supplier_id INTEGER REFERENCES tour_suppliers(id) ON DELETE CASCADE,
  supplier_name VARCHAR(255) NOT NULL,

  season_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  vehicle_type_id INTEGER REFERENCES vehicle_types(id) NOT NULL,

  -- Currency
  currency VARCHAR(10) DEFAULT 'EUR',

  -- Pricing for different service types
  full_day_price DECIMAL(10,2),
  half_day_price DECIMAL(10,2),
  airport_to_hotel DECIMAL(10,2),
  hotel_to_airport DECIMAL(10,2),
  round_trip DECIMAL(10,2),

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (start_date <= end_date),
  CHECK (full_day_price >= 0 OR full_day_price IS NULL),
  CHECK (half_day_price >= 0 OR half_day_price IS NULL),
  CHECK (airport_to_hotel >= 0 OR airport_to_hotel IS NULL),
  CHECK (hotel_to_airport >= 0 OR hotel_to_airport IS NULL),
  CHECK (round_trip >= 0 OR round_trip IS NULL),

  -- Unique constraint: No duplicate rates for same city/supplier/season/vehicle
  CONSTRAINT unique_vehicle_rate UNIQUE (
    city, supplier_id, season_name, vehicle_type_id
  )
);

COMMENT ON TABLE vehicle_rates IS 'Vehicle pricing by city, supplier, season, and vehicle type';
COMMENT ON COLUMN vehicle_rates.city IS 'City/location where rate applies (e.g., Antalya, Bodrum)';
COMMENT ON COLUMN vehicle_rates.supplier_name IS 'Denormalized supplier name for quick access';
COMMENT ON COLUMN vehicle_rates.season_name IS 'Season name (e.g., Winter 2025-26)';
COMMENT ON COLUMN vehicle_rates.full_day_price IS 'Price for full day rental';
COMMENT ON COLUMN vehicle_rates.half_day_price IS 'Price for half day rental';
COMMENT ON COLUMN vehicle_rates.airport_to_hotel IS 'One-way transfer price: airport to hotel';
COMMENT ON COLUMN vehicle_rates.hotel_to_airport IS 'One-way transfer price: hotel to airport';
COMMENT ON COLUMN vehicle_rates.round_trip IS 'Round trip transfer price';

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Indexes following the hierarchy: City → Supplier → Vehicle Type
CREATE INDEX idx_vehicle_rates_city ON vehicle_rates(city);
CREATE INDEX idx_vehicle_rates_city_supplier ON vehicle_rates(city, supplier_id);
CREATE INDEX idx_vehicle_rates_city_dates ON vehicle_rates(city, start_date, end_date);
CREATE INDEX idx_vehicle_rates_vehicle_type ON vehicle_rates(vehicle_type_id);
CREATE INDEX idx_vehicle_rates_season ON vehicle_rates(season_name);
CREATE INDEX idx_vehicle_rates_active ON vehicle_rates(is_active);

-- Composite index for fast lookups during booking
CREATE INDEX idx_vehicle_rates_lookup ON vehicle_rates(
  city, supplier_id, vehicle_type_id, start_date, end_date
);

-- =====================================================
-- 4. CREATE VIEW FOR EASY QUERIES
-- =====================================================

CREATE OR REPLACE VIEW view_vehicle_rates_detailed AS
SELECT
  vr.id,
  vr.city,
  vr.supplier_id,
  vr.supplier_name,
  vr.season_name,
  vr.start_date,
  vr.end_date,
  vt.id as vehicle_type_id,
  vt.name as vehicle_type,
  vt.max_capacity,
  vr.currency,
  vr.full_day_price,
  vr.half_day_price,
  vr.airport_to_hotel,
  vr.hotel_to_airport,
  vr.round_trip,
  vr.notes,
  vr.is_active,
  vr.created_at
FROM vehicle_rates vr
JOIN vehicle_types vt ON vr.vehicle_type_id = vt.id;

COMMENT ON VIEW view_vehicle_rates_detailed IS 'Vehicle rates with joined vehicle type details';

-- =====================================================
-- 5. CREATE TRIGGER FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_vehicle_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicle_rates_updated_at
BEFORE UPDATE ON vehicle_rates
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_rates_timestamp();

-- =====================================================
-- 6. SAMPLE DATA (for testing)
-- =====================================================

-- Insert sample rates for Antalya - Örnek A Firması - Winter 2025-26
-- (Uncomment to add sample data)
/*
INSERT INTO vehicle_rates (
  city, supplier_id, supplier_name, season_name, start_date, end_date,
  vehicle_type_id, currency,
  full_day_price, half_day_price, airport_to_hotel, hotel_to_airport, round_trip
) VALUES
-- Antalya - Örnek A Firması
('Antalya', 1, 'Örnek A Firması', 'Winter 2025-26', '2025-11-01', '2026-03-14',
 1, 'EUR', 70, 45, 45, 45, 80),
('Antalya', 1, 'Örnek A Firması', 'Winter 2025-26', '2025-11-01', '2026-03-14',
 2, 'EUR', 120, 60, 40, 40, 70),
('Antalya', 1, 'Örnek A Firması', 'Winter 2025-26', '2025-11-01', '2026-03-14',
 3, 'EUR', 240, 120, 80, 80, 150),
('Antalya', 1, 'Örnek A Firması', 'Winter 2025-26', '2025-11-01', '2026-03-14',
 4, 'EUR', 400, 200, 200, 200, 350)
ON CONFLICT (city, supplier_id, season_name, vehicle_type_id) DO NOTHING;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check vehicle types
SELECT * FROM vehicle_types ORDER BY max_capacity;

-- Check vehicle rates (will be empty initially)
SELECT * FROM view_vehicle_rates_detailed;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
DROP VIEW IF EXISTS view_vehicle_rates_detailed;
DROP TRIGGER IF EXISTS trg_vehicle_rates_updated_at ON vehicle_rates;
DROP FUNCTION IF EXISTS update_vehicle_rates_timestamp();
DROP TABLE IF EXISTS vehicle_rates;
DROP TABLE IF EXISTS vehicle_types;
*/
