import { supabase, callEdgeFunction } from "./supabase";
import type {
  Trip,
  DriverBid,
  Booking,
  CreateTripPayload,
  SubmitBidPayload,
  AcceptBidPayload,
  Profile,
} from "./types";

export async function getTrips(
  status: string = "open",
  limit: number = 10,
  offset: number = 0
): Promise<Trip[]> {
  return callEdgeFunction<Trip[]>(
    `get-trips?status=${status}&limit=${limit}&offset=${offset}`,
    "GET"
  );
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  return callEdgeFunction<Trip>("create-trip", "POST", payload);
}

export async function getMyTrips(
  limit: number = 10,
  offset: number = 0
): Promise<Trip[]> {
  return callEdgeFunction<Trip[]>(
    `get-my-trips?limit=${limit}&offset=${offset}`,
    "GET"
  );
}

export async function submitBid(payload: SubmitBidPayload): Promise<DriverBid> {
  return callEdgeFunction<DriverBid>("submit-bid", "POST", payload);
}

export async function getMyBids(
  status?: string,
  limit: number = 10,
  offset: number = 0
): Promise<DriverBid[]> {
  let url = `get-my-bids?limit=${limit}&offset=${offset}`;
  if (status) {
    url += `&status=${status}`;
  }
  return callEdgeFunction<DriverBid[]>(url, "GET");
}

export async function acceptBid(payload: AcceptBidPayload): Promise<{
  bid: DriverBid;
  booking: Booking;
}> {
  return callEdgeFunction<{
    bid: DriverBid;
    booking: Booking;
  }>("accept-bid", "POST", payload);
}

export async function rejectBid(bidId: string): Promise<void> {
  const { error } = await supabase.from("driver_bids").update({ status: "rejected" }).eq("id", bidId);

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
    .or(`driver_id.eq.${sessionData.session.user.id},trip_id.in(${sessionData.session.user.id})`)
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
      `and(sender_id.eq.${sessionData.session?.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${sessionData.session?.user.id})`
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
