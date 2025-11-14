// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------
   CALL EDGE FUNCTION (with auth)
   ------------------------------------------------------------------ */
export async function callEdgeFunction<T>(
  functionName: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const apiUrl = `${supabaseUrl}/functions/v1/${functionName}`;

  const response = await fetch(apiUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "API Error");
  }

  const result = await response.json();
  return result.data;
}

/* ------------------------------------------------------------------
   CHECK IF EMAIL EXISTS (via Edge Function)
   ------------------------------------------------------------------ */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await callEdgeFunction<{ exists: boolean }>("check-email-exists", "POST", { email });
    return result.exists;
  } catch (err) {
    console.error("checkEmailExists error:", err);
    return false; // fail open – let signup try
  }
}