import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign, MapPin, Loader2, Car, Calendar, Users, Wind, Check,
  Phone, User, ArrowRight, Bus, Truck, CheckCircle2, Star, Shield,
  Clock, Map, ChevronRight, Settings
} from "lucide-react";
import { getTrips, submitBid, getMyBids, getDriverDetails, updateDriverDetails, completeTrip, getTripReview } from "@/lib/api";
import type { Trip, DriverBid } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  const [tripReviews, setTripReviews] = useState<Record<string, any>>({});

  // Settings State
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadDriverSettings();
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

      // Load reviews for completed trips
      const completedBids = bidsData.filter(b => b.trip?.status === "completed");
      const reviewsMap: Record<string, any> = {};

      await Promise.all(completedBids.map(async (bid) => {
        if (bid.trip_id) {
          try {
            const review = await getTripReview(bid.trip_id);
            if (review) {
              reviewsMap[bid.trip_id] = review;
            }
          } catch (e) {
            console.error(`Failed to load review for trip ${bid.trip_id}`, e);
          }
        }
      }));
      setTripReviews(reviewsMap);

      const amounts: Record<string, string> = {};
      tripsData.forEach(trip => {
        amounts[trip.id] = trip.max_price.toString();
      });
      setBidAmounts(amounts);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadDriverSettings = async () => {
    try {
      setIsSettingsLoading(true);
      const data = await getDriverDetails();
      if (data) {
        setVehicleType(data.vehicle_type || "");
        setVehicleModel(data.vehicle_model || "");
        setLicensePlate(data.license_plate || "");
        setVehicleColor(data.vehicle_color || "");
      }
    } catch (err) {
      console.error("Failed to load driver settings:", err);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      await updateDriverDetails({
        vehicle_type: vehicleType,
        vehicle_model: vehicleModel,
        license_plate: licensePlate,
        vehicle_color: vehicleColor,
      });

      toast({
        title: "Settings Saved",
        description: "Your vehicle details have been updated.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
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
        vehicle_type: vehicleType || "Car", // Use selected vehicle type or default
        license_plate: licensePlate || "PENDING", // Use selected license plate or default
        vehicle_color: vehicleColor,
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
    } catch (err) {
      console.error("Bid submission error:", err);
      toast({
        title: "Bid Failed",
        description: err instanceof Error ? err.message : "Could not submit bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingBid(null);
    }
  };

  const handleBidInputChange = (tripId: string, value: string) => {
    setBidAmounts(prev => ({ ...prev, [tripId]: value }));
  };

  const handleCompleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to mark this trip as complete?")) return;

    try {
      await completeTrip(tripId);
      toast({
        title: "Trip Completed",
        description: "The trip has been marked as complete.",
      });
      await loadData();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to complete trip",
        variant: "destructive",
      });
    }
  };

  // Filter bids by status
  const acceptedBids = myBids.filter(b => b.status === "accepted" && b.trip?.status !== "completed");
  const pastTrips = myBids.filter(b => b.status === "accepted" && b.trip?.status === "completed");
  const pendingBids = myBids.filter(b => b.status === "pending");

  // Filter requests by vehicle type
  const filteredRequests = requests.filter(trip =>
    !vehicleType || !trip.vehicle_type || trip.vehicle_type === vehicleType
  );

  // Calculate driver rating and total reviews
  const allReviews = Object.values(tripReviews);
  const totalReviews = allReviews.length;
  const driverRating = totalReviews > 0
    ? allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews
    : 0;

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "Bus": return Bus;
      case "Van": return Truck; // Using Truck as proxy for Van if needed, or just Car
      case "Cab": return Car;
      default: return Car;
    }
  };

  const stats = [
    {
      label: "Your Rating",
      value: driverRating ? `${driverRating.toFixed(1)} ⭐` : "No ratings yet",
      subtitle: totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? 's' : ''}` : undefined,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      clickable: true,
      onClick: () => setActiveTab("past")
    },
    {
      label: "Available Trips",
      value: filteredRequests.length.toString(),
      icon: Map,
      color: "text-blue-600",
      bg: "bg-blue-100",
      clickable: false
    },
    {
      label: "Pending Bids",
      value: pendingBids.length.toString(),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-100",
      clickable: false
    },
    {
      label: "Active Trips",
      value: acceptedBids.length.toString(),
      icon: Car,
      color: "text-green-600",
      bg: "bg-green-100",
      clickable: true,
      onClick: () => setActiveTab("accepted")
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
              <Car className="absolute inset-0 m-auto h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Finding nearby trips...</p>
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
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary hover:bg-primary text-white border-none px-3 py-1">
                  Driver Portal
                </Badge>
                {vehicleType && (
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {vehicleType} Driver
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome Back</h1>
              <p className="text-slate-300 max-w-xl">
                Find your next trip, manage your bids, and track your earnings all in one place.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setActiveTab("settings")}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => loadData()}
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              >
                Refresh Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 -mt-20 relative z-20 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                      {stat.subtitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">{stat.subtitle}</p>
                      )}
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
                onClick={loadData}
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
                  value="available"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  Available Trips
                  <Badge className="ml-2 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">
                    {filteredRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="accepted"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  My Trips
                  <Badge className="ml-2 bg-slate-100 text-slate-900 hover:bg-slate-200 border-none">
                    {acceptedBids.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="px-6 py-2.5 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* AVAILABLE TRIPS TAB */}
            <TabsContent value="available" className="space-y-6">
              {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((trip) => {
                    const existingBid = myBids.find(b => b.trip_id === trip.id);
                    const isSubmitting = submittingBid === trip.id;
                    const showInput = showBidInput[trip.id];
                    const bidAmount = bidAmounts[trip.id] || trip.max_price.toString();

                    return (
                      <Card key={trip.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden flex flex-col">
                        {/* Card Header with Map Visual */}
                        <div className="h-32 bg-slate-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-8 text-slate-400">
                              <MapPin className="h-6 w-6" />
                              <div className="h-0.5 w-24 bg-slate-300 relative">
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
                              </div>
                              <MapPin className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-white/90 text-slate-900 hover:bg-white shadow-sm backdrop-blur-sm">
                              {new Date(trip.departure_date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          {/* Route Info */}
                          <div className="mb-6 relative">
                            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                            <div className="space-y-6">
                              <div className="flex items-start gap-4 relative">
                                <div className="w-5 h-5 rounded-full border-4 border-green-500 bg-white z-10 flex-shrink-0"></div>
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Origin</p>
                                  <p className="font-semibold text-slate-900 leading-tight">{trip.origin}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-4 relative">
                                <div className="w-5 h-5 rounded-full border-4 border-red-500 bg-white z-10 flex-shrink-0"></div>
                                <div>
                                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Destination</p>
                                  <p className="font-semibold text-slate-900 leading-tight">{trip.destination}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Trip Specs */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                              <Users className="h-3 w-3 mr-1" />
                              {trip.seats_needed} Seats
                            </Badge>
                            {trip.vehicle_type && (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                <Car className="h-3 w-3 mr-1" />
                                {trip.vehicle_type}
                              </Badge>
                            )}
                            {trip.description?.toLowerCase().includes("ac") && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                <Wind className="h-3 w-3 mr-1" />
                                AC
                              </Badge>
                            )}
                          </div>

                          <div className="mt-auto pt-6 border-t border-slate-100">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Budget</p>
                                <p className="text-2xl font-bold text-primary">${trip.max_price}</p>
                              </div>
                              {existingBid && (
                                <Badge className={`
                                  ${existingBid.status === "accepted" ? "bg-green-100 text-green-700" :
                                    existingBid.status === "rejected" ? "bg-red-100 text-red-700" :
                                      "bg-blue-100 text-blue-700"}
                                `}>
                                  {existingBid.status === "accepted" ? "Bid Accepted" :
                                    existingBid.status === "rejected" ? "Bid Rejected" :
                                      "Bid Pending"}
                                </Badge>
                              )}
                            </div>

                            {!existingBid || existingBid.status === "rejected" ? (
                              !showInput ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: true }))}
                                    disabled={isSubmitting}
                                  >
                                    Custom Bid
                                  </Button>
                                  <Button
                                    className="w-full bg-slate-900 hover:bg-slate-800"
                                    onClick={() => handleAcceptPrice(trip.id, trip.max_price)}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                      <Input
                                        type="number"
                                        value={bidAmount}
                                        onChange={(e) => handleBidInputChange(trip.id, e.target.value)}
                                        className="pl-7"
                                        placeholder="Amount"
                                        min="1"
                                      />
                                    </div>
                                    <Button
                                      onClick={() => handleSubmitBid(trip.id, parseFloat(bidAmount))}
                                      disabled={isSubmitting}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-8 text-xs text-muted-foreground"
                                    onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: false }))}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )
                            ) : existingBid.status === "pending" ? (
                              <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-sm font-medium text-slate-600">You bid ${existingBid.bid_amount}</p>
                              </div>
                            ) : null}
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No trips available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    There are no open trips matching your vehicle type right now. Check back later!
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ACCEPTED TRIPS TAB */}
            <TabsContent value="accepted" className="space-y-6">
              {acceptedBids.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {acceptedBids.map((bid) => {
                    const trip = bid.trip;
                    if (!trip) return null;

                    return (
                      <Card key={bid.id} className="overflow-hidden border-green-200 bg-green-50/30">
                        <div className="bg-green-600 px-6 py-3 flex justify-between items-center text-white">
                          <div className="flex items-center gap-2 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            Trip Confirmed
                          </div>
                          <div className="font-bold text-lg">${bid.bid_amount}</div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="flex flex-col items-center gap-1 mt-1">
                              <div className="w-3 h-3 rounded-full bg-green-600"></div>
                              <div className="w-0.5 h-12 bg-green-200"></div>
                              <div className="w-3 h-3 rounded-full bg-green-600"></div>
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <p className="text-xs text-green-700 font-medium uppercase">Pickup</p>
                                <p className="font-semibold text-slate-900 text-lg">{trip.origin}</p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 font-medium uppercase">Dropoff</p>
                                <p className="font-semibold text-slate-900 text-lg">{trip.destination}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/60 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="font-medium text-slate-900">{new Date(trip.departure_date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                                <Users className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Passengers</p>
                                <p className="font-medium text-slate-900">{trip.seats_needed} People</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-500" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{trip.profiles?.full_name || "Traveler"}</p>
                                <p className="text-xs text-muted-foreground">Passenger</p>
                              </div>
                              {trip.profiles?.phone && (
                                <Button size="sm" variant="outline" className="gap-2" asChild>
                                  <a href={`tel:${trip.profiles.phone}`}>
                                    <Phone className="h-3 w-3" />
                                    Call
                                  </a>
                                </Button>
                              )}
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                              onClick={() => handleCompleteTrip(trip.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Trip as Completed
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No active trips</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You don't have any confirmed trips yet. Browse available trips and start bidding!
                  </p>
                </div>
              )}
            </TabsContent>

            {/* PAST TRIPS TAB */}
            <TabsContent value="past" className="space-y-6">
              {pastTrips.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastTrips.map((bid) => {
                    const trip = bid.trip;
                    if (!trip) return null;
                    const review = tripReviews[trip.id];

                    return (
                      <Card key={bid.id} className="p-6 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            Completed
                          </Badge>
                          <p className="font-bold text-xl text-slate-700">${bid.bid_amount}</p>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{trip.origin}</p>
                            <ArrowRight className="h-4 w-4 text-slate-300 my-1" />
                            <p className="font-semibold text-slate-900">{trip.destination}</p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(trip.departure_date).toLocaleDateString()}</p>
                            <p>{trip.seats_needed} seats</p>
                          </div>
                        </div>

                        {/* Review Display */}
                        {review && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-slate-900">{review.rating}.0</span>
                              </div>
                              {review.comment && (
                                <p className="text-slate-600 text-sm italic">"{review.comment}"</p>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
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

            {/* SETTINGS TAB */}
            <TabsContent value="settings">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Vehicle Details</h2>
                      <p className="text-sm text-muted-foreground">Manage your vehicle information</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-type">Vehicle Type</Label>
                        <Select value={vehicleType} onValueChange={setVehicleType}>
                          <SelectTrigger id="vehicle-type" className="h-11">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Car">Car</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                            <SelectItem value="Bus">Bus</SelectItem>
                            <SelectItem value="Cab">Cab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicle-model">Vehicle Model</Label>
                        <Input
                          id="vehicle-model"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Toyota Prius"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="license-plate">License Plate</Label>
                        <Input
                          id="license-plate"
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          placeholder="e.g. ABC-1234"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicle-color">Vehicle Color</Label>
                        <Input
                          id="vehicle-color"
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          placeholder="e.g. White"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings || isSettingsLoading}
                        className="w-full sm:w-auto min-w-[150px]"
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Vehicle Preview Card */}
                <Card className="p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-50 to-white border-dashed">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
                    {(() => {
                      const Icon = getVehicleIcon(vehicleType);
                      return <Icon className="h-14 w-14 text-primary relative z-10" />;
                    })()}
                  </div>
                  <h3 className="font-bold text-xl text-slate-900">{vehicleType || "Select Type"}</h3>
                  <p className="text-muted-foreground mt-1 font-medium">
                    {vehicleModel || "Vehicle Model"}
                  </p>
                  <Badge variant="outline" className="mt-4 px-4 py-1 text-sm border-slate-300 bg-white">
                    {licensePlate || "NO PLATE"}
                  </Badge>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}