-- ============================================================
-- MIGRATION: Change Default Currency from USD to EUR
-- ============================================================
-- Version: 003
-- Date: 2025-11-07
-- Description: Update all currency defaults to EUR
-- ============================================================

-- Step 1: Update client_payments table default
ALTER TABLE client_payments
ALTER COLUMN currency SET DEFAULT 'EUR';

-- Step 2: Update supplier_payments table default
ALTER TABLE supplier_payments
ALTER COLUMN currency SET DEFAULT 'EUR';

-- Step 3: Update operational_expenses table default
ALTER TABLE operational_expenses
ALTER COLUMN currency SET DEFAULT 'EUR';

-- Step 4: Update existing records (optional - only if you want to change existing data)
-- Uncomment these if you want to change existing USD records to EUR
-- UPDATE client_payments SET currency = 'EUR' WHERE currency = 'USD';
-- UPDATE supplier_payments SET currency = 'EUR' WHERE currency = 'USD';
-- UPDATE operational_expenses SET currency = 'EUR' WHERE currency = 'USD';

-- ============================================================
-- Verification Query
-- ============================================================
-- Check defaults have been updated:
-- SELECT
--   table_name,
--   column_name,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name = 'currency'
--   AND table_name IN ('client_payments', 'supplier_payments', 'operational_expenses');
-- ============================================================
