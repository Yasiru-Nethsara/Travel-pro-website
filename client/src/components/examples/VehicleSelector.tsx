import { useState } from 'react'
import VehicleSelector from '../VehicleSelector'

export default function VehicleSelectorExample() {
  const [selected, setSelected] = useState<string | null>('van');

  return (
    <div className="p-8">
      <VehicleSelector 
        selectedVehicle={selected} 
        onSelect={(vehicle) => {
          setSelected(vehicle);
          console.log('Selected vehicle:', vehicle);
        }} 
      />
    </div>
  );
}
