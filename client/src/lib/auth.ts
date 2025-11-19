// src/lib/auth.ts
import { supabase, checkEmailExists } from "./supabase";
import type { Profile } from "./types";
import type { Session, User } from "@supabase/supabase-js";

/* ------------------------------------------------------------------
   1. SAFE SESSION HELPERS
   ------------------------------------------------------------------ */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("getSession error:", error);
    return null;
  }
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/* ------------------------------------------------------------------
   2. PROFILE FETCH (only when user exists)
   ------------------------------------------------------------------ */
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile fetch error:", error);
    return null;
  }
  return data;
}

/* ------------------------------------------------------------------
   3. SIGN-UP TRAVELER – NO MANUAL INSERT
   ------------------------------------------------------------------ */
export async function signUpTraveler(
  email: string,
  password: string,
  username: string
) {
  const exists = await checkEmailExists(email);
  if (exists) {
    throw new Error("An account with this email already exists. Please log in.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: username, user_type: "traveler" },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("User creation failed");

  return data;
}

/* ------------------------------------------------------------------
   4. SIGN-UP DRIVER – NO MANUAL INSERT
   ------------------------------------------------------------------ */
export async function signUpDriver(
  email: string,
  password: string,
  fullName: string,
  age: number,
  vehicleName: string,
  vehicleRegNumber: string
) {
  const exists = await checkEmailExists(email);
  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, user_type: "driver", age },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("User creation failed");

  const { error: driverError } = await supabase.from("driver_profiles").insert([
    {
      id: data.user.id,
      vehicle_type: vehicleName,
      license_plate: vehicleRegNumber,
    },
  ]);

  if (driverError) throw driverError;

  return data;
}

/* ------------------------------------------------------------------
   5. SIGN IN
   ------------------------------------------------------------------ */
export async function signIn(emailOrUsername: string, password: string) {
  const isEmail = emailOrUsername.includes("@");
  let email = emailOrUsername;

  if (!isEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("full_name", emailOrUsername)
      .single();
    if (error || !data) throw new Error("User not found");
    email = data.email;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!signInData.session) throw new Error("No session returned");

    // Force Supabase to refresh the session properly (this eliminates the double event)
    await supabase.auth.setSession(signInData.session);

    // Now safely fetch the fresh profile
    const profile = await getCurrentProfile();
    if (!profile) throw new Error("Profile not found after login");

    return { ...signInData, profile };
}

/* ------------------------------------------------------------------
   6. SIGN OUT
   ------------------------------------------------------------------ */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* ------------------------------------------------------------------
   7. AUTH STATE LISTENER – FIXED
   ------------------------------------------------------------------ */
export function onAuthStateChange(
  callback: (payload: { user: User | null; profile: Profile | null } | null) => void
) {
  // Set initial state as not authenticated first
  callback(null);

  // Listen for auth state changes
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session?.user?.id);
    
    if (event === "SIGNED_OUT" || !session) {
      callback(null);
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
      try {
        const profile = await getCurrentProfile();
        callback({ user: session.user, profile });
      } catch (error) {
        console.error("Error fetching profile during auth state change:", error);
        callback(null);
      }
    } else if (event === "INITIAL_SESSION") {
      // Only process INITIAL_SESSION if there's actually a session
      if (session?.user) {
        try {
          const profile = await getCurrentProfile();
          callback({ user: session.user, profile });
        } catch (error) {
          console.error("Error fetching profile during initial session:", error);
          callback(null);
        }
      } else {
        callback(null);
      }
    }
  });

  // Also check initial session state after a short delay to ensure consistency
  setTimeout(async () => {
    try {
      const session = await getCurrentSession();
      if (session?.user) {
        const profile = await getCurrentProfile();
        callback({ user: session.user, profile });
      } else {
        callback(null);
      }
    } catch (error) {
      console.error("Error checking initial session:", error);
      callback(null);
    }
  }, 100);

  return { unsubscribe: data.subscription.unsubscribe };
}