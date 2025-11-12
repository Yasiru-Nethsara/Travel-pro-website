/*
  # Create Trips Table

  1. New Tables
    - `trips` - Trip postings by travelers
      - `id` (uuid, primary key)
      - `traveler_id` (uuid, foreign key to profiles)
      - `origin` (text)
      - `origin_lat` (numeric)
      - `origin_lng` (numeric)
      - `destination` (text)
      - `destination_lat` (numeric)
      - `destination_lng` (numeric)
      - `departure_date` (timestamp)
      - `seats_needed` (integer)
      - `max_price` (numeric)
      - `status` (text: 'open', 'booked', 'cancelled')
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `trips` table
    - Add policy for travelers to view their own trips
    - Add policy for drivers to view available trips
    - Add policy for travelers to create trips
    - Add policy for travelers to update their own trips
*/

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin text NOT NULL,
  origin_lat numeric,
  origin_lng numeric,
  destination text NOT NULL,
  destination_lat numeric,
  destination_lng numeric,
  departure_date timestamptz NOT NULL,
  seats_needed integer NOT NULL CHECK (seats_needed > 0),
  max_price numeric NOT NULL CHECK (max_price > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'booked', 'cancelled')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travelers can create trips"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Users can view all open trips"
  ON trips FOR SELECT
  TO authenticated
  USING (status = 'open' OR auth.uid() = traveler_id);

CREATE POLICY "Travelers can update their own trips"
  ON trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = traveler_id)
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Travelers can delete their own trips"
  ON trips FOR DELETE
  TO authenticated
  USING (auth.uid() = traveler_id);

CREATE INDEX idx_trips_traveler_id ON trips(traveler_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure_date ON trips(departure_date);