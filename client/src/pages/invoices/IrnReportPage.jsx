import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FormSelect from '../../components/common/FormSelect';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import invoiceService from '../../services/invoice.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const IRN_STATUS_OPTIONS = ['NOT_GENERATED', 'GENERATED', 'FAILED', 'CANCELLED'];

export default function IrnReportPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [irnStatus, setIrnStatus] = useState('GENERATED');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await invoiceService.list({ search: debouncedSearch, irnStatus: irnStatus || undefined, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, irnStatus, page, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="IRN Report" breadcrumb={[{ label: 'Invoices', to: '/invoices' }, { label: 'IRN Report' }]} subtitle="Every invoice's GST e-Invoice IRN status" />

      <div className="filter-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="filter-panel__grid">
          <SearchInput value={search} onChange={setSearch} placeholder="Search invoice no…" />
          <FormSelect label="IRN Status" options={IRN_STATUS_OPTIONS} value={irnStatus} onChange={(e) => setIrnStatus(e.target.value)} containerClassName="mb-0" />
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'invoiceNo', header: 'Invoice No', render: (r) => r.invoiceNo },
          { key: 'client', header: 'Client', render: (r) => r.clientId?.name || '-' },
          { key: 'amount', header: 'Amount', align: 'right', render: (r) => formatCurrency(r.amount) },
          { key: 'irnStatus', header: 'IRN Status', render: (r) => <StatusBadge status={r.irnStatus} /> },
          { key: 'irn', header: 'IRN', render: (r) => (r.irn ? <code style={{ fontSize: 11 }}>{r.irn.slice(0, 16)}…</code> : '-') },
          { key: 'irnAckNo', header: 'Ack No', render: (r) => r.irnAckNo || '-' },
          { key: 'irnGeneratedAt', header: 'Generated At', render: (r) => (r.irnGeneratedAt ? formatDate(r.irnGeneratedAt) : '-') },
          { key: 'irnProvider', header: 'Provider', render: (r) => r.irnProvider || '-' },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No invoices found"
        emptyDescription="Adjust the IRN status filter, or generate an IRN from the Generate IRN page."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
