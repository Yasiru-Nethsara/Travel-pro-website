/*
  # Add vehicle_type to trips table

  1. Changes
    - Add `vehicle_type` column to `trips` table
*/

ALTER TABLE trips ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT 'Car';
