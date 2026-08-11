import SearchInput from '../../components/SearchInput/SearchInput';
import Chip from '../../components/Chip/Chip';
import ItemCard from '../../components/ItemCard/ItemCard';
import AddItemForm from '../../components/AddItemForm/AddItemForm';
import './MagazynPage.css';

export default function MagazynPage({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onPickCategory,
  items,
  onIssueItem,
  isAdmin,
  addOpen,
  addName,
  addCategory,
  addQty,
  onToggleAdd,
  onChangeAddName,
  onChangeAddCategory,
  onChangeAddQty,
  onSubmitAdd,
}) {
  return (
    <div className="magazyn-page">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder="Szukaj, np. lateks…"
      />
      <div className="magazyn-page__chips">
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={c === activeCategory}
            onClick={() => onPickCategory(c)}
          />
        ))}
      </div>
      <div className="magazyn-page__list">
        {items.map((it) => (
          <ItemCard key={it.id} item={it} onIssue={() => onIssueItem(it)} />
        ))}
      </div>
      {isAdmin && (
        <AddItemForm
          open={addOpen}
          name={addName}
          category={addCategory}
          qty={addQty}
          onToggle={onToggleAdd}
          onChangeName={onChangeAddName}
          onChangeCategory={onChangeAddCategory}
          onChangeQty={onChangeAddQty}
          onSubmit={onSubmitAdd}
        />
      )}
    </div>
  );
}
