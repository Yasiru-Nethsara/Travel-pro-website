import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { bid_id, pickup_time } = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: bid } = await supabase
      .from("driver_bids")
      .select("*")
      .eq("id", bid_id)
      .maybeSingle();

    if (!bid) {
      return new Response(
        JSON.stringify({ error: "Bid not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: trip } = await supabase
      .from("trips")
      .select("*")
      .eq("id", bid.trip_id)
      .maybeSingle();

    if (!trip || trip.traveler_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("driver_bids").update({ status: "rejected" }).eq("trip_id", bid.trip_id).neq("id", bid_id);

    const { data: acceptedBid } = await supabase
      .from("driver_bids")
      .update({ status: "accepted" })
      .eq("id", bid_id)
      .select()
      .maybeSingle();

    const { data: booking } = await supabase
      .from("bookings")
      .insert([
        {
          trip_id: bid.trip_id,
          driver_id: bid.driver_id,
          driver_bid_id: bid_id,
          final_price: bid.bid_amount,
          pickup_time,
          status: "confirmed",
        },
      ])
      .select()
      .maybeSingle();

    await supabase.from("trips").update({ status: "booked" }).eq("id", bid.trip_id);

    return new Response(JSON.stringify({ data: { bid: acceptedBid, booking } }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});