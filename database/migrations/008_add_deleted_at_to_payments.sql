-- Migration: Add deleted_at column to payment tables for soft delete functionality
-- Date: 2025-11-08
-- Description: Adds deleted_at timestamp column to client_payments and supplier_payments tables

-- Add deleted_at column to client_payments table
ALTER TABLE client_payments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add index for better query performance when filtering out deleted records
CREATE INDEX IF NOT EXISTS idx_client_payments_deleted_at ON client_payments(deleted_at);

-- Add deleted_at column to supplier_payments table
ALTER TABLE supplier_payments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;

-- Add index for better query performance when filtering out deleted records
CREATE INDEX IF NOT EXISTS idx_supplier_payments_deleted_at ON supplier_payments(deleted_at);

-- Add comment to document the soft delete pattern
COMMENT ON COLUMN client_payments.deleted_at IS 'Timestamp when the payment was soft deleted. NULL means active.';
COMMENT ON COLUMN supplier_payments.deleted_at IS 'Timestamp when the payment was soft deleted. NULL means active.';
