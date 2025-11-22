// supabase/functions/get-trips/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
} as const

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') ?? 'open'

    // GET ALL OPEN TRIPS — NO FILTERING BY USER (we want ALL drivers to see ALL trips)
    const { data, error } = await supabase
      .from('trips')
      .select(`
        id,
        origin,
        destination,
        departure_date,
        seats_needed,
        max_price,
        description,
        created_at,
        status,
        traveler_id,
        profiles!traveler_id (full_name, phone)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (error) throw error

    return new Response(JSON.stringify({ data: data || [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('get-trips error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})