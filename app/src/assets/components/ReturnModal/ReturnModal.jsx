import Modal from '../Modal/Modal';
import QtyStepper from '../QtyStepper/QtyStepper';
import './ReturnModal.css';

export default function ReturnModal({
  open,
  itemName,
  who,
  qtyMax,
  qty,
  dmg,
  onRetMinus,
  onRetPlus,
  onDmgMinus,
  onDmgPlus,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Przyjmij zwrot">
      <div className="return-modal__summary">
        <div className="return-modal__summary-name">{itemName}</div>
        <div className="return-modal__summary-meta">
          {who} · wydano {qtyMax} szt.
        </div>
      </div>

      <QtyStepper label="Wraca" value={qty} onMinus={onRetMinus} onPlus={onRetPlus} />
      <QtyStepper
        label="Uszkodzone"
        value={dmg}
        onMinus={onDmgMinus}
        onPlus={onDmgPlus}
        danger
      />

      <div className="return-modal__hint">
        Uszkodzone sztuki trafią do zakładki Usterki jako „w naprawie”.
      </div>

      <button className="return-modal__confirm-btn" onClick={onConfirm}>
        PRZYJMIJ NA MAGAZYN
      </button>
    </Modal>
  );
}
