import ProgressBar from '../ProgressBar/ProgressBar';
import './TripRow.css';

export default function TripRow({ trip }) {
  return (
    <div className="trip-row">
      <div className="trip-row__icon">{trip.icon}</div>
      <div className="trip-row__body">
        <div className="trip-row__title">{trip.title}</div>
        <div className="trip-row__meta">{trip.meta}</div>
        <ProgressBar value={trip.progress} tone={trip.returning ? 'amber' : 'green'} />
      </div>
      <div className="trip-row__left">{trip.left}</div>
    </div>
  );
}
