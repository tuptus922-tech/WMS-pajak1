import './LoanRow.css';

export default function LoanRow({ loan, onReceive }) {
  return (
    <div className="loan-row">
      <div>
        <div className="loan-row__title">
          {loan.qty}× {loan.item}
        </div>
        <div className="loan-row__meta">
          {loan.who} · od {loan.date}
        </div>
      </div>
      <button className="loan-row__receive-btn" onClick={onReceive}>
        PRZYJMIJ
      </button>
    </div>
  );
}
