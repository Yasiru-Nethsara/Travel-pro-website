# TripConnect API Documentation

## Authentication

All API endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are obtained through Supabase Auth:

```typescript
import { signIn } from "@/lib/auth";

const { data } = await signIn(email, password);
const token = data.session.access_token;
```

## Base URL

```
https://your-project.supabase.co/functions/v1
```

## API Endpoints

### Trips

#### GET /get-trips
Get all open trips with pagination.

**Query Parameters:**
- `status` (string): 'open', 'booked', or 'cancelled' - default: 'open'
- `limit` (number): Results per page - default: 10
- `offset` (number): Pagination offset - default: 0

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "https://your-project.supabase.co/functions/v1/get-trips?status=open&limit=10&offset=0"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "traveler_id": "uuid",
      "origin": "New York",
      "origin_lat": 40.7128,
      "origin_lng": -74.0060,
      "destination": "Boston",
      "destination_lat": 42.3601,
      "destination_lng": -71.0589,
      "departure_date": "2024-01-15T10:00:00Z",
      "seats_needed": 3,
      "max_price": 150,
      "status": "open",
      "description": "Looking for a ride to Boston",
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z"
    }
  ]
}
```

#### POST /create-trip
Create a new trip (traveler only).

**Request Body:**
```json
{
  "origin": "New York",
  "origin_lat": 40.7128,
  "origin_lng": -74.0060,
  "destination": "Boston",
  "destination_lat": 42.3601,
  "destination_lng": -71.0589,
  "departure_date": "2024-01-15T10:00:00Z",
  "seats_needed": 3,
  "max_price": 150,
  "description": "Looking for a ride to Boston"
}
```

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  https://your-project.supabase.co/functions/v1/create-trip
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "traveler_id": "uuid",
    "origin": "New York",
    "destination": "Boston",
    "departure_date": "2024-01-15T10:00:00Z",
    "seats_needed": 3,
    "max_price": 150,
    "status": "open",
    "description": "Looking for a ride to Boston",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-10T12:00:00Z"
  }
}
```

#### GET /get-my-trips
Get all trips created by the authenticated user.

**Query Parameters:**
- `limit` (number): Results per page - default: 10
- `offset` (number): Pagination offset - default: 0

**Response:**
```json
{
  "data": [
    { /* Trip object */ }
  ]
}
```

### Driver Bids

#### POST /submit-bid
Submit a bid for a trip (driver only).

**Request Body:**
```json
{
  "trip_id": "uuid",
  "bid_amount": 120,
  "vehicle_type": "sedan",
  "license_plate": "ABC123",
  "vehicle_color": "black",
  "notes": "Comfortable ride, professional driver"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "trip_id": "uuid",
    "driver_id": "uuid",
    "bid_amount": 120,
    "vehicle_type": "sedan",
    "license_plate": "ABC123",
    "vehicle_color": "black",
    "status": "pending",
    "notes": "Comfortable ride, professional driver",
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-10T12:00:00Z"
  }
}
```

#### GET /get-my-bids
Get all bids submitted by the authenticated driver.

**Query Parameters:**
- `status` (string): 'pending', 'accepted', 'rejected', or 'cancelled' - optional
- `limit` (number): Results per page - default: 10
- `offset` (number): Pagination offset - default: 0

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "driver_id": "uuid",
      "bid_amount": 120,
      "vehicle_type": "sedan",
      "license_plate": "ABC123",
      "vehicle_color": "black",
      "status": "pending",
      "notes": "Comfortable ride, professional driver",
      "trip": { /* Trip object */ },
      "traveler": { /* Profile object */ }
    }
  ]
}
```

#### POST /accept-bid
Accept a bid and create a booking (traveler only).

**Request Body:**
```json
{
  "bid_id": "uuid",
  "pickup_time": "2024-01-15T10:00:00Z"
}
```

**Response:**
```json
{
  "data": {
    "bid": {
      "id": "uuid",
      "trip_id": "uuid",
      "driver_id": "uuid",
      "bid_amount": 120,
      "status": "accepted",
      "created_at": "2024-01-10T12:00:00Z"
    },
    "booking": {
      "id": "uuid",
      "trip_id": "uuid",
      "driver_id": "uuid",
      "driver_bid_id": "uuid",
      "final_price": 120,
      "status": "confirmed",
      "pickup_time": "2024-01-15T10:00:00Z",
      "created_at": "2024-01-10T12:00:00Z"
    }
  }
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Supabase edge functions have rate limits:
- 10 requests per second per function per project
- 100,000 requests per day per function per project

Exceeding limits returns `429 Too Many Requests`.

## Using the API from Frontend

### Example: Get Trips

```typescript
import { getTrips } from "@/lib/api";

try {
  const trips = await getTrips("open", 10, 0);
  console.log(trips);
} catch (error) {
  console.error("Failed to fetch trips:", error.message);
}
```

### Example: Create Trip

```typescript
import { createTrip } from "@/lib/api";

try {
  const trip = await createTrip({
    origin: "New York",
    origin_lat: 40.7128,
    origin_lng: -74.0060,
    destination: "Boston",
    destination_lat: 42.3601,
    destination_lng: -71.0589,
    departure_date: new Date("2024-01-15").toISOString(),
    seats_needed: 3,
    max_price: 150,
    description: "Looking for a ride",
  });
  console.log("Trip created:", trip);
} catch (error) {
  console.error("Failed to create trip:", error.message);
}
```

### Example: Submit Bid

```typescript
import { submitBid } from "@/lib/api";

try {
  const bid = await submitBid({
    trip_id: "trip-uuid",
    bid_amount: 120,
    vehicle_type: "sedan",
    license_plate: "ABC123",
    vehicle_color: "black",
    notes: "Professional driver",
  });
  console.log("Bid submitted:", bid);
} catch (error) {
  console.error("Failed to submit bid:", error.message);
}
```

### Example: Accept Bid

```typescript
import { acceptBid } from "@/lib/api";

try {
  const result = await acceptBid({
    bid_id: "bid-uuid",
    pickup_time: new Date("2024-01-15T10:00:00").toISOString(),
  });
  console.log("Booking created:", result.booking);
} catch (error) {
  console.error("Failed to accept bid:", error.message);
}
```

## Real-time Subscriptions

Use Supabase real-time features to subscribe to changes:

```typescript
import { supabase } from "@/lib/supabase";

// Subscribe to trip changes
const subscription = supabase
  .from("trips")
  .on("*", (payload) => {
    console.log("Trip changed:", payload);
  })
  .subscribe();

// Unsubscribe
subscription.unsubscribe();
```

## Webhooks

Set up webhooks in Supabase dashboard to receive notifications:

1. Go to Database → Webhooks
2. Create new webhook
3. Select table and events
4. Provide endpoint URL
5. Supabase will POST to your endpoint when events occur

## Pagination

All list endpoints support pagination:

```typescript
// Get first 10
const page1 = await getTrips("open", 10, 0);

// Get next 10
const page2 = await getTrips("open", 10, 10);

// Get next 10
const page3 = await getTrips("open", 10, 20);
```

## Filtering and Sorting

### By Status
```typescript
const openTrips = await getTrips("open");
const bookedTrips = await getTrips("booked");
const cancelledTrips = await getTrips("cancelled");
```

### By Bid Status
```typescript
const pendingBids = await getMyBids("pending");
const acceptedBids = await getMyBids("accepted");
```

## Best Practices

1. **Always handle errors:**
   ```typescript
   try {
     const trips = await getTrips();
   } catch (error) {
     console.error("API error:", error.message);
     // Show user-friendly error message
   }
   ```

2. **Use pagination for large datasets:**
   ```typescript
   const pageSize = 20;
   let offset = 0;
   const allTrips = [];

   while (true) {
     const trips = await getTrips("open", pageSize, offset);
     if (trips.length === 0) break;
     allTrips.push(...trips);
     offset += pageSize;
   }
   ```

3. **Check authentication before API calls:**
   ```typescript
   import { getCurrentUser } from "@/lib/auth";

   const user = await getCurrentUser();
   if (!user) {
     // Redirect to login
   }
   ```

4. **Validate user permissions:**
   ```typescript
   const profile = await getCurrentProfile();
   if (profile.user_type !== "driver") {
     // Show error - only drivers can submit bids
   }
   ```

5. **Use loading states:**
   ```typescript
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
     setLoading(true);
     try {
       await createTrip(data);
     } finally {
       setLoading(false);
     }
   };
   ```

## Support

For API issues:
1. Check status page: https://status.supabase.com
2. Review browser console for errors
3. Check Supabase dashboard logs
4. Contact support via Supabase dashboard