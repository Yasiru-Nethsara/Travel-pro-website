import { supabase } from "./supabase";
import type { Profile } from "./types";

// Traveler Registration
export async function signUpTraveler(
  email: string,
  password: string,
  username: string
) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!data.user) {
    throw new Error("User creation failed");
  }

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: username,
      email,
      user_type: "traveler",
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return data;
}

// Driver Registration
export async function signUpDriver(
  email: string,
  password: string,
  fullName: string,
  age: number,
  vehicleName: string,
  vehicleRegNumber: string
) {
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!data.user) {
    throw new Error("User creation failed");
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName,
      email,
      user_type: "driver",
    },
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Create driver profile
  const { error: driverProfileError } = await supabase
    .from("driver_profiles")
    .insert([
      {
        id: data.user.id,
        vehicle_type: vehicleName,
        license_plate: vehicleRegNumber,
      },
    ]);

  if (driverProfileError) {
    throw new Error(driverProfileError.message);
  }

  return data;
}

// Common Sign In
export async function signIn(emailOrUsername: string, password: string) {
  // Check if input is email or username
  const isEmail = emailOrUsername.includes("@");
  
  let email = emailOrUsername;
  
  // If username, fetch email from profiles
  if (!isEmail) {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("full_name", emailOrUsername)
      .single();

    if (profileError || !profileData) {
      throw new Error("User not found");
    }

    email = profileData.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Get user profile to determine type
  const profile = await getCurrentProfile();
  
  return { ...data, profile };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function onAuthStateChange(callback: (user: any) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    (async () => {
      if (session) {
        const profile = await getCurrentProfile();
        callback({ user: session.user, profile });
      } else {
        callback(null);
      }
    })();
  });

  return data.subscription;
}