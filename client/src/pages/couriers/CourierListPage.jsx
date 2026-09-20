import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, KeyRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import courierService from '../../services/courier.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';

export default function CourierListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('couriers.create');
  const canUpdate = usePermission('couriers.update');
  const canDelete = usePermission('couriers.delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const res = await courierService.list({ search: debouncedSearch, page, limit });
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await courierService.remove(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'vendorCode', header: 'Code' },
    { key: 'name', header: 'Name', render: (r) => <a href={`/couriers/${r._id}`} onClick={(e) => { e.preventDefault(); navigate(`/couriers/${r._id}`); }}>{r.name}</a> },
    { key: 'trackingEnabled', header: 'Tracking API', render: (r) => (r.trackingEnabled ? <span className="badge badge-green">Enabled</span> : <span className="badge badge-gray">Disabled</span>) },
    {
      key: 'apiKey',
      header: 'API Key',
      render: (r) =>
        r.hasApiKey === false ? (
          <span className="text-sm text-muted">Not configured</span>
        ) : (
          <span className="flex items-center gap-1 text-sm"><KeyRound size={13} /> Configured</span>
        ),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="View" onClick={() => navigate(`/couriers/${r._id}`)}><Eye size={15} /></button>
          {canUpdate && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Edit" onClick={() => navigate(`/couriers/${r._id}/edit`)}><Pencil size={15} /></button>}
          {canDelete && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendor Master"
        subtitle="Manage courier vendors, service types and API integration status"
        actions={canCreate && <button type="button" className="btn btn-primary" onClick={() => navigate('/couriers/create')}><Plus size={15} /> New Vendor</button>}
      />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" />
      </div>

      <DataTable columns={columns} rows={state.rows} loading={state.loading} error={state.error} onRetry={load} keyField="_id" emptyTitle="No vendors found" emptyDescription="Add your first courier vendor to get started." />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Vendor"
        danger
        loading={deleting}
        message={`Delete vendor "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
