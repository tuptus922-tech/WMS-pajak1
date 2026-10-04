import './ItemCard.css';

export default function ItemCard({ item, onIssue, actionLabel = 'WYDAJ' }) {
  return (
    <div className={'item-card' + (item.locked ? ' item-card--locked' : '')}>
      <div className="item-card__icon">{item.icon}</div>
      <div className="item-card__body">
        <div className="item-card__name">
          {item.name}
          {item.deal && <span className="item-card__deal">−{item.deal}%</span>}
        </div>
        <div className="item-card__meta">
          {item.category} · razem {item.total} szt. · {item.price}
        </div>
        {item.locked ? (
          <div className="item-card__stats">
            <span className="item-card__stat item-card__stat--locked">🔒 {item.locked}</span>
          </div>
        ) : (
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
            {item.incoming > 0 && (
              <span className="item-card__stat item-card__stat--incoming">
                ● {item.incoming} w drodze
              </span>
            )}
          </div>
        )}
      </div>
      {!item.locked && (
        <button className="item-card__issue-btn" onClick={onIssue}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
