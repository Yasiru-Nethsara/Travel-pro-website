/*
  # Create Bookings Table

  1. New Tables
    - `bookings` - Confirmed trip bookings
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `driver_id` (uuid, foreign key to profiles)
      - `driver_bid_id` (uuid, foreign key to driver_bids)
      - `final_price` (numeric)
      - `status` (text: 'confirmed', 'completed', 'cancelled')
      - `pickup_time` (timestamp)
      - `estimated_arrival` (timestamp)
      - `actual_arrival` (timestamp, optional)
      - `rating` (integer, 1-5, optional)
      - `review` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `bookings` table
    - Add policy for travelers and drivers to view their bookings
    - Add policy for travelers to create bookings
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_bid_id uuid NOT NULL REFERENCES driver_bids(id) ON DELETE CASCADE,
  final_price numeric NOT NULL CHECK (final_price > 0),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  pickup_time timestamptz NOT NULL,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  review text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  );

CREATE POLICY "Travelers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = driver_id OR
    EXISTS (
      SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.traveler_id = auth.uid()
    )
  );

CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_status ON bookings(status);