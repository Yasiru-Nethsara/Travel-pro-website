import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DriverBidCard from "@/components/DriverBidCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { acceptBid } from "@/lib/api";
import type { DriverBid } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// This component shows driver bids for a specific trip
// You'll need to pass the trip ID and fetch bids for that trip
export default function DriverBids() {
  const [location] = useLocation();
  const [bids, setBids] = useState<DriverBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract trip ID from URL (you'll need to modify your routing to pass this)
  // For now, this is a placeholder
  const tripId = new URLSearchParams(location.split("?")[1]).get("tripId");

  useEffect(() => {
    if (tripId) {
      loadBidsForTrip();
    } else {
      setError("No trip ID provided");
      setLoading(false);
    }
  }, [tripId]);

  const loadBidsForTrip = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // You'll need to create a new API function to get bids for a specific trip
      // For now, this is a placeholder that returns empty array
      // const data = await getBidsForTrip(tripId!);
      // setBids(data);
      
      setBids([]); // Placeholder
    } catch (err) {
      console.error("Failed to load bids:", err);
      setError(err instanceof Error ? err.message : "Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = async (bidId: string) => {
    try {
      await acceptBid({
        bid_id: bidId,
        pickup_time: new Date().toISOString(), // You should let user select this
      });
      
      toast({
        title: "Driver Selected",
        description: "The driver has been notified and will contact you soon",
      });
      
      // Redirect back to dashboard
      window.location.href = "/traveler-dashboard";
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to select driver",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading driver bids...</p>
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
          <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
            <Link href="/traveler-dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Driver Bids</h1>
            <p className="text-muted-foreground">
              {bids.length} driver{bids.length !== 1 ? "s have" : " has"} bid on your trip
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {bids.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bids.map((bid) => (
                <DriverBidCard
                  key={bid.id}
                  driverId={bid.driver_id}
                  driverName={bid.driver?.full_name || "Unknown Driver"}
                  driverPhoto={bid.driver?.avatar_url || undefined}
                  rating={4.5} // You'll need to add this to your data model
                  reviewCount={0} // You'll need to add this to your data model
                  vehicleType={bid.vehicle_type}
                  licensePlate={bid.license_plate}
                  bidAmount={bid.bid_amount}
                  originalPrice={bid.trip?.max_price || bid.bid_amount}
                  onSelect={() => handleSelectDriver(bid.id)}
                  onViewProfile={() => console.log("View profile:", bid.driver_id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground mb-2">No bids yet</p>
              <p className="text-sm text-muted-foreground">
                Drivers will start bidding on your trip soon
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
