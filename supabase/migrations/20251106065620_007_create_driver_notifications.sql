/*
  # Create Driver Notifications Table

  1. New Tables
    - `driver_notifications` - Notifications sent to drivers about new trips
      - `id` (uuid, primary key)
      - `driver_id` (uuid, foreign key to profiles)
      - `trip_id` (uuid, foreign key to trips)
      - `trip_details` (jsonb) - Cached trip info
      - `vehicle_match` (text)
      - `status` (text: 'unread', 'read', 'archived')
      - `created_at` (timestamp)
      - `read_at` (timestamp)
  
  2. Security
    - Enable RLS on `driver_notifications` table
    - Add policy for drivers to view their own notifications
*/

CREATE TABLE IF NOT EXISTS driver_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_details jsonb NOT NULL,
  vehicle_match text,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

ALTER TABLE driver_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own notifications"
  ON driver_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own notifications"
  ON driver_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "System can insert notifications"
  ON driver_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX idx_driver_notifications_driver_id ON driver_notifications(driver_id);
CREATE INDEX idx_driver_notifications_trip_id ON driver_notifications(trip_id);
CREATE INDEX idx_driver_notifications_status ON driver_notifications(status);
CREATE INDEX idx_driver_notifications_created_at ON driver_notifications(created_at DESC);