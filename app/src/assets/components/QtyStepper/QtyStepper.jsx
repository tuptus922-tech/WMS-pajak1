import './QtyStepper.css';

export default function QtyStepper({ label, value, onMinus, onPlus, danger }) {
  return (
    <div className="qty-stepper">
      <span
        className={
          'qty-stepper__label' + (danger ? ' qty-stepper__label--danger' : '')
        }
      >
        {label}
      </span>
      <button className="qty-stepper__btn" onClick={onMinus}>
        −
      </button>
      <span
        className={
          'qty-stepper__value' + (danger ? ' qty-stepper__value--danger' : '')
        }
      >
        {value}
      </span>
      <button className="qty-stepper__btn" onClick={onPlus}>
        +
      </button>
    </div>
  );
}
