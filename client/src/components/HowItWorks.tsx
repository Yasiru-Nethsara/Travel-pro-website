import { Card } from "@/components/ui/card";
import { Calendar, Users, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Plan Your Trip",
    description: "Enter your travel details, select your vehicle type, and mark your stops on the interactive map.",
    color: "primary",
  },
  {
    icon: Users,
    title: "Compare Driver Bids",
    description: "Receive competitive bids from verified drivers in your area and choose the best match for your journey.",
    color: "accent",
  },
  {
    icon: MessageCircle,
    title: "Travel with Confidence",
    description: "Chat with your driver, pay securely through our platform, and enjoy a safe and comfortable journey.",
    color: "primary",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-spacing bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-sm font-semibold text-primary">Simple Process</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Book your perfect trip in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isAccent = step.color === "accent";
            
            return (
              <Card 
                key={index} 
                className="p-8 lg:p-10 text-center hover-elevate relative group border-2"
              >
                {/* Step number badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className={`h-10 w-10 ${isAccent ? 'text-accent' : 'text-primary'}`} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connection line (hidden on mobile, visible on desktop except last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-5 lg:-right-6 w-10 lg:w-12 h-0.5 bg-gradient-to-r from-primary/40 to-transparent" />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}