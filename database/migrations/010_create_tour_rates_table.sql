-- Migration: Create tour_rates table for tour supplier pricing
-- This table stores pricing information for different tours offered by suppliers

CREATE TABLE IF NOT EXISTS tour_rates (
    id SERIAL PRIMARY KEY,

    -- Tour Information
    tour_code VARCHAR(50) NOT NULL,
    tour_name VARCHAR(255) NOT NULL,

    -- Supplier Information
    supplier_id INTEGER NOT NULL REFERENCES tour_suppliers(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255),

    -- City/Location
    city VARCHAR(100),

    -- Season Information
    season_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Currency
    currency VARCHAR(10) DEFAULT 'EUR',

    -- Pricing Structure
    sic_rate DECIMAL(10, 2), -- Seat-In-Coach (group tour) rate per person
    private_2pax_rate DECIMAL(10, 2), -- Private tour rate per person for 2 pax
    private_4pax_rate DECIMAL(10, 2), -- Private tour rate per person for 4 pax
    private_6pax_rate DECIMAL(10, 2), -- Private tour rate per person for 6 pax
    private_8pax_rate DECIMAL(10, 2), -- Private tour rate per person for 8 pax
    private_10pax_rate DECIMAL(10, 2), -- Private tour rate per person for 10 pax

    -- Additional Information
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure no duplicate rates for same tour, supplier, season combination
    CONSTRAINT unique_tour_rate UNIQUE (tour_code, supplier_id, season_name, start_date, end_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_tour_rates_supplier ON tour_rates(supplier_id);
CREATE INDEX idx_tour_rates_tour_code ON tour_rates(tour_code);
CREATE INDEX idx_tour_rates_city ON tour_rates(city);
CREATE INDEX idx_tour_rates_season ON tour_rates(season_name);
CREATE INDEX idx_tour_rates_dates ON tour_rates(start_date, end_date);

-- Add comments
COMMENT ON TABLE tour_rates IS 'Stores pricing information for tours offered by suppliers';
COMMENT ON COLUMN tour_rates.tour_code IS 'Unique code identifier for the tour (e.g., IST-01, CAP-02)';
COMMENT ON COLUMN tour_rates.tour_name IS 'Name/description of the tour (e.g., Istanbul City Tour, Cappadocia Full Day)';
COMMENT ON COLUMN tour_rates.sic_rate IS 'Seat-In-Coach (group tour) rate per person';
COMMENT ON COLUMN tour_rates.private_2pax_rate IS 'Private tour rate per person for 2 passengers';
COMMENT ON COLUMN tour_rates.private_4pax_rate IS 'Private tour rate per person for 4 passengers';
COMMENT ON COLUMN tour_rates.private_6pax_rate IS 'Private tour rate per person for 6 passengers';
COMMENT ON COLUMN tour_rates.private_8pax_rate IS 'Private tour rate per person for 8 passengers';
COMMENT ON COLUMN tour_rates.private_10pax_rate IS 'Private tour rate per person for 10 passengers';
