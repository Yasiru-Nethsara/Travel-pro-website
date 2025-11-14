import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TripSummaryCard from "@/components/TripSummaryCard";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { getMyTrips } from "@/lib/api";
import type { Trip } from "@/lib/types";

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState("active");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTrips();
      setTrips(data);
    } catch (err) {
      console.error("Failed to load trips:", err);
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  // Filter trips by status
  const activeTrips = trips.filter(
    (trip) => trip.status === "open" || trip.status === "booked"
  );
  const pastTrips = trips.filter((trip) => trip.status === "cancelled");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your trips...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Trips</h1>
              <p className="text-muted-foreground">Manage and track all your bookings</p>
            </div>
            <Button asChild data-testid="button-new-trip">
              <Link href="/book-trip">
                <Plus className="h-5 w-5 mr-2" />
                New Trip
              </Link>
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={loadTrips} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="active" data-testid="tab-active-trips">
                Active Trips ({activeTrips.length})
              </TabsTrigger>
              <TabsTrigger value="past" data-testid="tab-past-trips">
                Past Trips ({pastTrips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeTrips.length > 0 ? (
                activeTrips.map((trip) => (
                  <TripSummaryCard
                    key={trip.id}
                    tripId={trip.id}
                    startLocation={trip.origin}
                    endLocation={trip.destination}
                    startDate={new Date(trip.departure_date).toLocaleString()}
                    endDate={new Date(trip.departure_date).toLocaleString()} // You may need to add return_date to your Trip type
                    vehicleType={trip.description || "Vehicle"}
                    seats={trip.seats_needed}
                    hasAC={true} // Add this field to your Trip type if needed
                    price={trip.max_price}
                    status={trip.status === "open" ? "pending" : "confirmed"}
                    stops={[]}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active trips</p>
                  <Button asChild>
                    <Link href="/book-trip">Book Your First Trip</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastTrips.length > 0 ? (
                pastTrips.map((trip) => (
                  <TripSummaryCard
                    key={trip.id}
                    tripId={trip.id}
                    startLocation={trip.origin}
                    endLocation={trip.destination}
                    startDate={new Date(trip.departure_date).toLocaleString()}
                    endDate={new Date(trip.departure_date).toLocaleString()}
                    vehicleType={trip.description || "Vehicle"}
                    seats={trip.seats_needed}
                    hasAC={true}
                    price={trip.max_price}
                    status="completed"
                    stops={[]}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No past trips</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}