/*
  # Fix Users Table RLS Policies

  ## Problem
  The RLS policies for the `users` table are causing issues because they reference
  `auth.users` in a subquery, which creates a table name conflict with the public.users table.

  ## Solution
  Update the RLS policies to use proper table aliasing and simpler authentication checks.

  ## Changes
  1. Drop existing RLS policies
  2. Create new policies with proper authentication checks
  3. Use auth.jwt() for email comparison to avoid subquery issues
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous read for API" ON users;

-- Create new policies with proper authentication
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- Allow anonymous read for API (for external webhook access)
CREATE POLICY "Allow anonymous read for API"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role has full access"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE users IS 'Central users table with credit balance. Single source of truth for user credits. RLS enabled with email-based authentication.';