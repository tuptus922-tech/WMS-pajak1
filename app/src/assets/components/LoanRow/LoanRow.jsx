import ProgressBar from '../ProgressBar/ProgressBar';
import './LoanRow.css';

export default function LoanRow({ loan, onReceive }) {
  return (
    <div className={'loan-row' + (onReceive ? ' loan-row--ready' : '')}>
      <div className="loan-row__body">
        <div className="loan-row__title">
          {loan.qty}× {loan.item}
        </div>
        <div className="loan-row__meta">
          {loan.who} · od {loan.date}
        </div>
        {loan.progress != null && <ProgressBar value={loan.progress} tone="blue" />}
      </div>
      {onReceive ? (
        <button className="loan-row__receive-btn" onClick={onReceive}>
          PRZYJMIJ
        </button>
      ) : (
        <div className="loan-row__left">{loan.left}</div>
      )}
    </div>
  );
}
