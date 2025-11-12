/*
  # Create Driver Bids Table

  1. New Tables
    - `driver_bids` - Bids from drivers for trips
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `driver_id` (uuid, foreign key to profiles)
      - `bid_amount` (numeric)
      - `vehicle_type` (text)
      - `license_plate` (text)
      - `vehicle_color` (text)
      - `status` (text: 'pending', 'accepted', 'rejected', 'cancelled')
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `driver_bids` table
    - Add policy for drivers to create bids
    - Add policy for travelers to view bids on their trips
    - Add policy for drivers to view their own bids
*/

CREATE TABLE IF NOT EXISTS driver_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL CHECK (bid_amount > 0),
  vehicle_type text NOT NULL,
  license_plate text NOT NULL,
  vehicle_color text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, driver_id)
);

ALTER TABLE driver_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can create bids"
  ON driver_bids FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = driver_id AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'driver'
    )
  );

CREATE POLICY "Travelers can view bids on their trips"
  ON driver_bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
    OR auth.uid() = driver_id
  );

CREATE POLICY "Drivers can view their own bids"
  ON driver_bids FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own bids"
  ON driver_bids FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Travelers can accept or reject bids"
  ON driver_bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  );

CREATE INDEX idx_driver_bids_trip_id ON driver_bids(trip_id);
CREATE INDEX idx_driver_bids_driver_id ON driver_bids(driver_id);
CREATE INDEX idx_driver_bids_status ON driver_bids(status);