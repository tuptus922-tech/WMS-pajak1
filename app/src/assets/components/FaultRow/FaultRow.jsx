import './FaultRow.css';

export default function FaultRow({ fault, onFix, onScrap }) {
  return (
    <div className="fault-row">
      <div className="fault-row__icon">{fault.icon}</div>
      <div className="fault-row__body">
        <div className="fault-row__name">{fault.name}</div>
        <div className="fault-row__stats">
          {fault.hasRepair && (
            <span className="fault-row__stat fault-row__stat--repair">
              🛠 {fault.repair} do naprawy
            </span>
          )}
          {fault.hasBroken && (
            <span className="fault-row__stat fault-row__stat--broken">
              ✕ {fault.broken} zepsute
            </span>
          )}
        </div>
      </div>
      <div className="fault-row__actions">
        {fault.hasRepair && (
          <button className="fault-row__fix-btn" onClick={onFix}>
            NAPRAW · {fault.cost}
          </button>
        )}
        {fault.hasBroken && (
          <button className="fault-row__fix-btn fault-row__fix-btn--scrap" onClick={onScrap}>
            NA ZŁOM · {fault.scrap}
          </button>
        )}
      </div>
    </div>
  );
}
