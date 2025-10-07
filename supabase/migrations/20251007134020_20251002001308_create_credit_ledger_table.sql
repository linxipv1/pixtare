/*
  # Create credit_ledger table for tracking credit movements
  
  1. New Tables
    - `credit_ledger`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `delta` (integer) - Credit change amount (positive or negative)
      - `reason` (text) - Reason for credit change
      - `ref` (text) - Reference identifier (e.g., product slug, transaction id)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `credit_ledger` table
    - Users can view their own ledger entries
    - Service role can insert entries
  
  3. Purpose
    - Track all credit movements for audit and history
    - Support Gumroad webhook credit assignments
*/

CREATE TABLE IF NOT EXISTS credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- Users can view their own ledger entries
CREATE POLICY "Users can view own ledger"
  ON credit_ledger
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert ledger entries
CREATE POLICY "Service role can insert ledger"
  ON credit_ledger
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_id 
  ON credit_ledger(user_id);

-- Create index for created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_credit_ledger_created_at 
  ON credit_ledger(created_at DESC);