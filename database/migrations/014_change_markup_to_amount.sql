-- Migration: Change markup from percentage to fixed amount
-- Date: 2025-11-10

-- Step 1: Rename column from markup_percentage to markup_amount (already done via SSH)
-- ALTER TABLE bookings RENAME COLUMN markup_percentage TO markup_amount;
-- ALTER TABLE bookings ALTER COLUMN markup_amount TYPE DECIMAL(12,2);

-- Step 2: Update calculate_booking_totals function to use fixed markup amount
CREATE OR REPLACE FUNCTION calculate_booking_totals(p_booking_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_total_cost DECIMAL(12,2);
    v_markup_per_person DECIMAL(12,2);
    v_pax_count INTEGER;
    v_total_markup DECIMAL(12,2);
    v_total_sell DECIMAL(12,2);
    v_gross_profit DECIMAL(12,2);
BEGIN
    SELECT markup_amount, pax_count INTO v_markup_per_person, v_pax_count
    FROM bookings WHERE id = p_booking_id;

    v_markup_per_person := COALESCE(v_markup_per_person, 0);
    v_pax_count := COALESCE(v_pax_count, 1);

    -- Calculate total cost from all services
    SELECT COALESCE(SUM(cost), 0) INTO v_total_cost
    FROM (
        SELECT total_cost as cost FROM booking_hotels WHERE booking_id = p_booking_id
        UNION ALL
        SELECT total_cost as cost FROM booking_tours WHERE booking_id = p_booking_id
        UNION ALL
        SELECT cost_price as cost FROM booking_transfers WHERE booking_id = p_booking_id
        UNION ALL
        SELECT cost_price as cost FROM booking_flights WHERE booking_id = p_booking_id
    ) all_services;

    -- Calculate total markup: markup per person × PAX count
    v_total_markup := v_markup_per_person * v_pax_count;

    -- Calculate sell price by adding total markup
    v_total_sell := v_total_cost + v_total_markup;
    v_gross_profit := v_total_sell - v_total_cost;

    UPDATE bookings
    SET total_cost_price = v_total_cost,
        total_sell_price = v_total_sell,
        gross_profit = v_gross_profit
    WHERE id = p_booking_id;
END;
$$ LANGUAGE plpgsql;
