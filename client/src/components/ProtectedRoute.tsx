// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getCurrentProfile } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "traveler" | "driver";
}

export default function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const profile = await getCurrentProfile();

      if (!mounted) return;

      // 1. Not logged in → force login
      if (!profile) {
        setLocation("/login");
        return;
      }

      // 2. Logged in but on public pages (home, login, register) → redirect to correct dashboard
      const publicPages = ["/", "/login", "/register", "/register-driver"];
      if (publicPages.includes(location)) {
        const target = profile.user_type === "driver" ? "/driver-dashboard" : "/traveler-dashboard";
        setLocation(target);
        return;
      }

      // 3. Wrong role for this protected route → send to correct dashboard
      if (requiredUserType && profile.user_type !== requiredUserType) {
        const target = profile.user_type === "driver" ? "/driver-dashboard" : "/traveler-dashboard";
        setLocation(target);
        return;
      }

      // 4. Everything perfect → render the dashboard!
      if (mounted) {
        setIsReady(true);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [location, requiredUserType, setLocation]);

  if (!isReady) {
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