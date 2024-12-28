/*
  # Fix account creation policies

  1. Changes
    - Add policy for user_accounts table to allow inserting user-account associations
    - Fix accounts table policies to properly handle the account creation flow
    - Add policy for authenticated users to read their linked accounts

  2. Security
    - Maintain RLS protection while allowing proper account creation
    - Ensure users can only access their own accounts
    - Allow account creation with proper user association
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can insert accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can view their own user_accounts" ON user_accounts;
  DROP POLICY IF EXISTS "Users can insert their own user_accounts" ON user_accounts;
END $$;

-- Recreate policies for accounts table
CREATE POLICY "Enable read access for authenticated users"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = accounts.id
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert access for authenticated users"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for users based on user_id"
  ON accounts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = accounts.id
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete access for users based on user_id"
  ON accounts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts
      WHERE user_accounts.account_id = accounts.id
      AND user_accounts.user_id = auth.uid()
    )
  );

-- Recreate policies for user_accounts table
CREATE POLICY "Enable read for users based on user_id"
  ON user_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Enable insert for users based on user_id"
  ON user_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;