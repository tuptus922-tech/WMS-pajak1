import Modal from '../Modal/Modal';
import './DispatchModal.css';

export default function DispatchModal({ open, order, vehicles, plan, onToggle, onAuto, onConfirm, onBuyMissing, onClose }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="Wydaj sprzęt">
      <div className="dispatch-modal__summary">
        <div className="dispatch-modal__client">
          {order.icon} {order.client}
        </div>
        <div className="dispatch-modal__meta">
          📍 {order.place} · {order.km} km · {order.info}
        </div>
        <div className="dispatch-modal__lines">
          {order.lines.map((ln) => (
            <div key={ln.id} className={'dispatch-modal__line' + (ln.ok ? '' : ' dispatch-modal__line--missing')}>
              <span>
                {ln.icon} {ln.qty}× {ln.name}
              </span>
              <span>{ln.ok ? '✓ na stanie' : `brakuje ${ln.qty - ln.have}`}</span>
            </div>
          ))}
        </div>
        {plan.missingCost && (
          <button className="dispatch-modal__buy-btn" onClick={onBuyMissing}>
            DOKUP BRAKI · {plan.missingCost}
          </button>
        )}
      </div>

      <div>
        <div className="dispatch-modal__section">
          <span>Czym jedziemy?</span>
          <button className="dispatch-modal__auto" onClick={onAuto}>
            dobierz automatycznie
          </button>
        </div>
        <div className="dispatch-modal__vehicles">
          {vehicles.map((v) => (
            <button
              key={v.uid}
              className={
                'dispatch-modal__vehicle' +
                (v.selected ? ' dispatch-modal__vehicle--selected' : '') +
                (v.disabled ? ' dispatch-modal__vehicle--disabled' : '')
              }
              disabled={v.disabled}
              onClick={() => onToggle(v.uid)}
            >
              <span className="dispatch-modal__vehicle-icon">{v.icon}</span>
              <span className="dispatch-modal__vehicle-name">{v.name}</span>
              <span className="dispatch-modal__vehicle-note">{v.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dispatch-modal__plan">
        <div className={plan.capOk ? '' : 'dispatch-modal__plan--bad'}>
          <b>
            {plan.vol}/{plan.cap}
          </b>
          <span>ładunek / ładowność</span>
        </div>
        <div className={plan.timeOk ? '' : 'dispatch-modal__plan--bad'}>
          <b>{plan.time}</b>
          <span>dojazd (termin {plan.deadline})</span>
        </div>
        <div>
          <b>{plan.fuel}</b>
          <span>paliwo w obie strony</span>
        </div>
      </div>

      <button className="dispatch-modal__confirm-btn" disabled={!plan.ok} onClick={onConfirm}>
        {plan.ok ? `WYDAJ I WYŚLIJ · +${order.payout}` : plan.reason}
      </button>
    </Modal>
  );
}
