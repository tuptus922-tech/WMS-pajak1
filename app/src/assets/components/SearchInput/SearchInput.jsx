import './SearchInput.css';

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      className="search-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
