import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import DriverBidCard from "@/components/DriverBidCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function DriverBids() {
  const drivers = [
    {
      driverId: "1",
      driverName: "John Smith",
      rating: 4.8,
      reviewCount: 124,
      vehicleType: "Toyota Hiace Van",
      licensePlate: "ABC-1234",
      bidAmount: 420,
      originalPrice: 450,
    },
    {
      driverId: "2",
      driverName: "Sarah Johnson",
      rating: 4.9,
      reviewCount: 89,
      vehicleType: "Mercedes Sprinter Van",
      licensePlate: "XYZ-5678",
      bidAmount: 450,
      originalPrice: 450,
    },
    {
      driverId: "3",
      driverName: "Michael Chen",
      rating: 4.7,
      reviewCount: 156,
      vehicleType: "Ford Transit Van",
      licensePlate: "DEF-9012",
      bidAmount: 430,
      originalPrice: 450,
    },
  ];

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
              {drivers.length} drivers have bid on your trip to Boston, MA
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <DriverBidCard
                key={driver.driverId}
                {...driver}
                onSelect={() => console.log('Driver selected:', driver.driverId)}
                onViewProfile={() => console.log('View profile:', driver.driverId)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
