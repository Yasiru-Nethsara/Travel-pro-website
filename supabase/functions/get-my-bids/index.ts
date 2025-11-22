// supabase/functions/get-my-bids/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    if (!token) return new Response(JSON.stringify({ data: [] }), { headers: corsHeaders })

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return new Response(JSON.stringify({ data: [] }), { headers: corsHeaders })

    const { data, error } = await supabase
      .from("driver_bids")
      .select(`
        id,
        bid_amount,
        vehicle_type,
        license_plate,
        notes,
        status,
        created_at,
        trip:trips!trip_id (
          id,
          origin,
          destination,
          departure_date,
          seats_needed,
          max_price,
          description
        )
      `)
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("get-my-bids error:", error)
      return new Response(JSON.stringify({ data: [] }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ data: data || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("get-my-bids fatal error:", err)
    return new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: corsHeaders,
    })
  }
})