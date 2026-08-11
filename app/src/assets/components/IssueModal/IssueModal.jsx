import Modal from '../Modal/Modal';
import Chip from '../Chip/Chip';
import QtyStepper from '../QtyStepper/QtyStepper';
import './IssueModal.css';

export default function IssueModal({
  open,
  step,
  query,
  onQueryChange,
  candidates,
  onPickCandidate,
  itemName,
  itemAvail,
  qty,
  onQtyMinus,
  onQtyPlus,
  whoOptions,
  who,
  onPickWho,
  onWhoChange,
  disabled,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Wydaj sprzęt">
      {step === 1 && (
        <>
          <input
            className="issue-modal__search"
            value={query}
            onChange={onQueryChange}
            placeholder="Szukaj przedmiotu…"
          />
          <div className="issue-modal__candidates">
            {candidates.map((c) => (
              <button
                key={c.id}
                className="issue-modal__candidate"
                onClick={() => onPickCandidate(c)}
              >
                <span className="issue-modal__candidate-name">{c.name}</span>
                <span className="issue-modal__candidate-avail">
                  {c.avail} dost.
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="issue-modal__selected">
            {itemName}{' '}
            <span className="issue-modal__selected-avail">
              · {itemAvail} dostępne
            </span>
          </div>
          <QtyStepper
            label="Ilość"
            value={qty}
            onMinus={onQtyMinus}
            onPlus={onQtyPlus}
          />
          <div>
            <div className="issue-modal__who-title">Komu wydajesz?</div>
            <div className="issue-modal__who-chips">
              {whoOptions.map((w) => (
                <Chip
                  key={w}
                  label={w}
                  active={w === who}
                  onClick={() => onPickWho(w)}
                />
              ))}
            </div>
            <input
              className="issue-modal__who-input"
              value={who}
              onChange={onWhoChange}
              placeholder="…albo wpisz (np. Drużyna 12 WDH)"
            />
          </div>
          <button
            className="issue-modal__confirm-btn"
            disabled={disabled}
            onClick={onConfirm}
          >
            WYDAJ {qty} SZT.
          </button>
        </>
      )}
    </Modal>
  );
}
