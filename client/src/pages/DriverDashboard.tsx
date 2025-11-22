import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Star, MapPin, Loader2, Car, Calendar, Users, Wind, Check } from "lucide-react";
import { getTrips, submitBid, getMyBids } from "@/lib/api";
import type { Trip, DriverBid } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function DriverDashboard() {
  const [requests, setRequests] = useState<Trip[]>([]);
  const [myBids, setMyBids] = useState<DriverBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingBid, setSubmittingBid] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [showBidInput, setShowBidInput] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tripsData, bidsData] = await Promise.all([
        getTrips("open", 50, 0),
        getMyBids().catch(() => []),
      ]);
      
      setRequests(tripsData);
      setMyBids(bidsData);
      
      // Initialize bid amounts with trip max prices
      const amounts: Record<string, string> = {};
      tripsData.forEach(trip => {
        amounts[trip.id] = trip.max_price.toString();
      });
      setBidAmounts(amounts);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.message || "Failed to load trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPrice = async (tripId: string, price: number) => {
    await handleSubmitBid(tripId, price);
  };

  const handleSubmitBid = async (tripId: string, amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid bid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingBid(tripId);
      
      await submitBid({
        trip_id: tripId,
        bid_amount: amount,
        vehicle_type: "Van",
        license_plate: "ABC-1234",
        notes: amount === requests.find(t => t.id === tripId)?.max_price 
          ? "Accepting traveler's price" 
          : undefined,
      });

      toast({
        title: "Bid Submitted!",
        description: `Your bid of $${amount} has been sent to the traveler.`,
      });
      
      setShowBidInput(prev => ({ ...prev, [tripId]: false }));
      await loadData();
    } catch (err: any) {
      console.error("Bid submission error:", err);
      toast({
        title: "Bid Failed",
        description: err.message || "Could not submit bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingBid(null);
    }
  };

  const handleBidInputChange = (tripId: string, value: string) => {
    setBidAmounts(prev => ({ ...prev, [tripId]: value }));
  };

  const getMyBidForTrip = (tripId: string) => {
    return myBids.find(bid => bid.trip_id === tripId);
  };

  // Stats
  const acceptedBids = myBids.filter(b => b.status === "accepted").length;
  const pendingBids = myBids.filter(b => b.status === "pending").length;

  const stats = [
    { label: "Available Trips", value: requests.length.toString(), icon: Car },
    { label: "Pending Bids", value: pendingBids.toString(), icon: DollarSign },
    { label: "Accepted Bids", value: acceptedBids.toString(), icon: Check },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
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
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
            <p className="text-muted-foreground">
              Browse available trips and submit your bids
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

          {error && (
            <Card className="bg-red-50 border-red-200 p-6 mb-8">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={loadData}
                className="mt-3 text-sm font-medium text-red-700 underline hover:no-underline"
              >
                ↻ Try Again
              </button>
            </Card>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Available Trips</h2>
            <p className="text-muted-foreground">
              {requests.length} trip{requests.length !== 1 ? "s" : ""} available for bidding
            </p>
          </div>

          {requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((trip) => {
                const existingBid = getMyBidForTrip(trip.id);
                const isSubmitting = submittingBid === trip.id;
                const showInput = showBidInput[trip.id];
                const bidAmount = bidAmounts[trip.id] || trip.max_price.toString();

                return (
                  <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Route */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{trip.origin}</div>
                          <div className="text-sm text-muted-foreground">to</div>
                          <div className="font-medium truncate">{trip.destination}</div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {trip.seats_needed} seats
                        </Badge>
                        {trip.description?.toLowerCase().includes("ac") && (
                          <Badge variant="secondary">
                            <Wind className="h-3 w-3 mr-1" />
                            AC
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Max Budget</div>
                            <div className="text-2xl font-bold text-primary">${trip.max_price}</div>
                          </div>
                        </div>

                        {/* Existing Bid Status */}
                        {existingBid && (
                          <div className={`p-3 rounded-lg mb-3 ${
                            existingBid.status === "accepted" 
                              ? "bg-green-50 border border-green-200" 
                              : existingBid.status === "rejected"
                              ? "bg-red-50 border border-red-200"
                              : "bg-blue-50 border border-blue-200"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {existingBid.status === "accepted" && "✓ Bid Accepted!"}
                                {existingBid.status === "rejected" && "✗ Bid Rejected"}
                                {existingBid.status === "pending" && "⏳ Bid Pending"}
                              </span>
                              <span className="font-bold">${existingBid.bid_amount}</span>
                            </div>
                          </div>
                        )}

                        {/* Bid Actions */}
                        {!existingBid || existingBid.status === "rejected" ? (
                          !showInput ? (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: true }))}
                                disabled={isSubmitting}
                              >
                                Custom Bid
                              </Button>
                              <Button
                                className="flex-1"
                                onClick={() => handleAcceptPrice(trip.id, trip.max_price)}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  `Accept $${trip.max_price}`
                                )}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                  <Input
                                    type="number"
                                    value={bidAmount}
                                    onChange={(e) => handleBidInputChange(trip.id, e.target.value)}
                                    className="pl-7"
                                    placeholder="Enter amount"
                                    min="1"
                                  />
                                </div>
                                <Button
                                  onClick={() => handleSubmitBid(trip.id, parseFloat(bidAmount))}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Submit"
                                  )}
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: false }))}
                              >
                                Cancel
                              </Button>
                            </div>
                          )
                        ) : existingBid.status === "pending" ? (
                          <p className="text-center text-sm text-muted-foreground">
                            Waiting for traveler's response...
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Card>
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
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}