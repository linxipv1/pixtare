/*
  # Fix Users RLS Policies - Use ID Instead of Email

  1. Updates
    - Drops old email-based RLS policies
    - Creates new ID-based RLS policies
    - Users can read and update their own data using auth.uid()
    
  2. Security
    - Authenticated users can only access their own records
    - Service role maintains full access
*/

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create new ID-based policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
