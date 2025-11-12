import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Users, Wind, DollarSign } from "lucide-react";
import TripStatusBadge, { type TripStatus } from "./TripStatusBadge";

interface TripSummaryCardProps {
  tripId: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  endDate: string;
  vehicleType: string;
  seats: number;
  hasAC: boolean;
  price: number;
  status: TripStatus;
  stops?: string[];
}

export default function TripSummaryCard({
  tripId,
  startLocation,
  endLocation,
  startDate,
  endDate,
  vehicleType,
  seats,
  hasAC,
  price,
  status,
  stops = [],
}: TripSummaryCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={`trip-summary-${tripId}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{startLocation}</div>
                <div className="text-sm text-muted-foreground">to</div>
                <div className="font-medium truncate">{endLocation}</div>
                {stops.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stops.length} stop{stops.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {startDate} - {endDate}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{vehicleType}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{seats} seats</span>
              </div>
              {hasAC && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Wind className="h-4 w-4" />
                    <span>AC</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            <TripStatusBadge status={status} />
            <div className="flex items-baseline justify-end gap-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{price}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
