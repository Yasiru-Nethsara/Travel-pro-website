-- Add vehicle_photos array column
ALTER TABLE driver_profiles
ADD COLUMN IF NOT EXISTS vehicle_photos text[] DEFAULT '{}';

-- Migrate existing vehicle_photo_url to the new array
UPDATE driver_profiles
SET vehicle_photos = ARRAY[vehicle_photo_url]
WHERE vehicle_photo_url IS NOT NULL AND vehicle_photos = '{}';
