/*
  # Fix RLS policies for account creation

  1. Changes
    - Drop and recreate RLS policies with correct permissions
    - Add policy for user_accounts table insertion
    - Ensure authenticated users can create accounts
  
  2. Security
    - Maintain RLS protection while allowing proper access
    - Users can only access their own accounts
    - Users can create new accounts and link them
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can view their own user_accounts" ON user_accounts;
  DROP POLICY IF EXISTS "Users can insert their own user_accounts" ON user_accounts;
END $$;

-- Recreate policies for accounts table
CREATE POLICY "Users can view their own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts 
      WHERE user_accounts.account_id = accounts.id 
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts 
      WHERE user_accounts.account_id = accounts.id 
      AND user_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_accounts 
      WHERE user_accounts.account_id = accounts.id 
      AND user_accounts.user_id = auth.uid()
    )
  );

-- Recreate policies for user_accounts table
CREATE POLICY "Users can view their own user_accounts"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own user_accounts"
  ON user_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());