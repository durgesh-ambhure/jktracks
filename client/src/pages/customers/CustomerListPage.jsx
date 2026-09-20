import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterPanel from '../../components/common/FilterPanel';
import FormSelect from '../../components/common/FormSelect';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import customerService from '../../services/customer.service';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import { usePermission } from '../../hooks/usePermission';

export default function CustomerListPage() {
  const navigate = useNavigate();
  const canCreate = usePermission('customers.create');
  const canUpdate = usePermission('customers.update');
  const canDelete = usePermission('customers.delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState('');
  const { page, limit, setPage, setLimit } = usePagination();
  const [state, setState] = useState({ loading: true, error: '', rows: [], pagination: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const params = { search: debouncedSearch, status, page, limit };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await customerService.list(params);
      setState({ loading: false, error: '', rows: res.data || [], pagination: res.pagination });
    } catch (err) {
      setState({ loading: false, error: err.message, rows: [], pagination: null });
    }
  }, [debouncedSearch, status, page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await customerService.remove(deleteTarget._id);
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
    { key: 'clientCode', header: 'Code' },
    { key: 'name', header: 'Name', render: (r) => <a href={`/customers/${r._id}`} onClick={(e) => { e.preventDefault(); navigate(`/customers/${r._id}`); }}>{r.name}</a> },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <div className="flex gap-1 justify-end">
          <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="View" onClick={() => navigate(`/customers/${r._id}`)}><Eye size={15} /></button>
          {canUpdate && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Edit" onClick={() => navigate(`/customers/${r._id}/edit`)}><Pencil size={15} /></button>}
          {canDelete && <button type="button" className="btn btn-ghost btn-sm btn-icon-only" title="Delete" onClick={() => setDeleteTarget(r)}><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Client Master"
        subtitle="Manage customer accounts, credit terms and tax details"
        actions={canCreate && <button type="button" className="btn btn-primary" onClick={() => navigate('/customers/create')}><Plus size={15} /> New Client</button>}
      />

      <div style={{ marginBottom: 'var(--space-4)', maxWidth: 360 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, code, email…" />
      </div>

      <FilterPanel onClear={() => setStatus('')}>
        <FormSelect label="Status" options={['ACTIVE', 'INACTIVE']} value={status} onChange={(e) => setStatus(e.target.value)} />
      </FilterPanel>

      <DataTable columns={columns} rows={state.rows} loading={state.loading} error={state.error} onRetry={load} keyField="_id" emptyTitle="No clients found" emptyDescription="Add your first client to get started." />
      {state.pagination && (
        <Pagination page={state.pagination.page} totalPages={state.pagination.totalPages} total={state.pagination.total} limit={state.pagination.limit} onPageChange={setPage} onLimitChange={setLimit} />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Client"
        danger
        loading={deleting}
        message={`Delete client "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
