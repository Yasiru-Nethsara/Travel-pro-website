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
    <section className="section-spacing overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <span className="text-sm font-semibold text-accent">For Drivers</span>
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                Drive with
                <span className="block text-primary mt-2">TripConnect</span>
              </h2>
              
              <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                Join our community of verified drivers and start earning on your own terms.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="p-6 hover-elevate border-2 group">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
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
              className="mt-6 h-14 px-8 rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
            >
              <Link href="/register-driver">
                Start Driving Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Image Side */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 mix-blend-overlay z-10" />
              <img
                src={driverImage}
                alt="Professional driver with vehicle"
                className="w-full h-auto relative z-0"
              />
            </div>
            
            {/* Decorative stat badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-2xl border-2 border-primary/20 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Active Drivers</div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 right-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
