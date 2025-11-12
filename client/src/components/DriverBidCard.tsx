import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Car } from "lucide-react";

interface DriverBidCardProps {
  driverId: string;
  driverName: string;
  driverPhoto?: string;
  rating: number;
  reviewCount: number;
  vehicleType: string;
  licensePlate: string;
  bidAmount: number;
  originalPrice: number;
  onSelect: () => void;
  onViewProfile: () => void;
}

export default function DriverBidCard({
  driverId,
  driverName,
  driverPhoto,
  rating,
  reviewCount,
  vehicleType,
  licensePlate,
  bidAmount,
  originalPrice,
  onSelect,
  onViewProfile,
}: DriverBidCardProps) {
  const discount = originalPrice - bidAmount;
  const discountPercent = Math.round((discount / originalPrice) * 100);

  return (
    <Card className="p-6 hover-elevate" data-testid={`driver-card-${driverId}`}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={driverPhoto} alt={driverName} />
            <AvatarFallback>{driverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-driver-name-${driverId}`}>
              {driverName}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-sm">{rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{vehicleType} • {licensePlate}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Bid Amount</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground" data-testid={`text-bid-amount-${driverId}`}>
                  ${bidAmount}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      ${originalPrice}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {discountPercent}% off
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onViewProfile}
            data-testid={`button-view-profile-${driverId}`}
          >
            View Profile
          </Button>
          <Button 
            variant="default" 
            className="flex-1" 
            onClick={onSelect}
            data-testid={`button-select-driver-${driverId}`}
          >
            Select Driver
          </Button>
        </div>
      </div>
    </Card>
  );
}
