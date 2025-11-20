// src/components/Navigation.tsx
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut, getCurrentProfile } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Load profile on mount and when location changes
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const currentProfile = await getCurrentProfile();
        if (mounted) {
          setProfile(currentProfile);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        if (mounted) {
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  const handleLogout = async () => {
    try {
      await signOut();
      // Clean up any leftover Supabase tokens
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
      setProfile(null);
      setLocation("/");
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getDashboardLink = () => {
    return profile?.user_type === "driver" ? "/driver-dashboard" : "/traveler-dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 -ml-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              TripConnect
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors">Support</Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="flex gap-3">
                <div className="h-10 w-24 bg-muted/70 rounded-xl animate-pulse" />
                <div className="h-10 w-28 bg-primary/20 rounded-xl animate-pulse" />
              </div>
            ) : profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 font-medium">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    {profile.full_name.split(" ")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t">
            <div className="flex flex-col gap-4">
              {["Home", "How It Works", "Pricing", "Support"].map((item) => (
                <Link
                  key={item}
                  href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                  className="px-4 py-2 text-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t">
                {loading ? (
                  <div className="h-8 bg-muted/50 animate-pulse rounded mx-4" />
                ) : profile ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <User className="h-8 w-8 text-primary" />
                      <span className="font-medium">{profile.full_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 px-4">
                    <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/register">Register</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}