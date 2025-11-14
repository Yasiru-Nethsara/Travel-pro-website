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
    <section className="section-spacing bg-gradient-to-b from-blue-50/50 via-white to-green-50/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-400/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 backdrop-blur-sm mb-6">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Simple Process</span>
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
            const gradientColors = isAccent
              ? "from-green-500 to-green-600"
              : "from-blue-500 to-blue-600";
            const shadowColor = isAccent
              ? "shadow-green-500/20 group-hover:shadow-green-500/30"
              : "shadow-blue-500/20 group-hover:shadow-blue-500/30";

            return (
              <Card
                key={index}
                className={`p-8 lg:p-10 text-center hover-elevate relative group border-2 bg-white/70 backdrop-blur-sm ${shadowColor} transition-all duration-300`}
              >
                {/* Step number badge */}
                <div className={`absolute -top-4 -right-4 w-14 h-14 rounded-full bg-gradient-to-br ${gradientColors} text-white flex items-center justify-center font-bold text-xl shadow-xl ${shadowColor}`}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${gradientColors} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg ${shadowColor}`}>
                  <Icon className="h-12 w-12 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Connection line (hidden on mobile, visible on desktop except last item) */}
                {index < steps.length - 1 && (
                  <div className={`hidden md:block absolute top-1/2 -right-5 lg:-right-6 w-10 lg:w-12 h-1 bg-gradient-to-r ${gradientColors} rounded-full`} />
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}