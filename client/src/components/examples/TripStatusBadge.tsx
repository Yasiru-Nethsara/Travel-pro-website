import TripStatusBadge from '../TripStatusBadge'

export default function TripStatusBadgeExample() {
  return (
    <div className="p-8 flex flex-wrap gap-2">
      <TripStatusBadge status="pending" />
      <TripStatusBadge status="confirmed" />
      <TripStatusBadge status="advance_paid" />
      <TripStatusBadge status="completed" />
      <TripStatusBadge status="cancelled" />
    </div>
  );
}
