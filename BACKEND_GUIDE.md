# TripConnect Backend Guide

## Overview

TripConnect uses Supabase as its backend infrastructure, providing:
- Authentication & user management
- PostgreSQL database with Row Level Security
- Real-time features
- Edge Functions for API endpoints
- File storage

## Database Schema

### Tables

#### 1. profiles
User profile information for both travelers and drivers.

**Columns:**
- `id` (uuid, primary key) - References auth.users
- `full_name` (text)
- `email` (text, unique)
- `phone` (text)
- `avatar_url` (text)
- `user_type` (text) - 'traveler' or 'driver'
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### 2. driver_profiles
Extended profile information for drivers only.

**Columns:**
- `id` (uuid, primary key) - References profiles
- `license_number` (text, unique)
- `vehicle_type` (text)
- `vehicle_model` (text)
- `vehicle_color` (text)
- `license_plate` (text)
- `insurance_expires_at` (timestamptz)
- `total_trips` (integer)
- `average_rating` (numeric)
- `is_verified` (boolean)
- `bio` (text)

#### 3. trips
Trip postings created by travelers.

**Columns:**
- `id` (uuid, primary key)
- `traveler_id` (uuid, foreign key)
- `origin` (text)
- `origin_lat` (numeric)
- `origin_lng` (numeric)
- `destination` (text)
- `destination_lat` (numeric)
- `destination_lng` (numeric)
- `departure_date` (timestamptz)
- `seats_needed` (integer)
- `max_price` (numeric)
- `status` (text) - 'open', 'booked', or 'cancelled'
- `description` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Indexes:**
- traveler_id
- status
- departure_date

#### 4. driver_bids
Bids submitted by drivers for trips.

**Columns:**
- `id` (uuid, primary key)
- `trip_id` (uuid, foreign key)
- `driver_id` (uuid, foreign key)
- `bid_amount` (numeric)
- `vehicle_type` (text)
- `license_plate` (text)
- `vehicle_color` (text)
- `status` (text) - 'pending', 'accepted', 'rejected', or 'cancelled'
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Constraints:**
- UNIQUE(trip_id, driver_id) - One bid per driver per trip

**Indexes:**
- trip_id
- driver_id
- status

#### 5. bookings
Confirmed trip bookings.

**Columns:**
- `id` (uuid, primary key)
- `trip_id` (uuid, foreign key)
- `driver_id` (uuid, foreign key)
- `driver_bid_id` (uuid, foreign key)
- `final_price` (numeric)
- `status` (text) - 'confirmed', 'completed', or 'cancelled'
- `pickup_time` (timestamptz)
- `estimated_arrival` (timestamptz)
- `actual_arrival` (timestamptz)
- `rating` (integer, 1-5)
- `review` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Constraints:**
- UNIQUE(trip_id) - One booking per trip

**Indexes:**
- trip_id
- driver_id
- status

#### 6. messages
Chat messages between travelers and drivers.

**Columns:**
- `id` (uuid, primary key)
- `booking_id` (uuid, foreign key)
- `sender_id` (uuid, foreign key)
- `receiver_id` (uuid, foreign key)
- `content` (text)
- `is_read` (boolean)
- `created_at` (timestamptz)

**Indexes:**
- booking_id
- sender_id
- receiver_id
- created_at

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### profiles
- Users can read and update their own profile
- Public can't view profiles (except drivers' public info)

### trips
- Travelers can create and manage their own trips
- All authenticated users can view open trips
- Travelers can delete their own trips

### driver_bids
- Drivers can create bids (only if verified as driver)
- Travelers can view bids on their trips
- Drivers can view their own bids
- Travelers can accept/reject bids on their trips

### bookings
- Only trip participants can view bookings
- Travelers can create bookings
- Both parties can update bookings

### messages
- Only message participants can view
- Authenticated users can create messages
- Receivers can mark as read

## Edge Functions

All edge functions are deployed to Supabase and are accessible via HTTP requests with JWT authentication.

### GET /get-trips
Get available trips with optional filtering.

**Query Parameters:**
- `status` - Filter by status (default: 'open')
- `limit` - Results per page (default: 10)
- `offset` - Pagination offset (default: 0)

**Response:**
```typescript
{
  data: Trip[]
}
```

### POST /create-trip
Create a new trip (traveler only).

**Request Body:**
```typescript
{
  origin: string;
  origin_lat: number;
  origin_lng: number;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  departure_date: string; // ISO 8601
  seats_needed: number;
  max_price: number;
  description?: string;
}
```

**Response:**
```typescript
{
  data: Trip
}
```

### POST /submit-bid
Submit a bid for a trip (driver only).

**Request Body:**
```typescript
{
  trip_id: string;
  bid_amount: number;
  vehicle_type: string;
  license_plate: string;
  vehicle_color?: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  data: DriverBid
}
```

### POST /accept-bid
Accept a bid and create a booking (traveler only).

**Request Body:**
```typescript
{
  bid_id: string;
  pickup_time: string; // ISO 8601
}
```

**Response:**
```typescript
{
  data: {
    bid: DriverBid;
    booking: Booking;
  }
}
```

### GET /get-my-trips
Get trips created by the authenticated user.

**Query Parameters:**
- `limit` - Results per page (default: 10)
- `offset` - Pagination offset (default: 0)

**Response:**
```typescript
{
  data: Trip[]
}
```

### GET /get-my-bids
Get bids submitted by the authenticated driver.

**Query Parameters:**
- `status` - Filter by status (optional)
- `limit` - Results per page (default: 10)
- `offset` - Pagination offset (default: 0)

**Response:**
```typescript
{
  data: DriverBid[]
}
```

## API Functions

Located in `src/lib/api.ts`:

```typescript
// Get available trips
getTrips(status?: string, limit?: number, offset?: number): Promise<Trip[]>

// Create a new trip
createTrip(payload: CreateTripPayload): Promise<Trip>

// Get user's trips
getMyTrips(limit?: number, offset?: number): Promise<Trip[]>

// Submit a bid
submitBid(payload: SubmitBidPayload): Promise<DriverBid>

// Get user's bids
getMyBids(status?: string, limit?: number, offset?: number): Promise<DriverBid[]>

// Accept a bid
acceptBid(payload: AcceptBidPayload): Promise<{ bid: DriverBid; booking: Booking }>

// Reject a bid
rejectBid(bidId: string): Promise<void>

// Get user profile
getProfile(): Promise<Profile | null>

// Update user profile
updateProfile(payload: Partial<Profile>): Promise<Profile>

// Get user's bookings
getMyBookings(): Promise<Booking[]>

// Send a message
sendMessage(receiverId: string, content: string, bookingId?: string): Promise<void>

// Get conversation with user
getConversation(userId: string, bookingId?: string): Promise<Message[]>
```

## Authentication

Located in `src/lib/auth.ts`:

```typescript
// Sign up new user
signUp(email: string, password: string, fullName: string, userType: 'traveler' | 'driver'): Promise<any>

// Sign in existing user
signIn(email: string, password: string): Promise<any>

// Sign out current user
signOut(): Promise<void>

// Get current authenticated user
getCurrentUser(): Promise<User | null>

// Get current user's profile
getCurrentProfile(): Promise<Profile | null>

// Listen to auth state changes
onAuthStateChange(callback: (user: any) => void): Subscription
```

## Type Definitions

Located in `src/lib/types.ts`:

- `Profile` - User profile
- `DriverProfile` - Extended driver information
- `Trip` - Trip posting
- `DriverBid` - Bid submission
- `Booking` - Confirmed booking
- `Message` - Chat message
- `CreateTripPayload` - Payload for creating trip
- `SubmitBidPayload` - Payload for submitting bid
- `AcceptBidPayload` - Payload for accepting bid

## Environment Variables

Required in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Client Setup

Located in `src/lib/supabase.ts`:

```typescript
import { supabase } from "@/lib/supabase";

// Access Supabase client
supabase

// Call edge functions
callEdgeFunction<T>(functionName: string, method?: string, body?: unknown): Promise<T>
```

## Security Considerations

1. **JWT Authentication**: All edge functions verify JWT tokens
2. **RLS**: Database policies enforce row-level access control
3. **User Verification**: Drivers must be verified to submit bids
4. **Data Isolation**: Users can only access their own data
5. **Password Security**: Supabase handles password hashing and validation

## Deployment

### Database Migrations
Migrations are automatically applied to Supabase. To add new migrations:

1. Create migration file with SQL
2. Apply using `mcp__supabase__apply_migration`

### Edge Functions
Deploy functions using `mcp__supabase__deploy_edge_function` tool.

Functions are automatically deployed to production at: `https://your-project.supabase.co/functions/v1/function-name`

## Error Handling

All API functions throw errors on failure. Implement try-catch blocks:

```typescript
try {
  const trips = await getTrips();
} catch (error) {
  console.error('Failed to fetch trips:', error.message);
}
```

## Rate Limiting

Supabase includes built-in rate limiting on edge functions. Monitor usage in the Supabase dashboard.

## Monitoring & Logs

View logs and metrics in Supabase dashboard:
- Functions logs: Functions section
- Database queries: Database section
- API requests: Analytics section

## Support

For issues:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error messages in browser console and Supabase logs
3. Verify JWT tokens are valid
4. Check RLS policies are correctly configured