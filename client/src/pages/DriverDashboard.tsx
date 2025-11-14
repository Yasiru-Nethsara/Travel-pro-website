import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import TripRequestCard from "@/components/TripRequestCard";
import { DollarSign, Star, MapPin, Loader2 } from "lucide-react";
import { getTrips, submitBid } from "@/lib/api";
import type { Trip } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

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
      // Get open trips (trips that are available for bidding)
      const data = await getTrips("open", 10, 0);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load trip requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load trip requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrice = async (tripId: string, price: number) => {
    try {
      // Submit bid with the suggested price
      await submitBid({
        trip_id: tripId,
        bid_amount: price,
        vehicle_type: "Van", // You should get this from driver's profile
        license_plate: "ABC-1234", // You should get this from driver's profile
        notes: "Accepting suggested price",
      });
      
      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully",
      });
      
      // Reload trips
      loadTripRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit bid",
        variant: "destructive",
      });
    }
  };

  const handleSubmitBid = async (tripId: string, amount: number) => {
    try {
      await submitBid({
        trip_id: tripId,
        bid_amount: amount,
        vehicle_type: "Van", // You should get this from driver's profile
        license_plate: "ABC-1234", // You should get this from driver's profile
      });
      
      toast({
        title: "Bid Submitted",
        description: `Your bid of $${amount} has been submitted`,
      });
      
      // Reload trips
      loadTripRequests();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to submit bid",
        variant: "destructive",
      });
    }
  };

  const stats = [
    { label: "Active Trips", value: "0", icon: MapPin },
    { label: "This Month", value: "$0", icon: DollarSign },
    { label: "Rating", value: "N/A", icon: Star },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading trip requests...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={loadTripRequests}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Trip Requests</h2>
            <p className="text-muted-foreground mb-6">
              New trip requests matching your vehicle and location
            </p>
          </div>

          {requests.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {requests.map((request) => (
                <TripRequestCard
                  key={request.id}
                  tripId={request.id}
                  startLocation={request.origin}
                  endLocation={request.destination}
                  startDate={new Date(request.departure_date).toLocaleString()}
                  endDate={new Date(request.departure_date).toLocaleString()}
                  vehicleType={request.description || "Any"}
                  seats={request.seats_needed}
                  hasAC={true}
                  calculatedPrice={request.max_price}
                  onAcceptPrice={() => handleAcceptPrice(request.id, request.max_price)}
                  onSubmitBid={(amount) => handleSubmitBid(request.id, amount)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-2">No trip requests available</p>
              <p className="text-sm text-muted-foreground">
                Check back later for new trip opportunities
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}