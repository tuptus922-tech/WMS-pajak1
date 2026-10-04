import './OrderCard.css';

export default function OrderCard({ order, onSend, onDismiss, onAccept }) {
  return (
    <div className={'order-card order-card--' + order.kind}>
      <div className="order-card__head">
        <div className="order-card__icon">{order.icon}</div>
        <div className="order-card__who">
          <div className="order-card__client">{order.client}</div>
          <div className="order-card__place">
            📍 {order.place} · {order.km} km
          </div>
        </div>
        {order.kind !== 'normal' && <div className="order-card__badge">{order.kindLabel}</div>}
      </div>

      <div className="order-card__lines">
        {order.lines.map((ln) => (
          <div key={ln.id} className={'order-card__line' + (ln.ok ? '' : ' order-card__line--missing')}>
            <span>
              {ln.icon} {ln.qty}× {ln.name}
            </span>
            <span className="order-card__have">{ln.ok ? '✓' : `masz ${ln.have}`}</span>
          </div>
        ))}
      </div>

      <div className="order-card__info">
        <span>{order.info}</span>
        <span className={'order-card__timer' + (order.urgent ? ' order-card__timer--urgent' : '')}>
          ⏳ {order.left}
        </span>
      </div>

      <div className="order-card__foot">
        <div className="order-card__payout">+{order.payout}</div>
        <div className="order-card__actions">
          <button className="order-card__btn order-card__btn--ghost" onClick={onDismiss}>
            {order.accepted ? 'ZERWIJ' : 'ODRZUĆ'}
          </button>
          {order.canAccept && (
            <button className="order-card__btn order-card__btn--accept" onClick={onAccept}>
              PRZYJMIJ
            </button>
          )}
          <button
            className={'order-card__btn order-card__btn--send' + (order.ready ? '' : ' order-card__btn--wait')}
            onClick={onSend}
          >
            WYDAJ ↗
          </button>
        </div>
      </div>
    </div>
  );
}
