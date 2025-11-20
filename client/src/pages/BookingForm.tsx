import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BookingProgress from "@/components/BookingProgress";
import VehicleSelector from "@/components/VehicleSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const steps = [
  { id: 1, label: "Trip Details" },
  { id: 2, label: "Vehicle" },
  { id: 3, label: "Stops" },
  { id: 4, label: "Review" },
  { id: 5, label: "Confirm" },
];

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [hasAC, setHasAC] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  const now = new Date();
  const formattedNow = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"

  const handleNext = () => {
    if (currentStep === 0) {
      if (!startDate || !endDate) {
        setDateError("Both dates are required.");
        return;
      }
      if (new Date(startDate) < new Date()) {
        setDateError("Start date cannot be in the past.");
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setDateError("Return date cannot be before start date.");
        return;
      }
      setDateError(""); // clear error
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

  const handleStartDateChange = (value: string) => {
    setStartDate(value);

    // Automatically adjust endDate if it's before the new startDate
    if (endDate && new Date(endDate) < new Date(value)) {
      setEndDate(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <h1 className="text-3xl font-bold mb-2 text-center">Plan Your Trip</h1>
          <p className="text-muted-foreground text-center mb-8">
            Fill in the details to get started
          </p>

          <BookingProgress currentStep={currentStep} steps={steps} />

          <Card className="p-6 lg:p-8">
            {currentStep === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Trip Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date & Time</Label>
                    <Input
                      id="start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      min={formattedNow}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Return Date & Time</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || formattedNow}
                      data-testid="input-end-date"
                    />
                  </div>
                </div>
                {dateError && (
                  <p className="text-red-500 text-sm mt-2" data-testid="error-date">
                    {dateError}
                  </p>
                )}
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
                    <Label htmlFor="seats">Number of Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="50"
                      defaultValue="4"
                      data-testid="input-seats"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ac">Air Conditioning</Label>
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
                <h2 className="text-2xl font-semibold mb-6">Route & Stops</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-location">Starting Point</Label>
                    <Input
                      id="start-location"
                      placeholder="Enter starting location"
                      data-testid="input-start-location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-location">Destination</Label>
                    <Input
                      id="end-location"
                      placeholder="Enter destination"
                      data-testid="input-end-location"
                    />
                  </div>
                  <div className="bg-muted/30 h-64 rounded-lg flex items-center justify-center text-muted-foreground">
                    Map Integration (Google Maps will be here)
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Review Your Trip</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle</p>
                      <p className="font-medium">{selectedVehicle || "Not selected"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Air Conditioning</p>
                      <p className="font-medium">{hasAC ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Base fare</span>
                      <span>$300</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Distance (250 km)</span>
                      <span>$120</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-border">
                      <span>Total Estimated Price</span>
                      <span className="text-primary">$420</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-semibold mb-6">Confirm Your Trip</h2>
                <p className="text-muted-foreground">
                  Your trip request will be sent to nearby drivers who will submit their bids.
                </p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Estimated Price</p>
                  <p className="text-4xl font-bold text-primary">$420</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  data-testid="button-back"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
                data-testid="button-next"
              >
                {currentStep === steps.length - 1 ? "Confirm Trip" : "Continue"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
