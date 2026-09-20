import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

/**
 * columns: [{ key, header, render?: (row) => node, align?: 'left'|'right'|'center', width? }]
 */
export default function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  keyField = '_id',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="data-table-wrap">
        <LoadingSpinner label="Loading records…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-wrap">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="data-table-wrap">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="data-table-wrap">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width, textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'col-actions' : ''}
                    style={{ textAlign: col.align }}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
