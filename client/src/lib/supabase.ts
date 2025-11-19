// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------
   CALL EDGE FUNCTION — OPTIONAL AUTH + ALWAYS SEND APIKEY
   ------------------------------------------------------------------ */
export async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    requireAuth?: boolean; // default: true
  } = {}
): Promise<T> {
  const requireAuth = options.requireAuth !== false; // default true
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey, // always required for Edge Functions
  };

  if (requireAuth) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error("Not authenticated");
    }
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    method: options.method ?? "GET",
    body: options.body as Record<string, unknown>,
    headers,
  });

  if (error) {
    console.error("Edge Function Error:", error);
    throw new Error(error.message ?? "Failed to call function");
  }

  return data as T;
}

/* ------------------------------------------------------------------
   CHECK IF EMAIL EXISTS (public – no auth needed)
   ------------------------------------------------------------------ */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await callEdgeFunction<{ exists: boolean }>("check-email-exists", {
      method: "POST",
      body: { email },
      requireAuth: false, // <-- IMPORTANT
    });
    return result.exists;
  } catch (err) {
    console.error("checkEmailExists error:", err);
    return false;
  }
}