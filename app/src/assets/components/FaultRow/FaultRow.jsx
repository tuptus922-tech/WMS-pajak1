import './FaultRow.css';

export default function FaultRow({ fault, isAdmin, onFix }) {
  return (
    <div className="fault-row">
      <div>
        <div className="fault-row__name">{fault.name}</div>
        <div className="fault-row__stats">
          {fault.hasRepair && (
            <span className="fault-row__stat fault-row__stat--repair">
              🛠 {fault.repair} w naprawie
            </span>
          )}
          {fault.hasBroken && (
            <span className="fault-row__stat fault-row__stat--broken">
              ✕ {fault.broken} zepsute
            </span>
          )}
        </div>
      </div>
      {isAdmin && (
        <button className="fault-row__fix-btn" onClick={onFix}>
          NAPRAWIONO +1
        </button>
      )}
    </div>
  );
}
