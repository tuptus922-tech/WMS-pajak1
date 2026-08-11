import './ActionButtons.css';

export default function ActionButtons({ onIssue, onGoTeren }) {
  return (
    <div className="action-buttons">
      <button className="action-buttons__primary" onClick={onIssue}>
        WYDAJ ↗
      </button>
      <button className="action-buttons__secondary" onClick={onGoTeren}>
        PRZYJMIJ ↙
      </button>
    </div>
  );
}
