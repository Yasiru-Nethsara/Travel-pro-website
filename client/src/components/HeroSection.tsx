import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Shield, DollarSign, Headphones } from "lucide-react";
import heroImage from "@/assets/images/Travel pic.png";

export default function HeroSection() {
  return (
    <section className="relative min-h-[700px] lg:min-h-[800px] flex items-center pt-32 pb-20 lg:pb-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Train on bridge"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/10" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium text-white">Trusted by 1000+ Travelers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white">
                Connect with
                {/* ← THIS IS THE ONLY LINE YOU CHANGE */}
                <span className="block mt-2 text-white drop-shadow-[0_0_10px_black] drop-shadow-[0_0_20px_black]">
                  Trusted Drivers
                </span>
                for Your Perfect Journey
              </h1>

              <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl">
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
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">Verified Drivers</div>
                  <div className="text-xs text-white/70 mt-0.5">100% Background Checked</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">Best Price</div>
                  <div className="text-xs text-white/70 mt-0.5">Competitive Bids</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">24/7 Support</div>
                  <div className="text-xs text-white/70 mt-0.5">Always Here to Help</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}