import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { DollarSign, Calendar, Shield, TrendingUp, ArrowRight } from "lucide-react";
import driverImage from "@assets/generated_images/Professional_driver_with_modern_van_e940ad5d.svg";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn More",
    description: "Set your own rates and maximize your earnings with our flexible bidding system.",
    gradient: "from-accent to-accent/80",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Choose trips that fit your availability and build your own schedule.",
    gradient: "from-primary to-primary/80",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get advance payments and guaranteed earnings for confirmed trips.",
    gradient: "from-accent to-accent/80",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Build your reputation with ratings and grow your customer base.",
    gradient: "from-primary to-primary/80",
  },
];

export default function DriverBenefits() {
  return (
    <section className="section-spacing overflow-hidden bg-gradient-to-b from-white via-green-50/30 to-blue-50/30 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 backdrop-blur-sm">
                <span className="text-sm font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">For Drivers</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                Drive with
                <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mt-2">TripConnect</span>
              </h2>

              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Join our community of verified drivers and start earning on your own terms.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                const isGreen = index % 2 === 0;
                const gradientColors = isGreen
                  ? "from-green-500 to-green-600"
                  : "from-blue-500 to-blue-600";
                const shadowColor = isGreen
                  ? "shadow-green-500/30 group-hover:shadow-green-500/40"
                  : "shadow-blue-500/30 group-hover:shadow-blue-500/40";

                return (
                  <Card key={index} className={`p-6 hover-elevate border-2 bg-white/70 backdrop-blur-sm group ${shadowColor} transition-all duration-300`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColors} mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${shadowColor}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </Card>
                );
              })}
            </div>

            <Button
              size="lg"
              asChild
              className="mt-6 h-14 px-8 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              <Link href="/register-driver">
                Start Driving Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Image Side */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 mix-blend-overlay z-10" />
              <img
                src={driverImage}
                alt="Professional driver with vehicle"
                className="w-full h-auto relative z-0 hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Decorative stat badge with enhanced design */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border border-green-100 hidden lg:block hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-muted-foreground font-medium">Active Drivers</div>
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
