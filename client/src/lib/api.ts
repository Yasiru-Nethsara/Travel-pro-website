import { supabase } from "./supabase";
import type { Trip, DriverBid, Profile, Booking, DriverDetails } from "./types";

async function callEdgeFunction<T>(
  functionName: string,
  options: { method: string; body?: any }
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
    {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getTrips(
  status?: string,
  limit?: number,
  offset?: number
): Promise<Trip[]> {
  let query = supabase
    .from("trips")
    .select(`
      *,
      traveler:profiles!trips_traveler_id_fkey(id, full_name, email, phone, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getMyTrips(): Promise<Trip[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return [];
  }

  const { data, error } = await supabase
    .from("trips")
    .select(`
      *,
      traveler:profiles!trips_traveler_id_fkey(id, full_name, email, phone, avatar_url, phone_number)
    `)
    .eq("traveler_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createTrip(payload: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  seats_needed: number;
  max_price: number;
  description?: string;
  ac_required?: boolean;
  vehicle_type?: string;
}): Promise<Trip> {
  const { data: sessionData } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from("trips")
    .insert([
      {
        ...payload,
        traveler_id: sessionData.session?.user.id,
        status: "open",
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function submitBid(payload: {
  trip_id: string;
  bid_amount: number;
  vehicle_type: string;
  license_plate?: string;
  vehicle_color?: string;
  notes?: string;
}): Promise<DriverBid> {
  const { data: sessionData } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from("driver_bids")
    .insert([
      {
        ...payload,
        driver_id: sessionData.session?.user.id,
        status: "pending",
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyBids(): Promise<DriverBid[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return [];
  }

  const { data, error } = await supabase
    .from("driver_bids")
    .select(`
      *,
      trip:trips(*, traveler:profiles!trips_traveler_id_fkey(id, full_name, email, phone, avatar_url)),
      driver:profiles!driver_id(id, full_name, email, phone, avatar_url)
    `)
    .eq("driver_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function acceptBid(payload: {
  bid_id: string;
  pickup_time: string;
}): Promise<{ bid: DriverBid; booking: Booking }> {
  const { data: bid, error: bidError } = await supabase
    .from("driver_bids")
    .update({ status: "accepted" })
    .eq("id", payload.bid_id)
    .select("*")
    .single();

  if (bidError) throw new Error(bidError.message);

  // Update trip status to booked
  const { error: tripError } = await supabase
    .from("trips")
    .update({ status: "booked" })
    .eq("id", bid.trip_id);

  if (tripError) throw new Error(tripError.message);

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([{
      trip_id: bid.trip_id,
      driver_id: bid.driver_id,
      driver_bid_id: bid.id,
      final_price: bid.bid_amount,
      status: "confirmed",
      pickup_time: payload.pickup_time
    }])
    .select("*")
    .single();

  if (bookingError) throw new Error(bookingError.message);

  return { bid, booking };
}

export async function rejectBid(bidId: string): Promise<void> {
  const { error } = await supabase
    .from("driver_bids")
    .update({ status: "rejected" })
    .eq("id", bidId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getProfile(): Promise<Profile | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", sessionData.session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProfile(payload: Partial<Profile>): Promise<Profile> {
  const { data: sessionData } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", sessionData.session?.user.id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return [];
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .or(
      `driver_id.eq.${sessionData.session.user.id},trip_id.in(${sessionData.session.user.id})`
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendMessage(
  receiverId: string,
  content: string,
  bookingId?: string
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();

  const { error } = await supabase.from("messages").insert([
    {
      sender_id: sessionData.session?.user.id,
      receiver_id: receiverId,
      content,
      booking_id: bookingId,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getConversation(userId: string, bookingId?: string) {
  const { data: sessionData } = await supabase.auth.getSession();

  let query = supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${sessionData.session?.user.id},receiver_id.eq.${userId}),` +
      `and(sender_id.eq.${userId},receiver_id.eq.${sessionData.session?.user.id})`
    );

  if (bookingId) {
    query = query.eq("booking_id", bookingId);
  }

  const { data, error } = await query.order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getBidsForTrip(tripId: string): Promise<DriverBid[]> {
  const { data, error } = await supabase
    .from("driver_bids")
    .select(`
      *,
      driver:profiles!driver_id(id, full_name, email, phone, avatar_url)
    `)
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function notifyDriversOfTrip(tripId: string): Promise<void> {
  // This is the only one we keep as Edge Function, but we wrap it in try-catch in callers
  await callEdgeFunction<void>("notify-drivers", {
    method: "POST",
    body: { trip_id: tripId },
  });
}

export async function getDriverDetails(): Promise<DriverDetails | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const { data, error } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("id", sessionData.session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as DriverDetails;
}

export async function updateDriverDetails(payload: {
  vehicle_type?: string;
  vehicle_model?: string;
  license_plate?: string;
  vehicle_color?: string;
}): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("driver_profiles")
    .update(payload)
    .eq("id", sessionData.session.user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeTrip(tripId: string): Promise<void> {
  const { error } = await supabase
    .from("trips")
    .update({ status: "completed" })
    .eq("id", tripId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createReview(payload: {
  trip_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("reviews")
    .insert([{
      ...payload,
      reviewer_id: sessionData.session.user.id
    }]);

  if (error) throw new Error(error.message);
}

export async function getTripReview(tripId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}