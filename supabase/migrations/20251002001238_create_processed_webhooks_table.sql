/*
  # Create processed_webhooks table for webhook idempotency
  
  1. New Tables
    - `processed_webhooks`
      - `id` (uuid, primary key)
      - `event_key` (text, unique) - Unique identifier for webhook event
      - `processed_at` (timestamptz) - When the webhook was processed
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `processed_webhooks` table
    - Add policy for service role to manage webhooks
  
  3. Purpose
    - Prevents duplicate webhook processing (idempotency)
    - Stores unique event keys from Gumroad webhooks
*/

CREATE TABLE IF NOT EXISTS processed_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text UNIQUE NOT NULL,
  processed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Service role can manage all webhook records
CREATE POLICY "Service role can manage webhooks"
  ON processed_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_event_key 
  ON processed_webhooks(event_key);