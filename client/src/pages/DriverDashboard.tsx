import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, MapPin, Loader2, Car, Calendar, Users, Wind, Check, Phone, User, ArrowRight, Bus, Truck, CheckCircle2 } from "lucide-react";
import { getTrips, submitBid, getMyBids, getDriverDetails, updateDriverDetails, completeTrip } from "@/lib/api";
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
      label: "Available Trips",
      value: filteredRequests.length.toString(),
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
    {
      label: "Past Trips",
      value: pastTrips.length.toString(),
      icon: CheckCircle2,
      clickable: true,
      onClick: () => setActiveTab("past")
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
    <div className="min-h-screen flex flex-col bg-slate-50">
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
                  className={`p-6 border-slate-200 ${stat.clickable ? 'cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200' : ''}`}
                  onClick={stat.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1 text-slate-900">{stat.value}</p>
                      {stat.clickable && stat.value !== "0" && (
                        <p className="text-xs text-primary mt-2 font-medium">Click to view →</p>
                      )}
                    </div>
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
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
            <TabsList className="mb-6 bg-white border p-1 rounded-xl">
              <TabsTrigger value="available" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Available Trips ({filteredRequests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Accepted Trips ({acceptedBids.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Past Trips ({pastTrips.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* AVAILABLE TRIPS TAB */}
            <TabsContent value="available">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-slate-900">Available Trips</h2>
                <p className="text-muted-foreground">
                  {filteredRequests.length} trip{filteredRequests.length !== 1 ? "s" : ""} available for bidding
                </p>
              </div>

              {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRequests.map((trip) => {
                    const existingBid = myBids.find(b => b.trip_id === trip.id);
                    const isSubmitting = submittingBid === trip.id;
                    const showInput = showBidInput[trip.id];
                    const bidAmount = bidAmounts[trip.id] || trip.max_price.toString();

                    return (
                      <Card key={trip.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 overflow-hidden">
                        <div className="p-6 space-y-6">
                          {/* Header */}
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                              <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                                <span className="truncate">{trip.origin}</span>
                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate">{trip.destination}</span>
                              </div>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground bg-slate-50 p-2 rounded-md">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground bg-slate-50 p-2 rounded-md">
                              <Users className="h-4 w-4" />
                              <span>{trip.seats_needed} seats</span>
                            </div>
                            {trip.vehicle_type && (
                              <div className="flex items-center gap-2 text-primary bg-primary/5 p-2 rounded-md font-medium">
                                <Car className="h-4 w-4" />
                                <span>{trip.vehicle_type}</span>
                              </div>
                            )}
                            {trip.description?.toLowerCase().includes("ac") && (
                              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded-md font-medium">
                                <Wind className="h-4 w-4" />
                                <span>AC</span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Max Budget</div>
                                <div className="text-2xl font-bold text-primary">${trip.max_price}</div>
                              </div>
                            </div>

                            {existingBid && (
                              <div className={`p-3 rounded-lg mb-3 border ${existingBid.status === "accepted"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : existingBid.status === "rejected"
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : "bg-blue-50 border-blue-200 text-blue-700"
                                }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold flex items-center gap-2">
                                    {existingBid.status === "accepted" && <><Check className="h-4 w-4" /> Bid Accepted!</>}
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
                                    className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary"
                                    onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: true }))}
                                    disabled={isSubmitting}
                                  >
                                    Custom Bid
                                  </Button>
                                  <Button
                                    className="flex-1 shadow-md hover:shadow-lg transition-all"
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
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                                    className="w-full text-muted-foreground hover:text-slate-900"
                                    onClick={() => setShowBidInput(prev => ({ ...prev, [trip.id]: false }))}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )
                            ) : existingBid.status === "pending" ? (
                              <p className="text-center text-sm text-muted-foreground bg-slate-50 py-2 rounded-md">
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
                <Card className="p-16 text-center border-dashed border-2">
                  <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Car className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No trips available yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    When travelers post new trips matching your vehicle type, they will appear here instantly.
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
                      <Card key={bid.id} className="p-6 border-2 border-green-200 bg-green-50/30 shadow-sm">
                        <div className="space-y-4">
                          {/* Header with status badge */}
                          <div className="flex items-start justify-between">
                            <Badge className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm">
                              <Check className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Your Bid</div>
                              <div className="text-2xl font-bold text-green-600">${bid.bid_amount}</div>
                            </div>
                          </div>

                          {/* Route Information */}
                          <div className="border-t border-green-200/50 pt-4">
                            <div className="flex items-start gap-3 mb-4">
                              <MapPin className="h-5 w-5 text-green-700 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-lg text-green-900">{trip.origin}</div>
                                <div className="text-sm text-green-700 my-1">to</div>
                                <div className="font-semibold text-lg text-green-900">{trip.destination}</div>
                              </div>
                            </div>

                            {/* Trip Details */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-green-800">
                                <Users className="h-4 w-4" />
                                <span>{trip.seats_needed} seats</span>
                              </div>
                            </div>

                            {/* Traveler Information */}
                            <div className="bg-white/80 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <User className="h-4 w-4 text-green-700" />
                                <span className="font-semibold text-green-900">Traveler Information</span>
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
                                      className="text-primary hover:underline font-medium"
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
                            <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-100">
                              <div className="text-sm font-medium mb-2 text-green-900">Your Vehicle</div>
                              <div className="text-sm text-green-800">
                                {bid.vehicle_type} • {bid.license_plate}
                                {bid.vehicle_color && ` • ${bid.vehicle_color}`}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Traveler
                          </Button>

                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md mt-2"
                            onClick={() => handleCompleteTrip(trip.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete Trip
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-16 text-center border-dashed border-2">
                  <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No accepted bids yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    When travelers accept your bids, they will appear here with full trip details.
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* PAST TRIPS TAB */}
            <TabsContent value="past">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Past Trips</h2>
                <p className="text-muted-foreground">
                  {pastTrips.length} completed trip{pastTrips.length !== 1 ? "s" : ""}
                </p>
              </div>

              {pastTrips.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastTrips.map((bid) => {
                    const trip = bid.trip;
                    if (!trip) return null;

                    return (
                      <Card key={bid.id} className="p-6 border border-slate-200 bg-slate-50/50">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Final Price</div>
                              <div className="text-xl font-bold text-slate-700">${bid.bid_amount}</div>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-start gap-3 mb-4">
                              <MapPin className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="font-semibold text-lg text-slate-900">{trip.origin}</div>
                                <div className="text-sm text-slate-500 my-1">to</div>
                                <div className="font-semibold text-lg text-slate-900">{trip.destination}</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(trip.departure_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="h-4 w-4" />
                                <span>{trip.seats_needed} seats</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-16 text-center border-dashed border-2">
                  <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No past trips</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Completed trips will appear here.
                  </p>
                </Card>
              )}
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="settings">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Driver Settings</h2>
                <p className="text-muted-foreground">
                  Manage your vehicle details and profile
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="p-6 md:col-span-2">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-type">Vehicle Type</Label>
                      <Select value={vehicleType} onValueChange={setVehicleType}>
                        <SelectTrigger id="vehicle-type">
                          <SelectValue placeholder="Select vehicle type" />
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-plate">License Plate</Label>
                      <Input
                        id="license-plate"
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        placeholder="e.g. ABC-1234"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle-color">Vehicle Color</Label>
                      <Input
                        id="vehicle-color"
                        value={vehicleColor}
                        onChange={(e) => setVehicleColor(e.target.value)}
                        placeholder="e.g. White"
                      />
                    </div>

                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings || isSettingsLoading}
                      className="w-full sm:w-auto"
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
                </Card>

                {/* Vehicle Preview Card */}
                <Card className="p-6 flex flex-col items-center justify-center text-center bg-slate-50 border-dashed">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    {(() => {
                      const Icon = getVehicleIcon(vehicleType);
                      return <Icon className="h-16 w-16 text-primary" />;
                    })()}
                  </div>
                  <h3 className="font-semibold text-lg">{vehicleType || "Select Type"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vehicleModel || "Vehicle Model"}
                  </p>
                  <Badge variant="outline" className="mt-3">
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