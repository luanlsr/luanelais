-- MIGRATION: Add attendance status to confirmations
-- Date: 2026-04-23

ALTER TABLE confirmacoes 
ADD COLUMN IF NOT EXISTS is_attending BOOLEAN DEFAULT TRUE;
