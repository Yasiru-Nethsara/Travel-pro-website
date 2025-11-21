export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  user_type: "traveler" | "driver";
  created_at: string;
  updated_at: string;
}

export interface DriverProfile extends Profile {
  driver: {
    id: string;
    license_number: string | null;
    vehicle_type: string | null;
    vehicle_model: string | null;
    vehicle_color: string | null;
    license_plate: string | null;
    insurance_expires_at: string | null;
    total_trips: number;
    average_rating: number;
    is_verified: boolean;
    bio: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface Trip {
  id: string;
  traveler_id: string;
  origin: string;
  origin_lat: number | null;
  origin_lng: number | null;
  destination: string;
  destination_lat: number | null;
  destination_lng: number | null;
  departure_date: string;
  seats_needed: number;
  max_price: number;
  status: "open" | "booked" | "cancelled";
  description: string | null;
  created_at: string;
  updated_at: string;
  traveler?: Profile;
  bids?: DriverBid[];
  booking?: Booking | null;
}

export interface DriverBid {
  id: string;
  trip_id: string;
  driver_id: string;
  bid_amount: number;
  vehicle_type: string;
  license_plate: string;
  vehicle_color: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  driver?: Profile;
  trip?: Trip;
}

export interface Booking {
  id: string;
  trip_id: string;
  driver_id: string;
  driver_bid_id: string;
  final_price: number;
  status: "confirmed" | "completed" | "cancelled";
  pickup_time: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  booking_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface CreateTripPayload {
  origin: string;
  origin_lat: number;
  origin_lng: number;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  departure_date: string;
  seats_needed: number;
  max_price: number;
  description?: string;
}

export interface SubmitBidPayload {
  trip_id: string;
  bid_amount: number;
  vehicle_type: string;
  license_plate: string;
  vehicle_color?: string;
  notes?: string;
}

export interface AcceptBidPayload {
  bid_id: string;
  pickup_time: string;
}

// Add to client/src/lib/types.ts

export interface DriverNotification {
  id: string;
  driver_id: string;
  trip_id: string;
  trip_details: {
    origin: string;
    destination: string;
    departure_date: string;
    seats_needed: number;
    max_price: number;
    traveler_name: string;
    traveler_phone: string;
  };
  vehicle_match: string | null;
  status: "unread" | "read" | "archived";
  created_at: string;
  read_at: string | null;
}