-- Migration: Add service areas to guides and create guide rates table

-- Add service_areas column to guides table
ALTER TABLE guides
ADD COLUMN IF NOT EXISTS service_areas TEXT;

COMMENT ON COLUMN guides.service_areas IS 'Comma-separated list of cities/areas where the guide operates';

-- Create guide_rates table for guide pricing
CREATE TABLE IF NOT EXISTS guide_rates (
    id SERIAL PRIMARY KEY,

    -- Guide Information
    guide_id INTEGER NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    guide_name VARCHAR(255),

    -- City/Location
    city VARCHAR(100),

    -- Season Information
    season_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Currency
    currency VARCHAR(10) DEFAULT 'EUR',

    -- Pricing Structure
    daily_rate DECIMAL(10, 2), -- Full day guiding rate
    night_rate DECIMAL(10, 2), -- Night shift/evening rate
    transfer_rate DECIMAL(10, 2), -- Transfer/airport pickup rate
    package_rate_per_day DECIMAL(10, 2), -- Package tour rate per day

    -- Additional Information
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure no duplicate rates for same guide, city, season combination
    CONSTRAINT unique_guide_rate UNIQUE (guide_id, city, season_name, start_date, end_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_guide_rates_guide ON guide_rates(guide_id);
CREATE INDEX idx_guide_rates_city ON guide_rates(city);
CREATE INDEX idx_guide_rates_season ON guide_rates(season_name);
CREATE INDEX idx_guide_rates_dates ON guide_rates(start_date, end_date);

-- Add comments
COMMENT ON TABLE guide_rates IS 'Stores seasonal pricing information for tour guides';
COMMENT ON COLUMN guide_rates.daily_rate IS 'Full day guiding rate';
COMMENT ON COLUMN guide_rates.night_rate IS 'Night shift or evening rate';
COMMENT ON COLUMN guide_rates.transfer_rate IS 'Transfer or airport pickup/dropoff rate';
COMMENT ON COLUMN guide_rates.package_rate_per_day IS 'Package tour rate per day for multi-day tours';
