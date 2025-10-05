/*
  # Migrate to Single Credit System

  ## Overview
  This migration consolidates the dual credit system into a single `users` table.
  Previously, credits were split between `credit_wallets` and `users` tables,
  causing inconsistencies.

  ## Changes
  1. Data Migration
    - Copy all credit data from `credit_wallets` to `users` table
    - Match users by email from profiles table
    - Preserve existing credit balances
    
  2. Update References
    - Update `credit_transactions` to reference `users` table
    - Add user_email field to credit_transactions for easier tracking
    
  3. Cleanup
    - Drop `credit_wallets` table and related policies
    - Remove old trigger that creates credit_wallets
    
  4. Security
    - Update RLS policies for new structure
    - Ensure all access patterns work correctly
*/

-- Step 1: Ensure users table has all necessary data
-- Migrate credit_wallets data to users table
INSERT INTO users (email, credits_balance, created_at, updated_at)
SELECT 
  p.email,
  cw.balance,
  cw.created_at,
  cw.updated_at
FROM credit_wallets cw
JOIN profiles p ON p.id = cw.user_id
ON CONFLICT (email) 
DO UPDATE SET 
  credits_balance = EXCLUDED.credits_balance,
  updated_at = EXCLUDED.updated_at;

-- Step 2: Add user_email to credit_transactions for easier querying
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_transactions' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE credit_transactions ADD COLUMN user_email text;
  END IF;
END $$;

-- Update existing credit_transactions with email
UPDATE credit_transactions ct
SET user_email = p.email
FROM profiles p
WHERE ct.user_id = p.id AND ct.user_email IS NULL;

-- Step 3: Drop old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 4: Create new unified user creation function
CREATE OR REPLACE FUNCTION handle_unified_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user with 10 free credits
  INSERT INTO public.users (email, credits_balance, created_at, updated_at)
  VALUES (
    NEW.email,
    10,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created_unified
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_unified_new_user();

-- Step 5: Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Step 6: Add anon/public policy for API access
CREATE POLICY "Allow anonymous read for API"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Step 7: Drop credit_wallets table and all related objects
DROP TRIGGER IF EXISTS update_credit_wallets_updated_at ON credit_wallets;
DROP POLICY IF EXISTS "Users can read own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Users can insert own wallet" ON credit_wallets;
DROP POLICY IF EXISTS "Service role can insert wallets" ON credit_wallets;

-- Make wallet_id nullable in credit_transactions (for backward compatibility)
ALTER TABLE credit_transactions ALTER COLUMN wallet_id DROP NOT NULL;

-- Drop the credit_wallets table
DROP TABLE IF EXISTS credit_wallets CASCADE;

-- Step 8: Create index on user_email in credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_email ON credit_transactions(user_email);

-- Step 9: Add helpful comment
COMMENT ON TABLE users IS 'Central users table with credit balance. This is the single source of truth for user credits.';