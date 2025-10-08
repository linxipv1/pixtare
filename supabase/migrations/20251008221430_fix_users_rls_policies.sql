/*
  # Fix Users Table RLS Policies

  1. Problem
    - Current RLS policies use email-based matching
    - Should use auth.uid() for proper user identification
    
  2. Changes
    - Drop old email-based policies
    - Create new auth.uid()-based policies
    - Ensure proper access control for authenticated users
    
  3. Security
    - Users can only read/update their own data using auth.uid()
    - Service role maintains full access
    - Anonymous users have no direct access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read for API" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies using auth.uid()
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role policy already exists, no need to recreate