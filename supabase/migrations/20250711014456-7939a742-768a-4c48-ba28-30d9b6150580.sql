-- Add payment tracking columns to transactions table
ALTER TABLE transactions 
ADD COLUMN is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN marked_paid_at TIMESTAMP WITH TIME ZONE;