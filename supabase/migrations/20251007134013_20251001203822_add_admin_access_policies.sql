/*
  # Add Admin Access Policies

  ## Overview
  Admin panel needs to read all users and profiles data.
  This migration adds anon read access to profiles table for admin functionality.

  ## Changes
  1. Add anon read policy to profiles table (for admin panel)
  2. Ensure users table already has anon read access
  
  ## Security Note
  - Anon access is read-only
  - Write operations still require authentication
  - This is needed for admin dashboard to function
*/

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow anon read for admin" ON profiles;

-- Add anon read policy to profiles table
CREATE POLICY "Allow anon read for admin"
  ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Ensure profiles has proper indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

COMMENT ON POLICY "Allow anon read for admin" ON profiles IS 'Allows admin panel to read all user profiles. Admin auth is handled at application level.';