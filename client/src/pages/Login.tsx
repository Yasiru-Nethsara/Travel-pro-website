// src/pages/Login.tsx
import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function Login() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
      await signIn(formData.emailOrUsername, formData.password);
      // NO REDIRECT HERE ANYMORE!
      // ProtectedRoute + updated logic below will handle it perfectly
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16 bg-muted/30">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Log in to your TripConnect account</p>
          </div>

          <Card className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) => handleChange("emailOrUsername", e.target.value)}
                  disabled={isLoading}
                />
                {errors.emailOrUsername && (
                  <p className="text-sm text-destructive">{errors.emailOrUsername}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="border-t border-border pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Are you a driver?{" "}
              <Link href="/register-driver" className="text-primary hover:underline">
                Register your vehicle
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}