/*
  # Create Driver Profiles Table

  1. New Tables
    - `driver_profiles` - Extended information for drivers
      - `id` (uuid, primary key, links to profiles)
      - `license_number` (text)
      - `vehicle_type` (text)
      - `vehicle_model` (text)
      - `vehicle_color` (text)
      - `license_plate` (text)
      - `insurance_expires_at` (timestamp)
      - `total_trips` (integer)
      - `average_rating` (numeric)
      - `is_verified` (boolean)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `driver_profiles` table
    - Add policy for drivers to read and update their profile
*/

CREATE TABLE IF NOT EXISTS driver_profiles (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text UNIQUE,
  vehicle_type text,
  vehicle_model text,
  vehicle_color text,
  license_plate text,
  insurance_expires_at timestamptz,
  total_trips integer DEFAULT 0,
  average_rating numeric DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  is_verified boolean DEFAULT false,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can read their own profile"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public can view driver profiles"
  ON driver_profiles FOR SELECT
  USING (true);

CREATE POLICY "Drivers can update their own profile"
  ON driver_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Drivers can create their profile"
  ON driver_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);