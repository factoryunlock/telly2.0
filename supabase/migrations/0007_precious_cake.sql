/*
  # Fix Account Creation Issues

  1. Changes
    - Make username nullable in accounts table
    - Update create_account_with_user function
    - Fix RLS policies

  2. Security
    - Maintain RLS policies
    - Ensure proper user association
*/

-- Make username nullable
ALTER TABLE accounts ALTER COLUMN username DROP NOT NULL;

-- Drop and recreate function with proper handling
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
    NULLIF(p_username, ''),  -- Convert empty string to NULL
    NULLIF(p_proxy, ''),
    NULLIF(p_api_id, ''),
    NULLIF(p_api_hash, ''),
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

-- Ensure RLS is enabled
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper security
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable update for own accounts" ON accounts;
  DROP POLICY IF EXISTS "Enable delete for own accounts" ON accounts;
END $$;

-- Recreate account policies
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