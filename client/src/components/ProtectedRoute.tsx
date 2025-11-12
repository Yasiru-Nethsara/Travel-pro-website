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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userProfile = await getCurrentProfile();
        
        if (!userProfile) {
          // Not logged in, redirect to login
          setLocation("/login");
          return;
        }

        // Check if user type matches required type
        if (requiredUserType && userProfile.user_type !== requiredUserType) {
          // Wrong user type, redirect to appropriate dashboard
          if (userProfile.user_type === "driver") {
            setLocation("/driver-dashboard");
          } else {
            setLocation("/traveler-dashboard");
          }
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredUserType, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}