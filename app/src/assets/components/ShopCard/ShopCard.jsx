import './ShopCard.css';

// Karta czegoś do kupienia lub rozbudowy: pojazd, budynek, osoba z kadry, sprawność.
export default function ShopCard({ icon, title, tag, desc, lines = [], price, buttonLabel, onAction, locked, done, extras = [] }) {
  return (
    <div className={'shop-card' + (locked ? ' shop-card--locked' : '') + (done ? ' shop-card--done' : '')}>
      <div className="shop-card__icon">{icon}</div>
      <div className="shop-card__body">
        <div className="shop-card__title">
          {title}
          {tag && <span className="shop-card__tag">{tag}</span>}
        </div>
        {desc && <div className="shop-card__desc">{desc}</div>}
        {lines.map((ln, i) => (
          <div key={i} className="shop-card__line">
            {ln}
          </div>
        ))}
        {locked && <div className="shop-card__lock">🔒 {locked}</div>}
      </div>
      <div className="shop-card__actions">
        {done && <div className="shop-card__done">{done}</div>}
        {!locked && !done && (
          <button className="shop-card__btn" onClick={onAction}>
            <span>{buttonLabel}</span>
            {price && <span className="shop-card__price">{price}</span>}
          </button>
        )}
        {extras.map((x) => (
          <button key={x.label} className="shop-card__btn shop-card__btn--ghost" onClick={x.onClick}>
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}
