import DriverBidCard from '../DriverBidCard'

export default function DriverBidCardExample() {
  return (
    <div className="p-8 max-w-md">
      <DriverBidCard
        driverId="1"
        driverName="John Smith"
        rating={4.8}
        reviewCount={124}
        vehicleType="Toyota Hiace Van"
        licensePlate="ABC-1234"
        bidAmount={450}
        originalPrice={500}
        onSelect={() => console.log('Driver selected')}
        onViewProfile={() => console.log('View profile clicked')}
      />
    </div>
  );
}
