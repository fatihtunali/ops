-- Migration: Add traveler information fields to bookings table
-- Date: 2025-11-07
-- Purpose: Distinguish between billing client (agent/direct) and actual traveler

-- Add traveler information fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS traveler_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS traveler_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS traveler_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS booked_by VARCHAR(20) DEFAULT 'direct' CHECK (booked_by IN ('agent', 'direct'));

-- Add index for filtering by booking source
CREATE INDEX IF NOT EXISTS idx_bookings_booked_by ON bookings(booked_by);

-- Add comments for clarity
COMMENT ON COLUMN bookings.traveler_name IS 'Name of the actual traveler (passenger lead)';
COMMENT ON COLUMN bookings.traveler_email IS 'Email of the actual traveler';
COMMENT ON COLUMN bookings.traveler_phone IS 'Phone of the actual traveler';
COMMENT ON COLUMN bookings.booked_by IS 'Booking source: agent (tour operator) or direct (retail customer)';

-- For existing bookings, set booked_by based on client type
UPDATE bookings b
SET booked_by = c.type
FROM clients c
WHERE b.client_id = c.id
AND b.booked_by IS NULL;

-- For existing bookings, copy client info to traveler info if direct booking
UPDATE bookings b
SET
  traveler_name = c.name,
  traveler_email = c.email,
  traveler_phone = c.phone
FROM clients c
WHERE b.client_id = c.id
AND c.type = 'direct'
AND b.traveler_name IS NULL;

-- Verification query
SELECT
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN booked_by = 'agent' THEN 1 END) as agent_bookings,
  COUNT(CASE WHEN booked_by = 'direct' THEN 1 END) as direct_bookings,
  COUNT(CASE WHEN traveler_name IS NOT NULL THEN 1 END) as bookings_with_traveler_info
FROM bookings;
