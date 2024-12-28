/*
  # Fix account creation with proper transaction handling

  1. Changes
    - Add function to handle account creation in a single transaction
    - Update RLS policies to properly handle the account creation flow
    - Ensure user-account association is created atomically

  2. Security
    - Maintain RLS protection while allowing proper account creation
    - Ensure atomic operations for account creation
*/

-- Create function for atomic account creation
CREATE OR REPLACE FUNCTION create_account_with_user(
  p_user_id uuid,
  p_username text,
  p_nickname text,
  p_proxy text,
  p_api_id text,
  p_api_hash text
) RETURNS uuid AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Create account
  INSERT INTO accounts (
    username,
    nickname,
    proxy,
    api_id,
    api_hash,
    account_age,
    status,
    health_score,
    api_connected,
    warmup_duration_hours
  ) VALUES (
    p_username,
    p_nickname,
    p_proxy,
    p_api_id,
    p_api_hash,
    CURRENT_TIMESTAMP,
    'Open',
    100,
    false,
    0
  ) RETURNING id INTO v_account_id;

  -- Create user-account association
  INSERT INTO user_accounts (user_id, account_id)
  VALUES (p_user_id, v_account_id);

  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON accounts;
  DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON accounts;
  DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON accounts;
  DROP POLICY IF EXISTS "Enable read for users based on user_id" ON user_accounts;
  DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_accounts;
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