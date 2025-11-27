/*
  # Add Vehicle Details to Driver Profiles

  1. Changes
    - Add `vehicle_photo_url` column to `driver_profiles` table
    - Add `vehicle_description` column to `driver_profiles` table

  2. Storage
    - Create `vehicle-photos` bucket for storing vehicle images
    - Add policies for public read access
    - Add policies for authenticated driver upload access
*/

-- Add new columns to driver_profiles
ALTER TABLE driver_profiles 
ADD COLUMN IF NOT EXISTS vehicle_photo_url text,
ADD COLUMN IF NOT EXISTS vehicle_description text;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-photos', 'vehicle-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public read access to vehicle photos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vehicle-photos' );

-- Allow authenticated drivers to upload their own vehicle photos
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow drivers to update their own photos
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow drivers to delete their own photos
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
