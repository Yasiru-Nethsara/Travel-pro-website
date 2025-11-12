import { Card } from "@/components/ui/card";
import { Bus, Car } from "lucide-react";
import { SiMercedes } from "react-icons/si";

interface VehicleSelectorProps {
  selectedVehicle: string | null;
  onSelect: (vehicle: string) => void;
}

const vehicles = [
  { id: "car", name: "Car", icon: Car, capacity: "1-4 seats" },
  { id: "van", name: "Van", icon: SiMercedes, capacity: "5-8 seats" },
  { id: "bus", name: "Bus", icon: Bus, capacity: "9+ seats" },
];

export default function VehicleSelector({ selectedVehicle, onSelect }: VehicleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => {
        const Icon = vehicle.icon;
        const isSelected = selectedVehicle === vehicle.id;

        return (
          <Card
            key={vehicle.id}
            className={`
              p-6 cursor-pointer transition-all hover-elevate active-elevate-2
              ${isSelected ? "border-primary border-2" : ""}
            `}
            onClick={() => onSelect(vehicle.id)}
            data-testid={`vehicle-option-${vehicle.id}`}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <div className={`p-4 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                <Icon className={`h-8 w-8 ${isSelected ? "text-primary" : "text-foreground"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{vehicle.capacity}</p>
              </div>
              {isSelected && (
                <div className="w-full h-1 bg-primary rounded-full" />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
