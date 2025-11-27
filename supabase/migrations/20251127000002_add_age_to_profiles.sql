/*
  # Add Age to Profiles

  1. Changes
    - Add `age` column to `profiles` table
*/

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age integer;
