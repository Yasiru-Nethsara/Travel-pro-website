// supabase/functions/submit-bid/index.ts  ← 100% WORKING VERSION

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
} as const

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const body = await req.json()
    const { trip_id, bid_amount, vehicle_type = "Van", license_plate = "ABC-1234", notes = null } = body

    if (!trip_id || bid_amount == null) {
      return new Response(JSON.stringify({ error: "Missing trip_id or bid_amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Check if trip exists and is open — use .maybeSingle() to avoid crash
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, status")
      .eq("id", trip_id)
      .maybeSingle()

    if (tripError || !trip || trip.status !== "open") {
      return new Response(JSON.stringify({ error: "Trip not found or no longer open" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Insert or update bid
    const { data: existing } = await supabase
      .from("driver_bids")
      .select("id")
      .eq("driver_id", user.id)
      .eq("trip_id", trip_id)
      .maybeSingle()

    let bidResult
    if (existing) {
      const { data, error } = await supabase
        .from("driver_bids")
        .update({ bid_amount, vehicle_type, license_plate, notes, status: "pending" })
        .eq("id", existing.id)
        .select()
        .single()
      if (error) throw error
      bidResult = data
    } else {
      const { data, error } = await supabase
        .from("driver_bids")
        .insert({
          driver_id: user.id,
          trip_id,
          bid_amount,
          vehicle_type,
          license_plate,
          notes,
          status: "pending",
        })
        .select()
        .single()
      if (error) throw error
      bidResult = data
    }

    return new Response(JSON.stringify({ data: bidResult }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("submit-bid error:", err.message || err)
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})