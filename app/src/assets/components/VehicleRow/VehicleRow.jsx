import ProgressBar from '../ProgressBar/ProgressBar';
import './VehicleRow.css';

export default function VehicleRow({ vehicle, onService, onSell }) {
  return (
    <div className="vehicle-row">
      <div className="vehicle-row__icon">{vehicle.icon}</div>
      <div className="vehicle-row__body">
        <div className="vehicle-row__name">
          {vehicle.name}
          <span className={'vehicle-row__status vehicle-row__status--' + vehicle.status}>{vehicle.statusLabel}</span>
        </div>
        <div className="vehicle-row__meta">{vehicle.meta}</div>
        <div className="vehicle-row__cond">
          <ProgressBar value={vehicle.cond} max={100} tone={vehicle.cond < 30 ? 'orange' : vehicle.cond < 60 ? 'amber' : 'green'} />
          <span>{Math.round(vehicle.cond)}%</span>
        </div>
      </div>
      <div className="vehicle-row__actions">
        {vehicle.canService && (
          <button className="vehicle-row__btn" onClick={onService}>
            SERWIS · {vehicle.serviceCost}
          </button>
        )}
        {vehicle.canSell && (
          <button className="vehicle-row__btn vehicle-row__btn--ghost" onClick={onSell}>
            SPRZEDAJ · {vehicle.resale}
          </button>
        )}
      </div>
    </div>
  );
}
