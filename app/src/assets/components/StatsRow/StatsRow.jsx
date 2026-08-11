import './StatsRow.css';

export default function StatsRow({ available, out, broken }) {
  return (
    <div className="stats-row">
      <div className="stats-row__card">
        <div className="stats-row__value stats-row__value--green">
          {available}
        </div>
        <div className="stats-row__label">na stanie</div>
      </div>
      <div className="stats-row__card">
        <div className="stats-row__value stats-row__value--blue">{out}</div>
        <div className="stats-row__label">w terenie</div>
      </div>
      <div className="stats-row__card">
        <div className="stats-row__value stats-row__value--orange">
          {broken}
        </div>
        <div className="stats-row__label">uszkodzone</div>
      </div>
    </div>
  );
}
