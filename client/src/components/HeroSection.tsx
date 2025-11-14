import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, DollarSign, Headphones } from "lucide-react";
import heroImage from "@assets/generated_images/Happy_travelers_road_trip_van_b84b6c81.svg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[700px] lg:min-h-[800px] flex items-center pt-32 pb-20 lg:pb-32 overflow-hidden gradient-overlay">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Trusted by 1000+ Travelers</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                Connect with
                <span className="block text-primary mt-2">Trusted Drivers</span>
                for Your Perfect Journey
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Plan trips, compare driver bids in real-time, and travel with complete confidence. Book the perfect vehicle for your next adventure.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild 
                className="text-base px-8 h-14 rounded-xl font-semibold hover-elevate shadow-lg shadow-primary/30"
              >
                <Link href="/login">
                  Plan Your Trip
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base px-8 h-14 rounded-xl font-semibold border-2 hover-elevate"
              >
                <Link href="/register-driver">Become a Driver</Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Verified Drivers</div>
                  <div className="text-xs text-muted-foreground mt-0.5">100% Background Checked</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Best Price</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Competitive Bids</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">24/7 Support</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Always Here to Help</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            {/* Added shadcn-card for consistent border/shadow effect */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 shadcn-card"> 
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay" />
              <img
                src={heroImage}
                alt="Happy travelers on a road trip"
                className="w-full h-auto relative z-10"
              />
            </div>
            
            {/* Floating stat card: Added shadcn-card and hover-elevate */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-2xl border border-border hidden lg:block shadcn-card hover-elevate">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Happy Travelers</div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}