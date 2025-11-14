import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentProfile } from "@/lib/auth";
import type { Profile } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "traveler" | "driver";
}

export default function ProtectedRoute({ 
  children, 
  requiredUserType 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const userProfile = await getCurrentProfile();
        
        if (!mounted) return;

        console.log("User profile:", userProfile);
        
        if (!userProfile) {
          console.log("No user profile found, redirecting to login");
          setLocation("/login");
          return;
        }

        // Check if user type matches required type
        if (requiredUserType && userProfile.user_type !== requiredUserType) {
          console.log(`User type mismatch. Required: ${requiredUserType}, Got: ${userProfile.user_type}`);
          // Wrong user type, redirect to appropriate dashboard
          if (userProfile.user_type === "driver") {
            setLocation("/driver-dashboard");
          } else {
            setLocation("/traveler-dashboard");
          }
          return;
        }

        console.log("Authentication successful");
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        
        console.error("Auth check failed:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        // Don't immediately redirect on error, give user a chance to see what happened
        setTimeout(() => {
          if (mounted) {
            setLocation("/login");
          }
        }, 2000);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [requiredUserType, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-destructive text-lg font-semibold">
            Authentication Error
          </div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}