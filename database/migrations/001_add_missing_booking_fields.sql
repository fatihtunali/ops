-- Migration: Add missing fields to bookings table
-- Date: 2025-11-07
-- Description: Backend and frontend code reference fields that don't exist in database

-- Add missing fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS traveler_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS traveler_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS traveler_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS booked_by VARCHAR(20) DEFAULT 'direct';

-- Add constraint for booked_by field
ALTER TABLE bookings
ADD CONSTRAINT chk_booked_by CHECK (booked_by IN ('agent', 'direct'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_booked_by ON bookings(booked_by);

-- Add comments for documentation
COMMENT ON COLUMN bookings.traveler_name IS 'Name of the actual traveler (for agent bookings)';
COMMENT ON COLUMN bookings.traveler_email IS 'Email of the actual traveler (for agent bookings)';
COMMENT ON COLUMN bookings.traveler_phone IS 'Phone of the actual traveler (for agent bookings)';
COMMENT ON COLUMN bookings.booked_by IS 'Booking source: agent (through travel agent) or direct (direct customer)';
