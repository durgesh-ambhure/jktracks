import { Filter, X } from 'lucide-react';

export default function FilterPanel({ children, onApply, onClear }) {
  return (
    <div className="filter-panel">
      <div className="flex items-center gap-2 text-sm fw-semibold" style={{ marginBottom: 12 }}>
        <Filter size={15} /> Filters
      </div>
      <div className="filter-panel__grid">{children}</div>
      <div className="filter-panel__actions">
        {onApply && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onApply}>
            Apply
          </button>
        )}
        {onClear && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>
            <X size={14} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
