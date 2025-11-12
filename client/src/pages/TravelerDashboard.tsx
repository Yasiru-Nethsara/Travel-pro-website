import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TripSummaryCard from "@/components/TripSummaryCard";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function TravelerDashboard() {
  const [activeTab, setActiveTab] = useState("active");

  const activeTrips = [
    {
      tripId: "1",
      startLocation: "New York, NY",
      endLocation: "Boston, MA",
      startDate: "Dec 15, 2:00 PM",
      endDate: "Dec 18, 6:00 PM",
      vehicleType: "Van",
      seats: 6,
      hasAC: true,
      price: 450,
      status: "confirmed" as const,
      stops: ["Philadelphia, PA"],
    },
    {
      tripId: "2",
      startLocation: "Los Angeles, CA",
      endLocation: "San Diego, CA",
      startDate: "Dec 20, 10:00 AM",
      endDate: "Dec 20, 8:00 PM",
      vehicleType: "Car",
      seats: 4,
      hasAC: true,
      price: 180,
      status: "pending" as const,
    },
  ];

  const pastTrips = [
    {
      tripId: "3",
      startLocation: "Miami, FL",
      endLocation: "Orlando, FL",
      startDate: "Nov 10, 9:00 AM",
      endDate: "Nov 12, 5:00 PM",
      vehicleType: "Van",
      seats: 7,
      hasAC: true,
      price: 280,
      status: "completed" as const,
    },
  ];

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
                  <TripSummaryCard key={trip.tripId} {...trip} />
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
                  <TripSummaryCard key={trip.tripId} {...trip} />
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
