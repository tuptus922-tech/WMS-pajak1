import './AddItemForm.css';

export default function AddItemForm({
  open,
  name,
  category,
  qty,
  onChangeName,
  onChangeCategory,
  onChangeQty,
  onToggle,
  onSubmit,
}) {
  return (
    <>
      <button className="add-item-form__toggle" onClick={onToggle}>
        + Dodaj nowy przedmiot
      </button>
      {open && (
        <div className="add-item-form">
          <input
            className="add-item-form__input"
            value={name}
            onChange={onChangeName}
            placeholder="Nazwa (np. Kapok dziecięcy)"
          />
          <div className="add-item-form__row">
            <input
              className="add-item-form__input add-item-form__input--flex"
              value={category}
              onChange={onChangeCategory}
              placeholder="Kategoria"
            />
            <input
              className="add-item-form__input add-item-form__input--qty"
              value={qty}
              onChange={onChangeQty}
              placeholder="Ilość"
              type="number"
            />
          </div>
          <button className="add-item-form__submit" onClick={onSubmit}>
            Dodaj do magazynu
          </button>
        </div>
      )}
    </>
  );
}
