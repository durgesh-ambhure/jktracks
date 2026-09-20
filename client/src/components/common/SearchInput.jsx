import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search…', ...rest }) {
  return (
    <div className="search-input">
      <Search size={16} />
      <input
        type="text"
        className="form-control"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}
