import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Star, MapPin, Loader2, Car, Calendar, Users, Wind, Check, Phone, Mail, User } from "lucide-react";
import { getTrips, submitBid, getMyBids } from "@/lib/api";
import type { Trip, DriverBid } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("available");
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
      
      console.log("Loaded bids data:", bidsData); // Debug log
      
      setRequests(tripsData);
      setMyBids(bidsData);
      
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

  // Filter bids by status
  const acceptedBids = myBids.filter(b => b.status === "accepted");
  const pendingBids = myBids.filter(b => b.status === "pending");

  const stats = [
    { 
      label: "Available Trips", 
      value: requests.length.toString(), 
      icon: Car,
      clickable: false 
    },
    { 
      label: "Pending Bids", 
      value: pendingBids.length.toString(), 
      icon: DollarSign,
      clickable: false 
    },
    { 
      label: "Accepted Bids", 
      value: acceptedBids.length.toString(), 
      icon: Check,
      clickable: true,
      onClick: () => setActiveTab("accepted")
    },
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
              Browse available trips and manage your bookings
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.label} 
                  className={`p-6 ${stat.clickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      {stat.clickable && stat.value !== "0" && (
                        <p className="text-xs text-primary mt-2">Click to view →</p>
                      )}
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="available">
                Available Trips ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                My Accepted Trips ({acceptedBids.length})
              </TabsTrigger>
            </TabsList>

            {/* AVAILABLE TRIPS TAB */}
            <TabsContent value="available">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Available Trips</h2>
                <p className="text-muted-foreground">
                  {requests.length} trip{requests.length !== 1 ? "s" : ""} available for bidding
                </p>
              </div>

              {requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.map((trip) => {
                    const existingBid = myBids.find(b => b.trip_id === trip.id);
                    const isSubmitting = submittingBid === trip.id;
                    const showInput = showBidInput[trip.id];
                    const bidAmount = bidAmounts[trip.id] || trip.max_price.toString();

                    return (
                      <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{trip.origin}</div>
                              <div className="text-sm text-muted-foreground">to</div>
                              <div className="font-medium truncate">{trip.destination}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                          </div>

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

                          <div className="border-t border-border pt-4">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Max Budget</div>
                                <div className="text-2xl font-bold text-primary">${trip.max_price}</div>
                              </div>
                            </div>

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
            </TabsContent>

            {/* ACCEPTED TRIPS TAB */}
            <TabsContent value="accepted">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">My Accepted Trips</h2>
                <p className="text-muted-foreground">
                  {acceptedBids.length} trip{acceptedBids.length !== 1 ? "s" : ""} where your bid was accepted
                </p>
              </div>

              {acceptedBids.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {acceptedBids.map((bid) => {
                    const trip = bid.trip;
                    
                    // Debug log to see what we're getting
                    console.log("Rendering bid:", bid.id, "Trip data:", trip);
                    
                    if (!trip) {
                      return (
                        <Card key={bid.id} className="p-6 border-2 border-yellow-200 bg-yellow-50/30">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Trip details not available for bid #{bid.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Bid Amount: ${bid.bid_amount}
                            </p>
                          </div>
                        </Card>
                      );
                    }

                    return (
                      <Card key={bid.id} className="p-6 border-2 border-green-200 bg-green-50/30">
                        <div className="space-y-4">
                          {/* Header with status badge */}
                          <div className="flex items-start justify-between">
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <Check className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Your Bid</div>
                              <div className="text-2xl font-bold text-green-600">${bid.bid_amount}</div>
                            </div>
                          </div>

                          {/* Route Information */}
                          <div className="border-t pt-4">
                            <div className="flex items-start gap-3 mb-4">
                              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-lg">{trip.origin}</div>
                                <div className="text-sm text-muted-foreground my-1">to</div>
                                <div className="font-semibold text-lg">{trip.destination}</div>
                              </div>
                            </div>

                            {/* Trip Details */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{trip.seats_needed} seats</span>
                              </div>
                            </div>

                            {/* Traveler Information */}
                            <div className="bg-white rounded-lg p-4 border">
                              <div className="flex items-center gap-2 mb-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">Traveler Information</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>{trip.profiles?.full_name || "Traveler"}</span>
                                </div>
                                {trip.profiles?.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a 
                                      href={`tel:${trip.profiles.phone}`}
                                      className="text-primary hover:underline"
                                    >
                                      {trip.profiles.phone}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Your Bid Details */}
                            {bid.notes && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-sm font-medium text-blue-900 mb-1">Your Note:</div>
                                <div className="text-sm text-blue-800">{bid.notes}</div>
                              </div>
                            )}

                            {/* Vehicle Details */}
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <div className="text-sm font-medium mb-2">Your Vehicle</div>
                              <div className="text-sm text-muted-foreground">
                                {bid.vehicle_type} • {bid.license_plate}
                                {bid.vehicle_color && ` • ${bid.vehicle_color}`}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button className="w-full" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Traveler
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-16 text-center">
                  <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No accepted bids yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    When travelers accept your bids, they will appear here with full trip details.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}