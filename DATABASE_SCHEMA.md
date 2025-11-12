# TripConnect Database Schema

## Entity Relationship Diagram

```
profiles
├── driver_profiles (1:1)
├── trips (1:many) as traveler
├── driver_bids (1:many) as driver
├── bookings (1:many) as driver
└── messages (1:many) as sender/receiver

trips
├── driver_bids (1:many)
├── bookings (1:1)
└── messages (many:many) via booking

driver_bids
└── bookings (1:1)

bookings
└── messages (1:many)

messages
└── (connections via sender_id, receiver_id, booking_id)
```

## Complete Schema

### profiles
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  avatar_url text,
  user_type text NOT NULL CHECK (user_type IN ('traveler', 'driver')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### driver_profiles
```sql
CREATE TABLE driver_profiles (
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
```

### trips
```sql
CREATE TABLE trips (
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

CREATE INDEX idx_trips_traveler_id ON trips(traveler_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure_date ON trips(departure_date);
```

### driver_bids
```sql
CREATE TABLE driver_bids (
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

CREATE INDEX idx_driver_bids_trip_id ON driver_bids(trip_id);
CREATE INDEX idx_driver_bids_driver_id ON driver_bids(driver_id);
CREATE INDEX idx_driver_bids_status ON driver_bids(status);
```

### bookings
```sql
CREATE TABLE bookings (
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

CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### messages
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## Data Types Reference

- `uuid` - Unique identifier
- `text` - Variable-length string
- `numeric` - Decimal number
- `integer` - Whole number
- `boolean` - True/False
- `timestamptz` - Date and time with timezone

## Common Queries

### Get all open trips
```sql
SELECT * FROM trips WHERE status = 'open' ORDER BY departure_date ASC;
```

### Get driver's bids
```sql
SELECT * FROM driver_bids WHERE driver_id = 'user-id' ORDER BY created_at DESC;
```

### Get trip with all bids
```sql
SELECT trips.*,
       json_agg(driver_bids.*) as bids
FROM trips
LEFT JOIN driver_bids ON trips.id = driver_bids.trip_id
WHERE trips.id = 'trip-id'
GROUP BY trips.id;
```

### Get user's conversations
```sql
SELECT DISTINCT
  CASE
    WHEN sender_id = 'user-id' THEN receiver_id
    ELSE sender_id
  END as other_user_id
FROM messages
WHERE sender_id = 'user-id' OR receiver_id = 'user-id'
ORDER BY created_at DESC;
```

## Migrations History

1. **001_create_users_and_profiles** - User profiles table
2. **002_create_trips** - Trip postings
3. **003_create_driver_bids** - Driver bid system
4. **004_create_bookings** - Booking management
5. **005_create_driver_profiles** - Extended driver info
6. **006_create_messages** - Chat messaging

## Performance Tips

1. Use indexed columns in WHERE clauses
2. Limit results with LIMIT and OFFSET
3. Select only needed columns
4. Use appropriate WHERE conditions
5. Consider materialized views for complex queries

## Backup & Recovery

Supabase automatically:
- Backs up daily
- Retains backups for 7 days
- Provides point-in-time recovery

For manual backups, export via Supabase dashboard.

## Data Retention

- Messages: Retained indefinitely
- Bookings: Retained indefinitely
- Trips: Retained indefinitely (status = 'cancelled' kept for history)
- User data: Deleted 30 days after account deletion (via auth.users cascade)
