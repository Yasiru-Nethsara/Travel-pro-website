// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ------------------------------------------------------------------
   CALL EDGE FUNCTION (USING .invoke() — AUTO ADDS AUTH + APIKEY)
   ------------------------------------------------------------------ */
export async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  } = {}
): Promise<T> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase.functions.invoke(functionName, {
    method: options.method || "GET",
    body: options.body as any, // ← FIXED: cast to any
  });

  if (error) {
    console.error("Edge Function Error:", error);
    throw new Error(error.message || "Failed to call function");
  }

  return data as T;
}

/* ------------------------------------------------------------------
   CHECK IF EMAIL EXISTS (via Edge Function)
   ------------------------------------------------------------------ */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const result = await callEdgeFunction<{ exists: boolean }>("check-email-exists", {
      method: "POST",
      body: { email },
    }); 
    return result.exists;
  } catch (err) {
    console.error("checkEmailExists error:", err);
    return false;
  }
}