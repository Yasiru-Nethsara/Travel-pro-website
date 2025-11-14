import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, DollarSign, Headphones } from "lucide-react";
import heroImage from "@assets/generated_images/Happy_travelers_road_trip_van_b84b6c81.svg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[700px] lg:min-h-[800px] flex items-center pt-32 pb-20 lg:pb-32 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 pointer-events-none" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Trusted by 1000+ Travelers</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                Connect with
                <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mt-2">Trusted Drivers</span>
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
                className="text-base px-8 h-14 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
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
                className="text-base px-8 h-14 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
              >
                <Link href="/register-driver">Become a Driver</Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Verified Drivers</div>
                  <div className="text-xs text-muted-foreground mt-0.5">100% Background Checked</div>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-xl group-hover:shadow-green-500/40 transition-all duration-300">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Best Price</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Competitive Bids</div>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">24/7 Support</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Always Here to Help</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-8">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 mix-blend-overlay" />
              <img
                src={heroImage}
                alt="Happy travelers on a road trip"
                className="w-full h-auto relative z-10 hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Floating stat card with enhanced design */}
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-2xl border border-blue-100 hidden lg:block hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">1000+</div>
                  <div className="text-sm text-muted-foreground font-medium">Happy Travelers</div>
                </div>
              </div>
            </div>

            {/* Enhanced decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-12 right-12 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          </div>
        </div>
      </div>
    </section>
  );
}