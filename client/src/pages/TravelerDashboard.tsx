import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TripSummaryCard from "@/components/TripSummaryCard";
import { Plus, Loader2, MapPin, Calendar, Users, DollarSign, Check, X, Trash2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { getMyTrips, getBidsForTrip, acceptBid, rejectBid, deleteTrip, completeTrip } from "@/lib/api";
import type { Trip, DriverBid } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState("active");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripBids, setTripBids] = useState<Record<string, DriverBid[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTrips();
      setTrips(data);

      // Load bids for each open trip
      const bidsMap: Record<string, DriverBid[]> = {};
      for (const trip of data.filter(t => t.status === "open")) {
        try {
          const bids = await getBidsForTrip(trip.id);
          bidsMap[trip.id] = bids;
        } catch (e) {
          console.error(`Failed to load bids for trip ${trip.id}:`, e);
          bidsMap[trip.id] = [];
        }
      }
      setTripBids(bidsMap);
    } catch (err) {
      console.error("Failed to load trips:", err);
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      setAcceptingBid(bidId);
      await acceptBid({
        bid_id: bidId,
        pickup_time: new Date().toISOString(),
      });

      toast({
        title: "Driver Selected!",
        description: "The driver has been notified and your trip is confirmed.",
      });

      // Reload trips to reflect changes
      await loadTrips();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to accept bid",
        variant: "destructive",
      });
    } finally {
      setAcceptingBid(null);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      await rejectBid(bidId);
      toast({
        title: "Bid Rejected",
        description: "The driver has been notified.",
      });
      await loadTrips();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reject bid",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await deleteTrip(tripId);
      toast({
        title: "Trip Deleted",
        description: "Your trip has been successfully removed.",
      });
      await loadTrips();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to mark this trip as complete?")) return;

    try {
      await completeTrip(tripId);
      toast({
        title: "Trip Completed",
        description: "Your trip has been marked as complete.",
      });
      await loadTrips();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to complete trip",
        variant: "destructive",
      });
    }
  };

  // Filter trips by status
  const activeTrips = trips.filter(
    (trip) => trip.status === "open" || trip.status === "booked"
  );
  const pastTrips = trips.filter((trip) => trip.status === "cancelled" || trip.status === "completed");

  // Count total pending bids
  const totalPendingBids = Object.values(tripBids).reduce(
    (sum, bids) => sum + bids.filter(b => b.status === "pending").length,
    0
  );

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
              <div className="text-muted-foreground">
                Manage and track all your bookings
                {totalPendingBids > 0 && (
                  <Badge className="ml-2" variant="default">
                    {totalPendingBids} new bid{totalPendingBids !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
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

            <TabsContent value="active" className="space-y-6">
              {activeTrips.length > 0 ? (
                activeTrips.map((trip) => {
                  const bids = tripBids[trip.id] || [];
                  const pendingBids = bids.filter(b => b.status === "pending");
                  const acceptedBid = bids.find(b => b.status === "accepted");

                  return (
                    <Card key={trip.id} className="p-6">
                      {/* Trip Info Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-semibold">{trip.origin}</div>
                              <div className="text-sm text-muted-foreground">to</div>
                              <div className="font-semibold">{trip.destination}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(trip.departure_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {trip.seats_needed} seats
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Max ${trip.max_price}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          <Badge variant={trip.status === "booked" ? "default" : "secondary"}>
                            {trip.status === "booked" ? "Booked" : "Open"}
                          </Badge>
                          {trip.status === "open" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteTrip(trip.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                          {trip.status === "booked" && (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleCompleteTrip(trip.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete Trip
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Accepted Bid (if booked) */}
                      {acceptedBid && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">Driver Confirmed</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{acceptedBid.driver?.full_name || "Driver"}</p>
                              <p className="text-sm text-muted-foreground">
                                {acceptedBid.vehicle_type} • {acceptedBid.license_plate}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">${acceptedBid.bid_amount}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pending Bids */}
                      {trip.status === "open" && pendingBids.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            Driver Bids
                            <Badge variant="secondary">{pendingBids.length}</Badge>
                          </h4>
                          <div className="space-y-3">
                            {pendingBids.map((bid) => (
                              <div
                                key={bid.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-primary">
                                      {(bid.driver?.full_name || "D")[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{bid.driver?.full_name || "Driver"}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {bid.vehicle_type} • {bid.license_plate}
                                    </p>
                                    {bid.notes && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        "{bid.notes}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">${bid.bid_amount}</p>
                                    {bid.bid_amount < trip.max_price && (
                                      <p className="text-xs text-green-600">
                                        ${trip.max_price - bid.bid_amount} below max
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectBid(bid.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptBid(bid.id)}
                                      disabled={acceptingBid === bid.id}
                                    >
                                      {acceptingBid === bid.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Check className="h-4 w-4 mr-1" />
                                          Accept
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No bids yet message */}
                      {trip.status === "open" && pendingBids.length === 0 && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-center text-muted-foreground py-4">
                            No bids yet. Drivers will start bidding soon!
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-6 text-lg">No Active Trips</p>
                  <Button asChild size="lg">
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