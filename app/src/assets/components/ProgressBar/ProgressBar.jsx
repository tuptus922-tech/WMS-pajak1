import './ProgressBar.css';

export default function ProgressBar({ value, max = 1, tone = 'green', label }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div className={'progress-bar progress-bar--' + tone}>
      <div className="progress-bar__fill" style={{ width: pct + '%' }} />
      {label && <span className="progress-bar__label">{label}</span>}
    </div>
  );
}
