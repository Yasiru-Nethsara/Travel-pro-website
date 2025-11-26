// src/lib/api.ts
import { supabase, callEdgeFunction } from "./supabase";
import type {
  Trip,
  DriverBid,
  Booking,
  CreateTripPayload,
  SubmitBidPayload,
  AcceptBidPayload,
  Profile,
  DriverDetails,
} from "./types";

export async function getMyTrips(): Promise<Trip[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return [];

  const { data, error } = await supabase
    .from("trips")
    .select("*, traveler:profiles!traveler_id(*)")
    .eq("traveler_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getTrips(
  status: "open" | "booked" | "completed" = "open",
  limit = 50,
  offset = 0
): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*, traveler:profiles!traveler_id(*)")
    .eq("status", status)
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("trips")
    .insert([{ ...payload, traveler_id: sessionData.session.user.id, status: "open" }])
    .select("*, traveler:profiles!traveler_id(*)")
    .single();

  if (error) throw new Error(error.message);
  
  // Try to notify drivers, but don't fail if it fails (Edge Function might be down)
  try {
    await notifyDriversOfTrip(data.id);
  } catch (e) {
    console.warn("Failed to notify drivers:", e);
  }

  return data;
}

export async function submitBid(payload: SubmitBidPayload): Promise<DriverBid> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("driver_bids")
    .insert([{ 
      ...payload, 
      driver_id: sessionData.session.user.id, 
      status: "pending" 
    }])
    .select("*, driver:profiles!driver_id(*)")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMyBids(): Promise<DriverBid[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return [];

  const { data, error } = await supabase
    .from("driver_bids")
    .select("*, trip:trips(*, traveler:profiles!traveler_id(*))")
    .eq("driver_id", sessionData.session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function acceptBid(payload: AcceptBidPayload): Promise<{
  bid: DriverBid;
  booking: Booking;
}> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("Not authenticated");

  // 1. Update Bid Status
  const { data: bid, error: bidError } = await supabase
    .from("driver_bids")
    .update({ status: "accepted" })
    .eq("id", payload.bid_id)
    .select("*, driver:profiles!driver_id(*)")
    .single();

  if (bidError) throw new Error(bidError.message);

  // 2. Update Trip Status
  const { error: tripError } = await supabase
    .from("trips")
    .update({ status: "booked" })
    .eq("id", bid.trip_id);

  if (tripError) throw new Error(tripError.message);

  // 3. Create Booking
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