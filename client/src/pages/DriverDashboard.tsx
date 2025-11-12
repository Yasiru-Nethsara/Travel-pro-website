import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import TripRequestCard from "@/components/TripRequestCard";
import { DollarSign, Star, MapPin } from "lucide-react";

export default function DriverDashboard() {
  const [requests] = useState([
    {
      tripId: "1",
      startLocation: "New York, NY",
      endLocation: "Boston, MA",
      startDate: "Dec 15, 2:00 PM",
      endDate: "Dec 18, 6:00 PM",
      vehicleType: "Van",
      seats: 6,
      hasAC: true,
      calculatedPrice: 450,
    },
    {
      tripId: "2",
      startLocation: "Los Angeles, CA",
      endLocation: "San Francisco, CA",
      startDate: "Dec 20, 9:00 AM",
      endDate: "Dec 22, 5:00 PM",
      vehicleType: "Car",
      seats: 4,
      hasAC: true,
      calculatedPrice: 380,
    },
  ]);

  const stats = [
    { label: "Active Trips", value: "3", icon: MapPin },
    { label: "This Month", value: "$2,450", icon: DollarSign },
    { label: "Rating", value: "4.8", icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">Manage your trips and earnings</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Trip Requests</h2>
            <p className="text-muted-foreground mb-6">
              New trip requests matching your vehicle and location
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {requests.map((request) => (
              <TripRequestCard
                key={request.tripId}
                {...request}
                onAcceptPrice={() => console.log('Price accepted for trip', request.tripId)}
                onSubmitBid={(amount) => console.log('Bid submitted:', amount, 'for trip', request.tripId)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
