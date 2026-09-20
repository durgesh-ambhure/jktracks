import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants';

export default function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  if (!total) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <div className="pagination">
      <div className="text-sm text-muted">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </div>
      <div className="flex items-center gap-3">
        {onLimitChange && (
          <select
            className="form-control"
            style={{ width: 90 }}
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        )}
        <div className="pagination__pages">
          <button
            type="button"
            className="pagination__btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`pagination__btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            className="pagination__btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
