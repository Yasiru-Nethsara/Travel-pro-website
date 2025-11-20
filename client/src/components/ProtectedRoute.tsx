// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentProfile } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "traveler" | "driver";
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        setIsChecking(true);
        
        // Get current profile
        const profile = await getCurrentProfile();

        if (!mounted) return;

        // Not logged in → redirect to login
        if (!profile) {
          setLocation("/login");
          return;
        }

        // Wrong role for this route → redirect to correct dashboard
        if (requiredUserType && profile.user_type !== requiredUserType) {
          const target = profile.user_type === "driver" 
            ? "/driver-dashboard" 
            : "/traveler-dashboard";
          setLocation(target);
          return;
        }

        // Everything is correct → show the page
        setIsReady(true);
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setLocation("/login");
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [requiredUserType, setLocation]);

  // Show loading state while checking
  if (isChecking || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}