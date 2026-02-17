-- Add missing columns to merchants table for shop registration form
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS owner_id_card VARCHAR(20),
  ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS line_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS open_time VARCHAR(10),
  ADD COLUMN IF NOT EXISTS close_time VARCHAR(10),
  ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
  ADD COLUMN IF NOT EXISTS bank_account_name VARCHAR(200);
