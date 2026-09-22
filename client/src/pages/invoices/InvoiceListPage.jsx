import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import invoiceService from '../../services/invoice.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('invoices.create');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await invoiceService.list({ search: debouncedSearch, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Generated client bills"
        actions={canCreate && <button type="button" className="btn btn-primary" onClick={() => navigate('/invoices/create')}><Plus size={15} /> Generate Bill</button>}
      />
      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoice no, client…" />
      </div>
      <DataTable
        columns={[
          { key: 'invoiceNo', header: 'Invoice No', render: (r) => <a href={`/invoices/${r._id}`} onClick={(e) => { e.preventDefault(); navigate(`/invoices/${r._id}`); }}>{r.invoiceNo || r._id}</a> },
          { key: 'invoiceType', header: 'Type', render: (r) => r.invoiceType || 'STANDARD' },
          { key: 'client', header: 'Client', render: (r) => r.clientId?.name || '-' },
          { key: 'invoiceDate', header: 'Date', render: (r) => formatDate(r.invoiceDate || r.createdAt) },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'GENERATED'} /> },
          { key: 'actions', header: '', align: 'right', render: (r) => <button type="button" className="btn btn-ghost btn-sm btn-icon-only" onClick={() => navigate(`/invoices/${r._id}`)}><Eye size={15} /></button> },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No invoices generated yet"
        emptyDescription="Generate your first client bill from a date range of shipments."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
