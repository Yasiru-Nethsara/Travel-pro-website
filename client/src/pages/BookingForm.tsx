import { useState } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookingProgress from "@/components/BookingProgress";
import VehicleSelector from "@/components/VehicleSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { createTrip, notifyDriversOfTrip } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, label: "Trip Details" },
  { id: 2, label: "Vehicle" },
  { id: 3, label: "Stops" },
  { id: 4, label: "Review" },
  { id: 5, label: "Confirm" },
];

export default function BookingForm() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [hasAC, setHasAC] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: "",
    startDate: "",
    endDate: "",
    seats: "4",
    maxPrice: "500",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmTrip = async () => {
    console.log("Confirm clicked", { selectedVehicle, formData });

    /*if (!selectedVehicle) {
      toast({
        title: "Error",
        description: "Please select a vehicle type",
        variant: "destructive",
      });
      return;
    }*/

    if (!formData.startLocation || !formData.endLocation) {
      toast({
        title: "Error",
        description: "Please enter both start and end locations",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the trip
      const trip = await createTrip({
        origin: formData.startLocation,
        origin_lat: 0, // You'll need to implement geocoding
        origin_lng: 0,
        destination: formData.endLocation,
        destination_lat: 0,
        destination_lng: 0,
        departure_date: formData.startDate,
        seats_needed: parseInt(formData.seats),
        max_price: parseFloat(formData.maxPrice),
        description: `${selectedVehicle}${hasAC ? " with AC" : ""}`,
      });

      // Notify all drivers about the new trip
      await notifyDriversOfTrip(trip.id);

      toast({
        title: "Success!",
        description: "Your trip has been posted and drivers have been notified!",
      });

      // Redirect to traveler dashboard
      setTimeout(() => setLocation("/traveler-dashboard"), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm trip",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Plan Your Trip</h1>
          <p className="text-muted-foreground text-center mb-8">
            Fill in the details and connect with nearby drivers
          </p>

          <BookingProgress currentStep={currentStep} steps={steps} />

          <Card className="p-6 lg:p-8">
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-location">Start Location</Label>
                    <Input
                      id="start-location"
                      placeholder="e.g., New York, NY"
                      value={formData.startLocation}
                      onChange={(e) => handleInputChange("startLocation", e.target.value)}
                      data-testid="input-start-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-location">Destination</Label>
                    <Input
                      id="end-location"
                      placeholder="e.g., Boston, MA"
                      value={formData.endLocation}
                      onChange={(e) => handleInputChange("endLocation", e.target.value)}
                      data-testid="input-end-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Departure Date & Time</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Return Date & Time</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Select Vehicle</h2>
                <VehicleSelector
                  selectedVehicle={selectedVehicle}
                  onSelect={setSelectedVehicle}
                />
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seats">Number of Seats Needed</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.seats}
                      onChange={(e) => handleInputChange("seats", e.target.value)}
                      data-testid="input-seats"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ac">Air Conditioning Required</Label>
                    <Switch
                      id="ac"
                      checked={hasAC}
                      onCheckedChange={setHasAC}
                      data-testid="switch-ac"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Additional Details</h2>
                <p className="text-muted-foreground">
                  Add any special requests or notes for drivers
                </p>
                <div className="bg-muted/30 h-32 rounded-lg p-4 flex items-center justify-center text-muted-foreground">
                  <p>Map and stops will be implemented with Google Maps API</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Review Your Trip</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-medium">{formData.startLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-medium">{formData.endLocation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{selectedVehicle || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-medium">{formData.seats}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Maximum Price</span>
                      <span className="text-primary">${formData.maxPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Confirm & Post Trip</h2>
                <p className="text-muted-foreground">
                  Once you confirm, your trip will be posted and all verified drivers in the system will be notified instantly.
                </p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Your Maximum Budget</p>
                  <p className="text-4xl font-bold text-primary">${formData.maxPrice}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                  ✓ Drivers will be automatically notified about your trip
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isSubmitting}
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={currentStep === steps.length - 1 ? handleConfirmTrip : handleNext}
                className="flex-1"
                disabled={isSubmitting}
                data-testid="button-next"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting Trip...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  "Confirm & Post Trip"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}