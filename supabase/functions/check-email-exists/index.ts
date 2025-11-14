// supabase/functions/check-email-exists/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { email } = await req.json()

  const { data } = await supabase.auth.admin.listUsers()
  const exists = data.users.some(u => u.email?.toLowerCase() === email.toLowerCase())

  return new Response(
    JSON.stringify({ data: { exists } }),
    { headers: { "Content-Type": "application/json" } }
  )
})