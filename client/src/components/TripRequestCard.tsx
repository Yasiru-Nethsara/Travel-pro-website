import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Users, Wind } from "lucide-react";
import { useState } from "react";

interface TripRequestCardProps {
  tripId: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  endDate: string;
  vehicleType: string;
  seats: number;
  hasAC: boolean;
  calculatedPrice: number;
  onAcceptPrice: () => void;
  onSubmitBid: (amount: number) => void;
}

export default function TripRequestCard({
  tripId,
  startLocation,
  endLocation,
  startDate,
  endDate,
  vehicleType,
  seats,
  hasAC,
  calculatedPrice,
  onAcceptPrice,
  onSubmitBid,
}: TripRequestCardProps) {
  const [bidAmount, setBidAmount] = useState(calculatedPrice.toString());
  const [showBidInput, setShowBidInput] = useState(false);

  const handleSubmitBid = () => {
    const amount = parseFloat(bidAmount);
    if (!isNaN(amount) && amount > 0) {
      onSubmitBid(amount);
    }
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`trip-request-${tripId}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate" data-testid={`text-start-location-${tripId}`}>
                  {startLocation}
                </div>
                <div className="text-sm text-muted-foreground">to</div>
                <div className="font-medium truncate" data-testid={`text-end-location-${tripId}`}>
                  {endLocation}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {startDate} - {endDate}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {vehicleType}
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {seats} seats
              </Badge>
              {hasAC && (
                <Badge variant="secondary">
                  <Wind className="h-3 w-3 mr-1" />
                  AC
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Suggested Price</div>
            <div className="text-2xl font-bold text-primary" data-testid={`text-price-${tripId}`}>
              ${calculatedPrice}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {!showBidInput ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBidInput(true)}
                data-testid={`button-submit-bid-${tripId}`}
              >
                Submit Bid
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={onAcceptPrice}
                data-testid={`button-accept-price-${tripId}`}
              >
                Accept Price
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-7"
                    placeholder="Enter your bid"
                    data-testid={`input-bid-amount-${tripId}`}
                  />
                </div>
                <Button onClick={handleSubmitBid} data-testid={`button-confirm-bid-${tripId}`}>
                  Confirm
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowBidInput(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
