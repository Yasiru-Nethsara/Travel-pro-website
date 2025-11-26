import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Loader2, MapPin, Calendar, Users, DollarSign, Check, X,
  Trash2, CheckCircle2, Map, Clock, Shield, ChevronRight, Car, Star
} from "lucide-react";
import { Link } from "wouter";
import { getMyTrips, getBidsForTrip, acceptBid, rejectBid, deleteTrip, completeTrip } from "@/lib/api";
import type { Trip, DriverBid } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import RateDriverDialog from "@/components/RateDriverDialog";

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState("active");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripBids, setTripBids] = useState<Record<string, DriverBid[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
  const { toast } = useToast();

  // Rating Dialog State
  const [ratingDialog, setRatingDialog] = useState<{
    isOpen: boolean;
    tripId: string;
    driverId: string;
    driverName: string;
  }>({
    isOpen: false,
    tripId: "",
    driverId: "",
    driverName: "",
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyTrips();
      setTrips(data);

      // Load bids for each open or booked trip
      const bidsMap: Record<string, DriverBid[]> = {};
      for (const trip of data.filter(t => t.status === "open" || t.status === "booked")) {
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
    // Find the accepted bid to get driver details
    const bids = tripBids[tripId] || [];
    const acceptedBid = bids.find(b => b.status === "accepted");

    if (acceptedBid) {
      // Open rating dialog
      setRatingDialog({
        isOpen: true,
        tripId,
        driverId: acceptedBid.driver_id,
        driverName: acceptedBid.driver?.full_name || "Driver",
      });
    } else {
      // Fallback if no driver found (shouldn't happen for booked trips)
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

  const stats = [
    {
      label: "Active Trips",
      value: activeTrips.length.toString(),
      icon: Map,
      color: "text-blue-600",
      bg: "bg-blue-100",
      clickable: true,
      onClick: () => setActiveTab("active")
    },
    {
      label: "New Bids",
      value: totalPendingBids.toString(),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      clickable: true,
      onClick: () => setActiveTab("active")
    },
    {
      label: "Completed",
      value: pastTrips.length.toString(),
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-100",
      clickable: true,
      onClick: () => setActiveTab("past")
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <MapPin className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Loading your journeys...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-28 pb-32 px-4 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1">
                  Traveler Portal
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Journeys</h1>
              <p className="text-slate-300 max-w-xl">
                Manage your trips, review driver bids, and track your travel history.
              </p>
            </div>

            <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12 px-6 text-lg">
              <Link href="/book-trip">
                <Plus className="h-5 w-5 mr-2" />
                Plan New Trip
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 -mt-20 relative z-20 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className={`border-none shadow-lg overflow-hidden relative group ${stat.clickable ? 'cursor-pointer hover:-translate-y-1 transition-transform duration-300' : ''}`}
                  onClick={stat.onClick}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      {stat.clickable && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <div className={`h-1 w-full ${stat.bg.replace('bg-', 'bg-gradient-to-r from-transparent via-')}`} />
                </Card>
              );
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-700">
              <Shield className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
              <button
                onClick={loadTrips}
                className="ml-auto text-sm font-bold underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="bg-white p-1.5 rounded-xl shadow-sm border inline-flex">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger
                  value="active"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  Active Trips
                  <Badge className="ml-2 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">
                    {activeTrips.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  Past Trips
                  <Badge className="ml-2 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">
                    {pastTrips.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="space-y-6">
              {activeTrips.length > 0 ? (
                <div className="grid gap-6">
                  {activeTrips.map((trip) => {
                    const bids = tripBids[trip.id] || [];
                    const pendingBids = bids.filter(b => b.status === "pending");
                    const acceptedBid = bids.find(b => b.status === "accepted");

                    return (
                      <Card key={trip.id} className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow duration-300">
                        {/* Trip Header with Map Visual */}
                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-8 text-slate-400">
                              <MapPin className="h-6 w-6" />
                              <div className="h-0.5 w-32 bg-slate-300 relative">
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
                              </div>
                              <MapPin className="h-6 w-6" />
                            </div>
                          </div>

                          <div className="absolute top-4 left-4">
                            <Badge className={`
                              ${trip.status === "booked" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}
                              text-white border-none shadow-sm
                            `}>
                              {trip.status === "booked" ? "Booked & Confirmed" : "Open for Bids"}
                            </Badge>
                          </div>

                          <div className="absolute top-4 right-4 flex gap-2">
                            {trip.status === "open" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 bg-red-500/90 hover:bg-red-600 text-white border-none shadow-sm backdrop-blur-sm"
                                onClick={() => handleDeleteTrip(trip.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            )}
                            {trip.status === "booked" && (
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                onClick={() => handleCompleteTrip(trip.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-8">
                            {/* Trip Details Section */}
                            <div className="flex-1">
                              <div className="flex items-start gap-4 mb-6 relative">
                                <div className="flex flex-col items-center gap-1 mt-1">
                                  <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                                  <div className="w-0.5 h-16 bg-slate-200"></div>
                                  <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                                </div>
                                <div className="space-y-6 flex-1">
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Origin</p>
                                    <p className="font-bold text-xl text-slate-900">{trip.origin}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Destination</p>
                                    <p className="font-bold text-xl text-slate-900">{trip.destination}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1">
                                  <Calendar className="h-3 w-3 mr-2" />
                                  {new Date(trip.departure_date).toLocaleDateString()}
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1">
                                  <Users className="h-3 w-3 mr-2" />
                                  {trip.seats_needed} Seats
                                </Badge>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Max ${trip.max_price}
                                </Badge>
                              </div>
                            </div>

                            {/* Bids Section */}
                            <div className="flex-1 md:border-l md:pl-8 border-slate-100">
                              {acceptedBid ? (
                                <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                                  <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Driver Assigned
                                  </div>

                                  <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                                      {(acceptedBid.driver?.full_name || "D")[0]}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{acceptedBid.driver?.full_name || "Driver"}</p>
                                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Car className="h-3 w-3" />
                                        {acceptedBid.vehicle_type} • {acceptedBid.license_plate}
                                      </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                      <p className="text-2xl font-bold text-green-600">${acceptedBid.bid_amount}</p>
                                    </div>
                                  </div>

                                  {acceptedBid.notes && (
                                    <div className="bg-white/60 p-3 rounded-lg text-sm text-slate-600 italic">
                                      "{acceptedBid.notes}"
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                      Driver Bids
                                      {pendingBids.length > 0 && (
                                        <Badge className="bg-primary text-white">{pendingBids.length}</Badge>
                                      )}
                                    </h4>
                                  </div>

                                  {pendingBids.length > 0 ? (
                                    <div className="space-y-3">
                                      {pendingBids.map((bid) => (
                                        <div
                                          key={bid.id}
                                          className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                {(bid.driver?.full_name || "D")[0]}
                                              </div>
                                              <div>
                                                <p className="font-semibold text-slate-900">{bid.driver?.full_name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                                  <span>4.8</span>
                                                  <span>•</span>
                                                  <span>{bid.vehicle_type}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-bold text-lg text-slate-900">${bid.bid_amount}</p>
                                              {bid.bid_amount < trip.max_price && (
                                                <p className="text-xs text-green-600 font-medium">
                                                  Save ${trip.max_price - bid.bid_amount}
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          {bid.notes && (
                                            <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg">
                                              "{bid.notes}"
                                            </p>
                                          )}

                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              className="flex-1 h-9 text-xs border-slate-200 hover:bg-slate-50 hover:text-red-600 hover:border-red-200"
                                              onClick={() => handleRejectBid(bid.id)}
                                            >
                                              Decline
                                            </Button>
                                            <Button
                                              className="flex-1 h-9 text-xs bg-slate-900 hover:bg-slate-800"
                                              onClick={() => handleAcceptBid(bid.id)}
                                              disabled={acceptingBid === bid.id}
                                            >
                                              {acceptingBid === bid.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                              ) : (
                                                "Accept Offer"
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                      <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                      <p className="text-sm font-medium text-slate-900">Waiting for drivers</p>
                                      <p className="text-xs text-muted-foreground">Bids will appear here soon</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Map className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No active trips</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Ready to go somewhere? Start planning your next adventure now.
                  </p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Link href="/book-trip">
                      <Plus className="h-5 w-5 mr-2" />
                      Plan a Trip
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastTrips.map((trip) => (
                    <Card key={trip.id} className="p-6 opacity-75 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          Completed
                        </Badge>
                        <p className="font-bold text-xl text-slate-700">${trip.max_price}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            <div className="w-0.5 h-8 bg-slate-200"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-slate-900">{trip.origin}</p>
                            <p className="font-medium text-slate-900">{trip.destination}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-slate-100">
                          <Calendar className="h-4 w-4" />
                          {new Date(trip.departure_date).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No trip history</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your completed trips will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <RateDriverDialog
        isOpen={ratingDialog.isOpen}
        onClose={() => setRatingDialog(prev => ({ ...prev, isOpen: false }))}
        tripId={ratingDialog.tripId}
        driverId={ratingDialog.driverId}
        driverName={ratingDialog.driverName}
        onSuccess={() => {
          loadTrips();
          setRatingDialog(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}