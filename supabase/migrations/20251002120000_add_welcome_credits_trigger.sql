/*
  # Add Welcome Credits Trigger

  1. Changes
    - Creates a trigger function that automatically gives 10 free trial credits to new users
    - Trigger fires after INSERT on auth.users table
    - Credits are added to the users table
    - Transaction is logged in credit_ledger

  2. Security
    - Trigger runs with SECURITY DEFINER privileges
    - Only fires on INSERT events
    - Prevents duplicate credits with ON CONFLICT handling
*/

-- Create trigger function to assign welcome credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new user with 10 trial credits
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
    10,
    'trial',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Log the welcome credits in ledger
  INSERT INTO public.credit_ledger (
    user_id,
    delta,
    reason,
    ref
  )
  VALUES (
    NEW.id,
    10,
    'welcome_bonus',
    'trial_signup'
  );

  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
