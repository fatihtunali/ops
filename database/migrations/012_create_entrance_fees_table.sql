-- Create entrance fees table for managing sightseeing attraction tickets
CREATE TABLE IF NOT EXISTS entrance_fees (
    id SERIAL PRIMARY KEY,
    attraction_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    season_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    adult_rate DECIMAL(10, 2) NOT NULL,
    child_rate DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_entrance_fee UNIQUE (attraction_name, city, season_name, start_date, end_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_entrance_fees_city ON entrance_fees(city);
CREATE INDEX IF NOT EXISTS idx_entrance_fees_active ON entrance_fees(is_active);
CREATE INDEX IF NOT EXISTS idx_entrance_fees_dates ON entrance_fees(start_date, end_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_entrance_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entrance_fees_updated_at
    BEFORE UPDATE ON entrance_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_entrance_fees_updated_at();
