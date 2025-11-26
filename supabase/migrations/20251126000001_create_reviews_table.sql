/*
  # Create Reviews Table and Rating Trigger

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `trip_id` (uuid, foreign key to trips)
      - `reviewer_id` (uuid, foreign key to profiles)
      - `reviewee_id` (uuid, foreign key to profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for travelers to create reviews
    - Add policy for everyone to read reviews

  3. Triggers
    - Create function `update_driver_rating()`
    - Create trigger to update `driver_profiles.average_rating` and `total_trips` on review insert
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Travelers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
  count_reviews integer;
BEGIN
  -- Calculate new average and count for the driver (reviewee)
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, count_reviews
  FROM reviews
  WHERE reviewee_id = NEW.reviewee_id;

  -- Update driver profile
  UPDATE driver_profiles
  SET 
    average_rating = ROUND(COALESCE(avg_rating, 0), 1),
    total_trips = count_reviews -- Assuming 1 review per trip, this tracks completed rated trips
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_rating();
