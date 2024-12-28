/*
  # Initial schema setup for accounts

  1. New Tables
    - `accounts`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `nickname` (text, nullable)
      - `health_score` (integer)
      - `proxy` (text, nullable)
      - `phone_number` (text, nullable)
      - `account_age` (timestamptz)
      - `status` (text)
      - `api_id` (text, nullable)
      - `api_hash` (text, nullable)
      - `warmup_start_time` (timestamptz, nullable)
      - `warmup_duration_hours` (float)
      - `api_connected` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `user_accounts` (junction table)
      - `user_id` (uuid, foreign key)
      - `account_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create accounts table
CREATE TABLE accounts (
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

-- Enable RLS on accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Create user_accounts junction table
CREATE TABLE user_accounts (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, account_id)
);

-- Enable RLS on user_accounts
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Create accounts trigger
CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

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