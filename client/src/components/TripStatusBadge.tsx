import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, DollarSign, XCircle } from "lucide-react";

export type TripStatus = "pending" | "confirmed" | "advance_paid" | "completed" | "cancelled";

interface TripStatusBadgeProps {
  status: TripStatus;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    variant: "default" as const,
    icon: CheckCircle,
  },
  advance_paid: {
    label: "Advance Paid",
    variant: "default" as const,
    icon: DollarSign,
  },
  completed: {
    label: "Completed",
    variant: "secondary" as const,
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    variant: "secondary" as const,
    icon: XCircle,
  },
};

export default function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} data-testid={`badge-status-${status}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
