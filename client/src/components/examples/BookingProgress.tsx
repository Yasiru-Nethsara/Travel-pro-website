import BookingProgress from '../BookingProgress'

export default function BookingProgressExample() {
  const steps = [
    { id: 1, label: 'Trip Details' },
    { id: 2, label: 'Vehicle' },
    { id: 3, label: 'Stops' },
    { id: 4, label: 'Review' },
    { id: 5, label: 'Confirm' }
  ];

  return <BookingProgress currentStep={2} steps={steps} />
}
