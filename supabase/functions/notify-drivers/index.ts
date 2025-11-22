import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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

    const { trip_id } = await req.json();

    if (!trip_id) {
      return new Response(
        JSON.stringify({ error: "trip_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select(`
        *,
        traveler:profiles(full_name, avatar_url, phone)
      `)
      .eq("id", trip_id)
      .maybeSingle();

    if (tripError || !trip) {
      throw new Error("Trip not found");
    }

    // Get all verified drivers
    const { data: drivers, error: driversError } = await supabase
      .from("driver_profiles")
      .select(`
        id,
        vehicle_type,
        average_rating,
        profiles:id(full_name, email)
      `)
      .eq("is_verified", true);

    if (driversError) {
      throw new Error("Failed to fetch drivers");
    }

    // If no verified drivers, still return success
    if (!drivers || drivers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          notifications_sent: 0,
          message: "No verified drivers to notify",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notifications for all drivers
    const notifications = drivers.map((driver) => ({
      driver_id: driver.id,
      trip_id: trip_id,
      trip_details: {
        origin: trip.origin,
        destination: trip.destination,
        departure_date: trip.departure_date,
        seats_needed: trip.seats_needed,
        max_price: trip.max_price,
        traveler_name: trip.traveler?.full_name,
        traveler_phone: trip.traveler?.phone,
      },
      vehicle_match: driver.vehicle_type,
      status: "unread",
      created_at: new Date().toISOString(),
    }));

    // Save notifications to database
    const { data: savedNotifications, error: notifError } = await supabase
      .from("driver_notifications")
      .insert(notifications)
      .select();

    if (notifError) {
      console.error("Notification error:", notifError);
      // Don't fail the whole request if notifications fail
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_sent: savedNotifications?.length || 0,
        message: `Notifications sent to ${savedNotifications?.length || 0} drivers`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});