import Modal from '../Modal/Modal';
import QtyStepper from '../QtyStepper/QtyStepper';
import './BuyModal.css';

const QUICK = [5, 10, 25];

export default function BuyModal({ open, item, qty, total, max, canBuy, reason, onMinus, onPlus, onAdd, onMax, onConfirm, onSell, onClose }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${item.icon} ${item.name}`}>
      <div className="buy-modal__facts">
        {item.facts.map((f) => (
          <div key={f.label} className="buy-modal__fact">
            <b>{f.value}</b>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <QtyStepper label="Ilość" value={qty} onMinus={onMinus} onPlus={onPlus} />
      <div className="buy-modal__quick">
        {QUICK.map((n) => (
          <button key={n} className="buy-modal__quick-btn" onClick={() => onAdd(n)}>
            +{n}
          </button>
        ))}
        <button className="buy-modal__quick-btn" onClick={onMax}>
          MAKS ({max})
        </button>
      </div>

      <div className="buy-modal__hint">
        {item.have} na stanie · dostawa z hurtowni za {item.delivery}
      </div>

      <button className="buy-modal__confirm-btn" disabled={!canBuy} onClick={onConfirm}>
        {canBuy ? `KUP ${qty} SZT. · ${total}` : reason}
      </button>

      {item.have > 0 && (
        <div className="buy-modal__sell">
          <span>Odsprzedaż: {item.sellPrice}/szt.</span>
          <button className="buy-modal__sell-btn" onClick={() => onSell(1)}>
            SPRZEDAJ 1
          </button>
          <button className="buy-modal__sell-btn" onClick={() => onSell(item.have)}>
            WSZYSTKIE
          </button>
        </div>
      )}
    </Modal>
  );
}
