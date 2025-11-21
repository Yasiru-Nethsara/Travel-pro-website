// client/src/pages/DriverDashboard.tsx (or wherever it lives)

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import TripRequestCard from "@/components/TripRequestCard";
import { DollarSign, Star, MapPin, Loader2, Car } from "lucide-react";
import { getTrips, submitBid } from "@/lib/api";
import type { Trip } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import DriverNotifications from "@/components/DriverNotifications";

export default function DriverDashboard() {
  const [requests, setRequests] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTripRequests();
  }, []);

  const loadTripRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // This now returns ALL open trips — no filtering by vehicle/location
      const data = await getTrips("open", 50, 0); // increased limit for testing
      setRequests(data);
    } catch (err: any) {
      console.error("Failed to load trip requests:", err);
      setError(err.message || "Failed to load trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrice = async (tripId: string, price: number) => {
    try {
      await submitBid({
        trip_id: tripId,
        bid_amount: price,
        vehicle_type: "Van", // TODO: later get from driver profile
        license_plate: "ABC-1234",
        notes: "Accepting traveler's max price",
      });

      toast({
        title: "Success!",
        description: "Your bid has been submitted.",
      });
      loadTripRequests();
    } catch (err: any) {
      toast({
        title: "Bid Failed",
        description: err.message || "Could not submit bid.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitBid = async (tripId: string, amount: number) => {
    try {
      await submitBid({
        trip_id: tripId,
        bid_amount: amount,
        vehicle_type: "Van",
        license_plate: "ABC-1234",
      });

      toast({
        title: "Bid Submitted!",
        description: `You bid $${amount}`,
      });
      loadTripRequests();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to submit bid",
        variant: "destructive",
      });
    }
  };

  // Simple stats (you can enhance later)
  const stats = [
    { label: "Available Trips", value: requests.length.toString(), icon: Car },
    { label: "This Month Earnings", value: "$0", icon: DollarSign },
    { label: "Driver Rating", value: "N/A", icon: Star },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <DriverNotifications />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading available trips...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <DriverNotifications />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Browse all available trip requests from travelers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Error State */}
          {error && (
            <Card className="bg-red-50 border-red-200 p-6 mb-8">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={loadTripRequests}
                className="mt-3 text-sm font-medium text-red-700 underline hover:no-underline"
              >
                ↻ Try Again
              </button>
            </Card>
          )}

          {/* Trip Requests Title */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">All Available Trips</h2>
            <p className="text-muted-foreground">
              Showing all open trips — no filtering applied
            </p>
          </div>

          {/* Trip List */}
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((trip) => {
                // Extract vehicle from description (e.g. "Van with AC" → "Van")
                const desc = (trip.description || "").trim();
                const vehicleMatch = desc.match(/^(Van|Sedan|SUV|Car|Mini Van|Bus)/i);
                const vehicleType = vehicleMatch ? vehicleMatch[0] : "Any Vehicle";
                const hasAC = desc.toLowerCase().includes("ac") || desc.toLowerCase().includes("air");

                return (
                  <TripRequestCard
                    key={trip.id}
                    tripId={trip.id}
                    startLocation={trip.origin}
                    endLocation={trip.destination}
                    startDate={new Date(trip.departure_date).toLocaleString()}
                    endDate={new Date(trip.departure_date).toLocaleString()}
                    vehicleType={vehicleType}
                    seats={trip.seats_needed}
                    hasAC={hasAC}
                    calculatedPrice={trip.max_price}
                    onAcceptPrice={() => handleAcceptPrice(trip.id, trip.max_price)}
                    onSubmitBid={(amount) => handleSubmitBid(trip.id, amount)}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="p-16 text-center">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <Car className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No trips available yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                When travelers post new trips, they will appear here instantly.
                Check back soon!
              </p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}