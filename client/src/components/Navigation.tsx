import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentProfile, signOut } from "@/lib/auth";
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
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      const userProfile = await getCurrentProfile();
      setProfile(userProfile);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setProfile(null);
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getDashboardLink = () => {
    if (!profile) return "/";
    return profile.user_type === "driver" ? "/driver-dashboard" : "/traveler-dashboard";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover-elevate rounded-xl px-3 py-2 -ml-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              TripConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 rounded-lg transition-colors">
              Home
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 rounded-lg transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 rounded-lg transition-colors">
              Pricing
            </Link>
            <Link href="/support" className="text-sm font-medium text-foreground hover:text-primary px-4 py-2 rounded-lg transition-colors">
              Support
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 font-medium rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    {profile.full_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild className="font-medium rounded-xl">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button 
                  variant="default" 
                  asChild 
                  className="font-semibold rounded-xl shadow-lg shadow-primary/30"
                >
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/50">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm font-medium text-foreground hover:text-primary px-4 py-3 rounded-lg transition-colors">
                Home
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium text-foreground hover:text-primary px-4 py-3 rounded-lg transition-colors">
                How It Works
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary px-4 py-3 rounded-lg transition-colors">
                Pricing
              </Link>
              <Link href="/support" className="text-sm font-medium text-foreground hover:text-primary px-4 py-3 rounded-lg transition-colors">
                Support
              </Link>
              
              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border/50">
                {profile ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="font-medium">{profile.full_name}</div>
                    </div>
                    <Button variant="ghost" asChild className="justify-start rounded-xl">
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="justify-start rounded-xl">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="rounded-xl">
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button variant="default" asChild className="rounded-xl shadow-lg shadow-primary/30">
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}