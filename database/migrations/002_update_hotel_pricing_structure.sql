-- ============================================================
-- MIGRATION: Update Hotel Pricing Structure
-- ============================================================
-- Version: 002
-- Date: 2025-11-07
-- Description: Replace single price with detailed pricing structure
--              for different room types and age groups
-- ============================================================

-- Step 1: Add new pricing columns
ALTER TABLE hotels
ADD COLUMN price_per_person_double DECIMAL(10,2),
ADD COLUMN price_single_supplement DECIMAL(10,2),
ADD COLUMN price_per_person_triple DECIMAL(10,2),
ADD COLUMN price_child_0_2 DECIMAL(10,2),
ADD COLUMN price_child_3_5 DECIMAL(10,2),
ADD COLUMN price_child_6_11 DECIMAL(10,2);

-- Step 2: Migrate existing data (if any exists)
-- Copy standard_cost_per_night to price_per_person_double as default
UPDATE hotels
SET price_per_person_double = standard_cost_per_night
WHERE standard_cost_per_night IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE hotels
DROP COLUMN standard_cost_per_night;

-- Step 4: Add comments for clarity
COMMENT ON COLUMN hotels.price_per_person_double IS 'Price per person when staying in a double room';
COMMENT ON COLUMN hotels.price_single_supplement IS 'Additional charge for single occupancy (supplement)';
COMMENT ON COLUMN hotels.price_per_person_triple IS 'Price per person when staying in a triple room';
COMMENT ON COLUMN hotels.price_child_0_2 IS 'Price for child aged 0-2.99 years with 2 adults';
COMMENT ON COLUMN hotels.price_child_3_5 IS 'Price for child aged 3-5.99 years with 2 adults';
COMMENT ON COLUMN hotels.price_child_6_11 IS 'Price for child aged 6-11.99 years with 2 adults';

-- ============================================================
-- Verification Query
-- ============================================================
-- Run this to verify the migration:
-- SELECT
--   id, name,
--   price_per_person_double,
--   price_single_supplement,
--   price_per_person_triple,
--   price_child_0_2,
--   price_child_3_5,
--   price_child_6_11
-- FROM hotels LIMIT 5;
-- ============================================================
