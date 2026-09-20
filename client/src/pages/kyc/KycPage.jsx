import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { kycService } from '../../services/generic.service';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

export default function KycPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [state, setState] = useState({ loading: true, error: '', rows: [] });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await kycService.list({ search: debouncedSearch });
      setState({ loading: false, error: '', rows: res.data || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [] });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="KYC" subtitle="Document capture and verification status per shipment/customer" />
      <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
        Document upload &amp; verification workflow — Tier-2 placeholder. This list backs onto
        the generic /api/v1/kyc collection.
      </div>
      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by AWB or client…" />
      </div>
      <DataTable
        columns={[
          { key: 'reference', header: 'Reference', render: (r) => r.awbNo || r.clientCode || r._id },
          { key: 'docType', header: 'Document Type' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status || 'PENDING'} /> },
          { key: 'submittedOn', header: 'Submitted On', render: (r) => formatDate(r.createdAt) },
        ]}
        rows={state.rows}
        loading={state.loading}
        error={state.error}
        onRetry={load}
        keyField="_id"
        emptyTitle="No KYC records yet"
      />
    </div>
  );
}
