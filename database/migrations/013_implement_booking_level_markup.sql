-- ============================================================
-- Migration 013: Implement Booking-Level Markup System
-- ============================================================
-- Description: Simplify pricing to use only net/cost prices
--              in services, with a single markup % at booking level
-- Date: 2025-11-10
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Add markup_percentage to bookings table
-- ============================================================
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS markup_percentage DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN bookings.markup_percentage IS 'Markup percentage applied to total cost (e.g., 15.00 = 15%)';

-- ============================================================
-- STEP 2: Drop dependent views before removing columns
-- ============================================================

DROP VIEW IF EXISTS view_booking_services CASCADE;

-- ============================================================
-- STEP 3: Remove sell_price and margin from all service tables
-- ============================================================

-- Hotels
ALTER TABLE booking_hotels
DROP COLUMN IF EXISTS sell_price,
DROP COLUMN IF EXISTS margin;

-- Tours
ALTER TABLE booking_tours
DROP COLUMN IF EXISTS sell_price,
DROP COLUMN IF EXISTS margin;

-- Transfers
ALTER TABLE booking_transfers
DROP COLUMN IF EXISTS sell_price,
DROP COLUMN IF EXISTS margin;

-- Flights
ALTER TABLE booking_flights
DROP COLUMN IF EXISTS sell_price,
DROP COLUMN IF EXISTS margin;

-- ============================================================
-- STEP 4: Recreate view without sell_price and margin
-- ============================================================

CREATE OR REPLACE VIEW view_booking_services AS
SELECT
    b.id AS booking_id,
    b.booking_code,
    'hotel'::TEXT AS service_type,
    bh.hotel_name AS service_name,
    bh.check_in AS service_date,
    bh.total_cost,
    bh.payment_status
FROM bookings b
JOIN booking_hotels bh ON b.id = bh.booking_id
UNION ALL
SELECT
    b.id AS booking_id,
    b.booking_code,
    'tour'::TEXT AS service_type,
    bt.tour_name AS service_name,
    bt.tour_date AS service_date,
    bt.total_cost,
    bt.payment_status
FROM bookings b
JOIN booking_tours bt ON b.id = bt.booking_id
UNION ALL
SELECT
    b.id AS booking_id,
    b.booking_code,
    'transfer'::TEXT AS service_type,
    CONCAT(btr.transfer_type, ': ', btr.from_location, ' → ', btr.to_location) AS service_name,
    btr.transfer_date AS service_date,
    btr.cost_price AS total_cost,
    btr.payment_status
FROM bookings b
JOIN booking_transfers btr ON b.id = btr.booking_id
UNION ALL
SELECT
    b.id AS booking_id,
    b.booking_code,
    'flight'::TEXT AS service_type,
    CONCAT(bf.airline, ' ', bf.flight_number) AS service_name,
    DATE(bf.departure_date) AS service_date,
    bf.cost_price AS total_cost,
    bf.payment_status
FROM bookings b
JOIN booking_flights bf ON b.id = bf.booking_id;

COMMENT ON VIEW view_booking_services IS 'Unified view of all booking services showing only cost prices';

-- ============================================================
-- STEP 5: Update the calculate_booking_totals function
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_booking_totals(p_booking_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_cost DECIMAL(12,2);
    v_markup_percentage DECIMAL(5,2);
    v_total_sell DECIMAL(12,2);
    v_gross_profit DECIMAL(12,2);
BEGIN
    -- Get markup percentage for this booking
    SELECT markup_percentage INTO v_markup_percentage
    FROM bookings
    WHERE id = p_booking_id;

    -- Default to 0 if NULL
    v_markup_percentage := COALESCE(v_markup_percentage, 0);

    -- Calculate total cost from all services
    SELECT COALESCE(SUM(cost), 0)
    INTO v_total_cost
    FROM (
        SELECT total_cost as cost FROM booking_hotels WHERE booking_id = p_booking_id
        UNION ALL
        SELECT total_cost as cost FROM booking_tours WHERE booking_id = p_booking_id
        UNION ALL
        SELECT cost_price as cost FROM booking_transfers WHERE booking_id = p_booking_id
        UNION ALL
        SELECT cost_price as cost FROM booking_flights WHERE booking_id = p_booking_id
    ) all_services;

    -- Calculate sell price with markup
    v_total_sell := v_total_cost * (1 + v_markup_percentage / 100);

    -- Calculate gross profit
    v_gross_profit := v_total_sell - v_total_cost;

    -- Update booking totals
    UPDATE bookings
    SET
        total_cost_price = v_total_cost,
        total_sell_price = v_total_sell,
        gross_profit = v_gross_profit
    WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_booking_totals(INTEGER) IS
'Calculate booking totals using only cost prices from services and applying markup percentage';

-- ============================================================
-- STEP 6: Recalculate all existing booking totals
-- ============================================================
DO $$
DECLARE
    booking_record RECORD;
BEGIN
    FOR booking_record IN SELECT id FROM bookings
    LOOP
        PERFORM calculate_booking_totals(booking_record.id);
    END LOOP;
END $$;

-- ============================================================
-- STEP 7: Add helpful comments
-- ============================================================
COMMENT ON COLUMN booking_hotels.total_cost IS 'Net/cost price from hotel supplier';
COMMENT ON COLUMN booking_tours.total_cost IS 'Net/cost price (from supplier or self-operated breakdown)';
COMMENT ON COLUMN booking_transfers.cost_price IS 'Net/cost price for transfer';
COMMENT ON COLUMN booking_flights.cost_price IS 'Net/cost price for flight';

COMMENT ON COLUMN bookings.total_cost_price IS 'Sum of all service costs';
COMMENT ON COLUMN bookings.total_sell_price IS 'Total cost + markup percentage';
COMMENT ON COLUMN bookings.gross_profit IS 'Difference between sell price and cost';

COMMIT;

-- ============================================================
-- Migration complete!
-- ============================================================
-- Summary:
-- ✓ Added markup_percentage to bookings table
-- ✓ Dropped view_booking_services (dependent on sell_price)
-- ✓ Removed sell_price and margin from all 4 service tables
-- ✓ Recreated view_booking_services with only cost prices
-- ✓ Updated calculate_booking_totals function to use markup
-- ✓ Recalculated all existing bookings with new system
-- ============================================================
