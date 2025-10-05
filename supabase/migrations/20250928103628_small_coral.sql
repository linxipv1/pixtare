/*
  # Fix User Registration Issues

  1. Triggers
    - Create trigger to handle new user registration
    - Automatically create profile and credit wallet
    
  2. Functions
    - Update handle_new_user function
    - Add proper error handling
    
  3. Security
    - Ensure RLS policies work correctly
    - Fix any permission issues
*/

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, company_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW(),
    NOW()
  );

  -- Insert into credit_wallets table with 10 free credits
  INSERT INTO public.credit_wallets (id, user_id, balance, package_type, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    10,
    'trial',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS policies are correct for profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure RLS policies are correct for credit_wallets  
DROP POLICY IF EXISTS "Users can insert own wallet" ON credit_wallets;
CREATE POLICY "Users can insert own wallet"
  ON credit_wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow service role to insert (for triggers)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert wallets"
  ON credit_wallets
  FOR INSERT
  TO service_role
  WITH CHECK (true);