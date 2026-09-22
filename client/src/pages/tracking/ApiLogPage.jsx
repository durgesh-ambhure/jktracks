import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { vendorApiLogService } from '../../services/rateCard.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { formatDate } from '../../utils/formatters';

/**
 * Real log of every outbound vendor API call — written from shipmentForwarding.service.js
 * (see VendorApiLog.js) each time a shipment is forwarded to a courier. Empty until at least
 * one shipment has been forwarded.
 */
export default function ApiLogPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await vendorApiLogService.list({ search: debouncedSearch, page, limit, sort: '-createdAt' });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="API Request/Response Log" subtitle="Vendor API calls made while forwarding shipments" />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search AWB, vendor, action…" />
      </div>

      <DataTable
        columns={[
          { key: 'createdAt', header: 'When', render: (r) => formatDate(r.requestAt || r.createdAt) },
          { key: 'awbNo', header: 'AWB No', render: (r) => r.awbNo || '-' },
          { key: 'vendorCode', header: 'Vendor', render: (r) => r.vendorCode || '-' },
          { key: 'action', header: 'Action', render: (r) => r.action },
          { key: 'success', header: 'Result', render: (r) => <span className={`badge badge-${r.success ? 'green' : 'red'}`}>{r.success ? 'Success' : 'Failed'}</span> },
          { key: 'durationMs', header: 'Duration', align: 'right', render: (r) => (r.durationMs != null ? `${r.durationMs} ms` : '-') },
          { key: 'errorMessage', header: 'Error', render: (r) => r.errorMessage || '-' },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No vendor API calls logged yet"
        emptyDescription="Forward a shipment to a courier to see request/response logs here."
      />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}
    </div>
  );
}
