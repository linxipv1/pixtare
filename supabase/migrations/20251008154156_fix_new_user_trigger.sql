/*
  # Fix New User Registration Trigger

  1. Updates
    - Drops old trigger function that references non-existent tables
    - Creates new trigger function for current schema (users, credit_ledger)
    - Automatically creates user record with 10 welcome credits
    
  2. Security
    - SECURITY DEFINER ensures function has necessary permissions
    - Trigger runs automatically on auth.users INSERT
*/

-- Drop the old trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create new trigger function for current schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create user record in public.users table
  INSERT INTO public.users (
    id,
    email,
    credits_balance,
    plan_code,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    10, -- 10 welcome credits
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Record the welcome credits in ledger
  INSERT INTO public.credit_ledger (
    user_id,
    amount,
    transaction_type,
    description,
    created_at
  )
  VALUES (
    NEW.id,
    10,
    'purchase',
    'Hoş geldiniz! 10 ücretsiz kredi',
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
