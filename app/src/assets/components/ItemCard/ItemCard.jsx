import './ItemCard.css';

export default function ItemCard({ item, onIssue }) {
  return (
    <div className="item-card">
      <div>
        <div className="item-card__name">{item.name}</div>
        <div className="item-card__meta">
          {item.category} · razem {item.total} szt.
        </div>
        <div className="item-card__stats">
          <span className="item-card__stat item-card__stat--available">
            ● {item.avail} dostępne
          </span>
          {item.hasOut && (
            <span className="item-card__stat item-card__stat--out">
              ● {item.out} w terenie
            </span>
          )}
          {item.hasBad && (
            <span className="item-card__stat item-card__stat--bad">
              ● {item.bad} uszk.
            </span>
          )}
        </div>
      </div>
      <button className="item-card__issue-btn" onClick={onIssue}>
        WYDAJ
      </button>
    </div>
  );
}
