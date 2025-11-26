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
import { Loader2, Ticket, MapPin, Users, Car, CheckCircle2 } from "lucide-react";
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
    // Validation for Step 1 (Trip Details)
    if (currentStep === 0) {
      if (!formData.startLocation || !formData.endLocation || !formData.startDate) {
        toast({
          title: "Missing Details",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (formData.endDate && formData.endDate < formData.startDate) {
        toast({
          title: "Invalid Dates",
          description: "Return date cannot be before departure date.",
          variant: "destructive",
        });
        return;
      }
    }

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

    if (!formData.startLocation || !formData.endLocation) {
      toast({
        title: "Error",
        description: "Please enter both start and end locations",
        variant: "destructive",
      });
      return;
    }

    const seats = parseInt(formData.seats);
    const maxPrice = parseFloat(formData.maxPrice);

    if (isNaN(seats) || seats < 1) {
      toast({
        title: "Error",
        description: "Please enter a valid number of seats",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(maxPrice) || maxPrice < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid max price",
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
        departure_date: new Date(formData.startDate).toISOString(),
        seats_needed: seats,
        max_price: maxPrice,
        vehicle_type: selectedVehicle || "Car",
        description: `${selectedVehicle}`,
      });

      // Notify all drivers about the new trip
      await notifyDriversOfTrip(trip.id);

      toast({
        title: "Success!",
        description: "Your trip has been posted and drivers have been notified!",
      });

      // Redirect to traveler dashboard
      setTimeout(() => setLocation("/traveler-dashboard"), 2000);
    } catch (error: any) {
      console.error("Trip creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm trip",
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Plan Your Trip</h1>
            <p className="text-muted-foreground">
              Fill in the details and connect with nearby drivers
            </p>
          </div>

          <BookingProgress currentStep={currentStep} steps={steps} />

          <Card className="p-6 lg:p-8 mt-8 shadow-lg border-slate-200">
            {currentStep === 0 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-location">Start Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="start-location"
                        className="pl-9"
                        placeholder="e.g., New York, NY"
                        value={formData.startLocation}
                        onChange={(e) => handleInputChange("startLocation", e.target.value)}
                        data-testid="input-start-location"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-location">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="end-location"
                        className="pl-9"
                        placeholder="e.g., Boston, MA"
                        value={formData.endLocation}
                        onChange={(e) => handleInputChange("endLocation", e.target.value)}
                        data-testid="input-end-location"
                      />
                    </div>
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
                      min={formData.startDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-semibold mb-6">Select Vehicle</h2>
                <VehicleSelector
                  selectedVehicle={selectedVehicle}
                  onSelect={setSelectedVehicle}
                />
                <div className="space-y-4 pt-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
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
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-semibold mb-6">Additional Details</h2>
                <p className="text-muted-foreground">
                  Add any special requests or notes for drivers
                </p>
                <div className="bg-muted/30 h-48 rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed">
                  <MapPin className="h-8 w-8 mb-2 opacity-50" />
                  <p>Map and stops configuration</p>
                  <p className="text-xs mt-1">Coming soon with Google Maps integration</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-semibold mb-6 text-center">Review Your Trip</h2>

                {/* Trip Ticket Design */}
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 relative shadow-sm mx-auto max-w-md">
                  {/* Ticket Notches */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r-2 border-slate-300" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l-2 border-slate-300" />

                  <div className="text-center mb-8 border-b border-slate-100 pb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Trip Ticket</h3>
                    <p className="text-sm text-muted-foreground">Ready to post</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1"><div className="w-2 h-2 rounded-full bg-green-500" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">From</p>
                        <p className="font-medium text-slate-900">{formData.startLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1"><div className="w-2 h-2 rounded-full bg-red-500" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">To</p>
                        <p className="font-medium text-slate-900">{formData.endLocation}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle</p>
                        <div className="flex items-center gap-1 font-medium">
                          <Car className="h-3 w-3" />
                          {selectedVehicle || "Any"}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Seats</p>
                        <div className="flex items-center gap-1 font-medium">
                          <Users className="h-3 w-3" />
                          {formData.seats}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-2 border-t-2 border-dashed border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Max Budget</span>
                        <span className="text-2xl font-bold text-primary">${formData.maxPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Confirm & Post Trip</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Once you confirm, your trip will be posted and all verified drivers in the system will be notified instantly.
                </p>

                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 max-w-sm mx-auto mt-8">
                  <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wider">Your Maximum Budget</p>
                  <p className="text-5xl font-bold text-primary animate-pulse">${formData.maxPrice}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 max-w-md mx-auto flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Drivers will be automatically notified about your trip
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
                className="flex-1 shadow-lg hover:shadow-xl transition-all"
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