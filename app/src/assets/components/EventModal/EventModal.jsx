import './EventModal.css';

export default function EventModal({ event, choices, onChoose, onClose }) {
  if (!event) return null;
  return (
    <div className="event-modal">
      <div className="event-modal__card">
        <div className="event-modal__icon">{event.icon}</div>
        <div className="event-modal__kicker">ZDARZENIE</div>
        <div className="event-modal__title">{event.title}</div>
        {event.result ? (
          <>
            <div className="event-modal__text">{event.result}</div>
            <button className="event-modal__choice event-modal__choice--ok" onClick={onClose}>
              <span className="event-modal__choice-label">Dalej</span>
            </button>
          </>
        ) : (
          <>
            <div className="event-modal__text">{event.text}</div>
            {choices.map((c, i) => (
              <button key={i} className="event-modal__choice" onClick={() => onChoose(i)}>
                <span className="event-modal__choice-label">{c.label}</span>
                {c.hint && <span className="event-modal__choice-hint">{c.hint}</span>}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
