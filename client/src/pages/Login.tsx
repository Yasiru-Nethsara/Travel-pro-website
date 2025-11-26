// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import { signIn, getCurrentProfile } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    let mounted = true;

    const checkExistingAuth = async () => {
      try {
        const profile = await getCurrentProfile();
        if (profile && mounted) {
          // User is already logged in, redirect to their dashboard
          const target = profile.user_type === "driver"
            ? "/driver-dashboard"
            : "/traveler-dashboard";
          setLocation(target);
        }
      } catch (error) {
        // User is not logged in, stay on login page
        console.log("Not logged in");
      }
    };

    checkExistingAuth();

    return () => {
      mounted = false;
    };
  }, [setLocation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.emailOrUsername) newErrors.emailOrUsername = "Email or username is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.emailOrUsername, formData.password);

      // Redirect based on user type
      const target = result.profile.user_type === "driver"
        ? "/driver-dashboard"
        : "/traveler-dashboard";

      setLocation(target);
    } catch (error) {
      console.error("Login error:", error);
      const msg = error instanceof Error ? error.message : "Invalid credentials. Please try again.";
      setErrors({ submit: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1 flex pt-16">
        {/* Left Side - Image & Content */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

          <div className="relative z-10 flex flex-col justify-end p-16 text-white h-full w-full">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Start your journey with confidence.
              </h2>
              <p className="text-lg text-slate-200 max-w-md">
                Connect with trusted drivers and experience seamless travel across the country.
              </p>
            </div>

            <div className="flex gap-4 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-sm text-slate-300">Active Users</p>
              </div>
              <div className="w-px bg-white/20 h-12"></div>
              <div>
                <p className="text-3xl font-bold">50k+</p>
                <p className="text-sm text-slate-300">Trips Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="max-w-[400px] w-full space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emailOrUsername"
                      type="text"
                      placeholder="name@example.com"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      value={formData.emailOrUsername}
                      onChange={(e) => handleChange("emailOrUsername", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.emailOrUsername && (
                    <p className="text-sm text-red-500 font-medium">{errors.emailOrUsername}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password">
                      <span className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer">
                        Forgot password?
                      </span>
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 font-medium">{errors.password}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-11 hover:bg-slate-50" disabled>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-11 hover:bg-slate-50" disabled>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13.135 6H15V3h-1.865a4.147 4.147 0 00-4.142 4.142V9H7v3h2v9.938h3V12h2.021l.592-3H12V6.591A.6.6 0 0112.6 6a.602.602 0 01.535.6z"></path>
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register">
                <span className="font-semibold text-primary hover:underline cursor-pointer">
                  Sign up for free
                </span>
              </Link>
            </div>

            <div className="text-center text-sm pt-4">
              <span className="text-muted-foreground">Are you a driver? </span>
              <Link href="/register-driver">
                <span className="font-semibold text-primary hover:underline cursor-pointer">
                  Register your vehicle
                </span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}