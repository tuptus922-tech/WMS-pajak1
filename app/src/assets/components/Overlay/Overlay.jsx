import './Overlay.css';

const CONFETTI = Array.from({ length: 28 }, (_, i) => i);

// Wyśrodkowana plansza na cały ekran gry: awans, raport tygodnia, powitanie.
export default function Overlay({ icon, kicker, title, children, buttonLabel = 'Dalej', onClose, confetti }) {
  return (
    <div className="overlay">
      {confetti && (
        <div className="overlay__confetti">
          {CONFETTI.map((i) => (
            <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.12}s` }} className={'overlay__bit overlay__bit--' + (i % 4)} />
          ))}
        </div>
      )}
      <div className="overlay__card">
        {icon && <div className="overlay__icon">{icon}</div>}
        {kicker && <div className="overlay__kicker">{kicker}</div>}
        <div className="overlay__title">{title}</div>
        <div className="overlay__content">{children}</div>
        <button className="overlay__btn" onClick={onClose}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
