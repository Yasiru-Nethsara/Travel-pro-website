// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentProfile } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "traveler" | "driver";
}

export default function ProtectedRoute({ 
  children, 
  requiredUserType 
}: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const profile = await getCurrentProfile();

      if (!mounted) return;

      if (!profile) {
        setLocation("/login");
        return;
      }

      if (requiredUserType && profile.user_type !== requiredUserType) {
        const redirectTo = profile.user_type === "driver" ? "/driver-dashboard" : "/traveler-dashboard";
        setLocation(redirectTo);
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();

    return () => { mounted = false; };
  }, [requiredUserType, setLocation]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}