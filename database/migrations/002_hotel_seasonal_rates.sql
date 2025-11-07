-- ============================================================
-- MIGRATION: Create Hotel Seasonal Rates System
-- ============================================================
-- Version: 002
-- Date: 2025-11-07
-- Description: Create seasonal pricing table for hotels
--              Each hotel can have multiple rate periods
-- ============================================================

-- Step 1: Remove old single price column from hotels table
ALTER TABLE hotels
DROP COLUMN IF EXISTS standard_cost_per_night;

-- Step 2: Create seasonal rates table
CREATE TABLE hotel_seasonal_rates (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,

    -- Season/Period information
    season_name VARCHAR(100) NOT NULL, -- e.g., "Summer 2025", "High Season", "Christmas Period"
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,

    -- Pricing structure
    price_per_person_double DECIMAL(10,2), -- per person in double room
    price_single_supplement DECIMAL(10,2), -- supplement for single occupancy
    price_per_person_triple DECIMAL(10,2), -- per person in triple room
    price_child_0_2 DECIMAL(10,2), -- child 0-2.99 years with 2 adults
    price_child_3_5 DECIMAL(10,2), -- child 3-5.99 years with 2 adults
    price_child_6_11 DECIMAL(10,2), -- child 6-11.99 years with 2 adults

    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_valid_date_range CHECK (valid_from <= valid_to),
    CONSTRAINT chk_positive_prices CHECK (
        price_per_person_double >= 0 AND
        price_single_supplement >= 0 AND
        price_per_person_triple >= 0 AND
        price_child_0_2 >= 0 AND
        price_child_3_5 >= 0 AND
        price_child_6_11 >= 0
    )
);

-- Step 3: Create indexes for efficient querying
CREATE INDEX idx_hotel_seasonal_rates_hotel ON hotel_seasonal_rates(hotel_id);
CREATE INDEX idx_hotel_seasonal_rates_dates ON hotel_seasonal_rates(valid_from, valid_to);
CREATE INDEX idx_hotel_seasonal_rates_period ON hotel_seasonal_rates(hotel_id, valid_from, valid_to);

-- Step 4: Add comments for clarity
COMMENT ON TABLE hotel_seasonal_rates IS 'Seasonal pricing for hotels - supports multiple rate periods per hotel';
COMMENT ON COLUMN hotel_seasonal_rates.season_name IS 'Name of the season/period (e.g., "Summer 2025", "Peak Season")';
COMMENT ON COLUMN hotel_seasonal_rates.valid_from IS 'Start date of this rate period (inclusive)';
COMMENT ON COLUMN hotel_seasonal_rates.valid_to IS 'End date of this rate period (inclusive)';
COMMENT ON COLUMN hotel_seasonal_rates.price_per_person_double IS 'Price per person when staying in a double room';
COMMENT ON COLUMN hotel_seasonal_rates.price_single_supplement IS 'Additional charge for single occupancy (supplement)';
COMMENT ON COLUMN hotel_seasonal_rates.price_per_person_triple IS 'Price per person when staying in a triple room';
COMMENT ON COLUMN hotel_seasonal_rates.price_child_0_2 IS 'Price for child aged 0-2.99 years with 2 adults';
COMMENT ON COLUMN hotel_seasonal_rates.price_child_3_5 IS 'Price for child aged 3-5.99 years with 2 adults';
COMMENT ON COLUMN hotel_seasonal_rates.price_child_6_11 IS 'Price for child aged 6-11.99 years with 2 adults';

-- Step 5: Create helper function to get applicable rate for a date
CREATE OR REPLACE FUNCTION get_hotel_rate_for_date(
    p_hotel_id INTEGER,
    p_date DATE
)
RETURNS TABLE (
    rate_id INTEGER,
    season_name VARCHAR(100),
    price_per_person_double DECIMAL(10,2),
    price_single_supplement DECIMAL(10,2),
    price_per_person_triple DECIMAL(10,2),
    price_child_0_2 DECIMAL(10,2),
    price_child_3_5 DECIMAL(10,2),
    price_child_6_11 DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        season_name,
        price_per_person_double,
        price_single_supplement,
        price_per_person_triple,
        price_child_0_2,
        price_child_3_5,
        price_child_6_11
    FROM hotel_seasonal_rates
    WHERE hotel_id = p_hotel_id
      AND p_date BETWEEN valid_from AND valid_to
    ORDER BY valid_from DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Example Data (for testing)
-- ============================================================
-- INSERT INTO hotels (name, city, country) VALUES
-- ('Grand Hotel Istanbul', 'Istanbul', 'Turkey');
--
-- INSERT INTO hotel_seasonal_rates (hotel_id, season_name, valid_from, valid_to,
--   price_per_person_double, price_single_supplement, price_per_person_triple,
--   price_child_0_2, price_child_3_5, price_child_6_11)
-- VALUES
-- (1, 'Summer 2025', '2025-06-01', '2025-08-31', 80.00, 30.00, 70.00, 0.00, 20.00, 40.00),
-- (1, 'Winter 2025', '2025-12-01', '2026-02-28', 60.00, 25.00, 55.00, 0.00, 15.00, 30.00);

-- ============================================================
-- Verification Queries
-- ============================================================
-- View all hotels with their seasonal rates:
-- SELECT
--   h.name AS hotel_name,
--   sr.season_name,
--   sr.valid_from,
--   sr.valid_to,
--   sr.price_per_person_double
-- FROM hotels h
-- LEFT JOIN hotel_seasonal_rates sr ON h.id = sr.hotel_id
-- ORDER BY h.name, sr.valid_from;

-- Get rate for specific hotel on a specific date:
-- SELECT * FROM get_hotel_rate_for_date(1, '2025-07-15');
-- ============================================================
