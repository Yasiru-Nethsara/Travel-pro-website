import TripRequestCard from '../TripRequestCard'

export default function TripRequestCardExample() {
  return (
    <div className="p-8 max-w-md">
      <TripRequestCard
        tripId="1"
        startLocation="New York, NY"
        endLocation="Boston, MA"
        startDate="Dec 15, 2:00 PM"
        endDate="Dec 18, 6:00 PM"
        vehicleType="Van"
        seats={6}
        hasAC={true}
        calculatedPrice={450}
        onAcceptPrice={() => console.log('Price accepted')}
        onSubmitBid={(amount) => console.log('Bid submitted:', amount)}
      />
    </div>
  );
}
