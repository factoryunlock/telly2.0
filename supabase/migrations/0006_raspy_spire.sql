/*
  # Fix Account Creation and RLS Policies

  1. Changes
    - Add phone_number column to accounts table
    - Update account creation function to include phone_number
    - Fix RLS policies for proper account creation flow
    
  2. Security
    - Ensure proper RLS policies for all operations
    - Add security definer function for atomic operations
*/

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE accounts ADD COLUMN phone_number text NOT NULL;
  END IF;
END $$;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_account_with_user;

-- Create improved account creation function
CREATE OR REPLACE FUNCTION create_account_with_user(
  p_phone_number text,
  p_username text,
  p_account_age timestamptz,
  p_proxy text,
  p_api_id text,
  p_api_hash text
) RETURNS uuid AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Create account
  INSERT INTO accounts (
    phone_number,
    username,
    proxy,
    api_id,
    api_hash,
    account_age,
    status,
    health_score,
    api_connected,
    warmup_duration_hours
  ) VALUES (
    p_phone_number,
    p_username,
    p_proxy,
    p_api_id,
    p_api_hash,
    p_account_age,
    'Open',
    100,
    false,
    0
  ) RETURNING id INTO v_account_id;

  -- Create user-account association
  INSERT INTO user_accounts (user_id, account_id)
  VALUES (auth.uid(), v_account_id);

  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable update for own accounts" ON accounts;
  DROP POLICY IF EXISTS "Enable delete for own accounts" ON accounts;
  DROP POLICY IF EXISTS "Enable read own associations" ON user_accounts;
  DROP POLICY IF EXISTS "Enable create own associations" ON user_accounts;
END $$;

-- Recreate policies with proper security
CREATE POLICY "Enable read access for authenticated users"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = id
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert access for authenticated users"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = id
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for own accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = id
      AND user_accounts.user_id = auth.uid()
    )
  );

-- User accounts policies
CREATE POLICY "Enable read own associations"
  ON user_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Enable create own associations"
  ON user_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_account_with_user TO authenticated;