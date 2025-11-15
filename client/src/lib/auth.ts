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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Profile not found.");

  return { ...data, profile };
}

/* ------------------------------------------------------------------
   6. SIGN OUT
   ------------------------------------------------------------------ */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/* ------------------------------------------------------------------
   7. AUTH STATE LISTENER – FIXED: NO getCurrentProfile() inside!
   ------------------------------------------------------------------ */
export function onAuthStateChange(
  callback: (payload: { user: User | null; profile: Profile | null } | null) => void
) {
  // Initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      getCurrentProfile().then(profile => {
        callback({ user: session.user, profile });
      });
    } else {
      callback(null);
    }
  });

  // Listen for changes
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      callback(null);
    } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      const profile = await getCurrentProfile();
      callback({ user: session.user, profile });
    }
  });

  return { unsubscribe: data.subscription.unsubscribe };
}