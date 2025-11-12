import TripSummaryCard from '../TripSummaryCard'

export default function TripSummaryCardExample() {
  return (
    <div className="p-8 max-w-md space-y-4">
      <TripSummaryCard
        tripId="1"
        startLocation="New York, NY"
        endLocation="Boston, MA"
        startDate="Dec 15, 2:00 PM"
        endDate="Dec 18, 6:00 PM"
        vehicleType="Van"
        seats={6}
        hasAC={true}
        price={450}
        status="confirmed"
        stops={['Philadelphia, PA', 'Hartford, CT']}
      />
      <TripSummaryCard
        tripId="2"
        startLocation="Los Angeles, CA"
        endLocation="San Francisco, CA"
        startDate="Dec 20, 9:00 AM"
        endDate="Dec 22, 5:00 PM"
        vehicleType="Car"
        seats={4}
        hasAC={true}
        price={320}
        status="pending"
      />
    </div>
  );
}
