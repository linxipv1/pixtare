/*
  # Fix New User Trigger - Column Names

  1. Updates
    - Fixes column names in trigger to match actual credit_ledger table
    - Uses: delta (not amount), reason (not description), ref (not transaction_type)
    
  2. Security
    - SECURITY DEFINER ensures function has necessary permissions
*/

-- Drop and recreate the trigger function with correct column names
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

  -- Record the welcome credits in ledger with correct column names
  INSERT INTO public.credit_ledger (
    user_id,
    delta,
    reason,
    ref,
    created_at
  )
  VALUES (
    NEW.id,
    10,
    'Hoş geldiniz! 10 ücretsiz kredi',
    'welcome_bonus',
    NOW()
  );

  RETURN NEW;
END;
$$;
