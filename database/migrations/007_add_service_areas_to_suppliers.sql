-- Add service_areas column to tour_suppliers table to track which cities they operate in
ALTER TABLE tour_suppliers
ADD COLUMN service_areas TEXT;

COMMENT ON COLUMN tour_suppliers.service_areas IS 'Comma-separated list of cities/areas where the supplier operates (e.g., "Antalya, Istanbul, Cappadocia")';
