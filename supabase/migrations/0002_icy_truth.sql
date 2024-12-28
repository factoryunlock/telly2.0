/*
  # Update Accounts Schema

  1. Changes
    - Add accounts table if not exists
    - Add user_accounts table if not exists
    - Enable RLS on both tables
    - Add policies for authenticated users

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their accounts
    - Add policies for user-account relationships
*/

-- Create accounts table if not exists
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  nickname text,
  health_score integer NOT NULL DEFAULT 0,
  proxy text,
  phone_number text,
  account_age timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('Warming Up', 'Open', 'Limited')),
  api_id text,
  api_hash text,
  warmup_start_time timestamptz,
  warmup_duration_hours float NOT NULL DEFAULT 0,
  api_connected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on accounts if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'accounts'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create user_accounts junction table if not exists
CREATE TABLE IF NOT EXISTS user_accounts (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, account_id)
);

-- Enable RLS on user_accounts if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_accounts'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  -- Drop existing policies for accounts
  DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can insert their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
  DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
  
  -- Drop existing policies for user_accounts
  DROP POLICY IF EXISTS "Users can view their own user_accounts" ON user_accounts;
  DROP POLICY IF EXISTS "Users can insert their own user_accounts" ON user_accounts;
END $$;

-- Create policies for accounts
CREATE POLICY "Users can view their own accounts"
  ON accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_accounts WHERE account_id = id
  ));

CREATE POLICY "Users can insert their own accounts"
  ON accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own accounts"
  ON accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_accounts WHERE account_id = id
  ));

CREATE POLICY "Users can delete their own accounts"
  ON accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT user_id FROM user_accounts WHERE account_id = id
  ));

-- Create policies for user_accounts
CREATE POLICY "Users can view their own user_accounts"
  ON user_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user_accounts"
  ON user_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);